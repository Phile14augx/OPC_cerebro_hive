//! JWT auth middleware. Validates Keycloak tokens, injects CerebroClaims into request extensions.

use crate::{error::GatewayError, state::AppState};
use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};
use std::sync::Arc;

/// Marker for authenticated requests.
pub type AuthClaims = crate::auth::CerebroClaims;

pub async fn require_auth(
    State(state): State<Arc<AppState>>,
    mut req: Request,
    next: Next,
) -> Result<Response, GatewayError> {
    let token = extract_bearer(req.headers())
        .ok_or_else(|| GatewayError::Unauthorized("Missing Bearer token".into()))?;

    let claims = state.verifier.verify(token)
        .await
        .map_err(|e| GatewayError::Unauthorized(e.to_string()))?;

    req.extensions_mut().insert(claims);
    Ok(next.run(req).await)
}

pub async fn optional_auth(
    State(state): State<Arc<AppState>>,
    mut req: Request,
    next: Next,
) -> Response {
    if let Some(token) = extract_bearer(req.headers()) {
        if let Ok(claims) = state.verifier.verify(token).await {
            req.extensions_mut().insert(claims);
        }
    }
    next.run(req).await
}

fn extract_bearer(headers: &axum::http::HeaderMap) -> Option<&str> {
    headers.get("authorization")?.to_str().ok()?.strip_prefix("Bearer ")
}
