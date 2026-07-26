//! Reverse-proxy handler. Strips the route prefix, forwards to downstream service,
//! injects auth headers (X-User-Id, X-Org-Id, X-User-Role) for downstream trust.

use crate::{auth::CerebroClaims, error::GatewayError, state::AppState};
use axum::{
    body::Body,
    extract::{Path, Request, State},
    http::{HeaderMap, HeaderName, HeaderValue, Method, StatusCode},
    response::Response,
};
use std::sync::Arc;
use tracing::{error, info};

pub async fn proxy(
    State(state): State<Arc<AppState>>,
    req: Request,
) -> Result<Response<Body>, GatewayError> {
    // Extract downstream target from extension (set by router)
    let target_url = req.extensions()
        .get::<ProxyTarget>()
        .ok_or_else(|| GatewayError::Internal("No proxy target".into()))?
        .0.clone();

    forward(&state, req, &target_url).await
}

#[derive(Clone)]
pub struct ProxyTarget(pub String);

pub async fn forward(
    state: &AppState,
    req: Request,
    base_url: &str,
) -> Result<Response<Body>, GatewayError> {
    let uri = req.uri();
    let path_and_query = uri.path_and_query()
        .map(|pq| pq.as_str())
        .unwrap_or("/");
    let url = format!("{base_url}{path_and_query}");

    info!(url, method = %req.method(), "Proxying request");

    // Build upstream request
    let method = req.method().clone();
    let mut headers = req.headers().clone();

    // Inject trusted internal headers from JWT claims
    if let Some(claims) = req.extensions().get::<CerebroClaims>() {
        set_header(&mut headers, "x-user-id", &claims.sub);
        if let Some(org_id) = &claims.org_id {
            set_header(&mut headers, "x-org-id", org_id);
        }
        if let Some(org_role) = &claims.org_role {
            set_header(&mut headers, "x-org-role", org_role);
        }
        if let Some(email) = &claims.email {
            set_header(&mut headers, "x-user-email", email);
        }
    }

    // Remove hop-by-hop headers
    for h in &["connection", "upgrade", "proxy-authenticate", "proxy-authorization"] {
        headers.remove(*h);
    }

    let body_bytes = axum::body::to_bytes(req.into_body(), 10 * 1024 * 1024)
        .await
        .map_err(|e| GatewayError::BadRequest(e.to_string()))?;

    let upstream_req = state.http
        .request(method.clone(), &url)
        .headers(headers)
        .body(body_bytes)
        .build()
        .map_err(|e| GatewayError::Internal(e.to_string()))?;

    let upstream_resp = state.http.execute(upstream_req)
        .await
        .map_err(|e| {
            error!(url, error = %e, "Upstream request failed");
            GatewayError::BadGateway(format!("Upstream unavailable: {e}"))
        })?;

    let status = StatusCode::from_u16(upstream_resp.status().as_u16())
        .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);
    let resp_headers = upstream_resp.headers().clone();
    let resp_bytes = upstream_resp.bytes().await
        .map_err(|e| GatewayError::BadGateway(e.to_string()))?;

    let mut response = Response::builder().status(status);
    for (k, v) in &resp_headers {
        // Filter hop-by-hop
        if matches!(k.as_str(), "connection" | "transfer-encoding" | "keep-alive") { continue; }
        response = response.header(k, v);
    }

    response.body(Body::from(resp_bytes))
        .map_err(|e| GatewayError::Internal(e.to_string()))
}

fn set_header(headers: &mut HeaderMap, name: &'static str, value: &str) {
    if let Ok(v) = HeaderValue::from_str(value) {
        headers.insert(HeaderName::from_static(name), v);
    }
}
