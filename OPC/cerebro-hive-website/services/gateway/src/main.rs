use anyhow::Result;
use axum::{middleware, Router, routing::any};
use std::{net::SocketAddr, sync::Arc};
use tokio::net::TcpListener;
use tower_http::{
    compression::CompressionLayer,
    cors::{AllowOrigin, CorsLayer},
    request_id::{MakeRequestUuid, PropagateRequestIdLayer, SetRequestIdLayer},
    trace::TraceLayer,
};
use tracing::info;

mod auth;
mod config;
mod error;
mod middleware;
use crate::middleware as mw;
mod routes;
mod state;

use config::Config;
use routes::proxy::{forward, ProxyTarget};
use state::AppState;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive("cerebro_gateway=debug".parse()?)
                .add_directive("tower_http=info".parse()?),
        )
        .json()
        .init();

    dotenvy::dotenv().ok();
    let cfg = Config::from_env()?;
    let state = Arc::new(AppState::new(&cfg).await?);

    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::list(cfg.allowed_origins()))
        .allow_methods(tower_http::cors::Any)
        .allow_headers(tower_http::cors::Any)
        .max_age(std::time::Duration::from_secs(86400));

    // ── Route table ─────────────────────────────────────────────────────────
    // Public routes (no auth required)
    let public = Router::new()
        .route("/health", axum::routing::get(routes::health::health))
        .route("/ready",  axum::routing::get(routes::health::ready));

    // Macro-style proxy builder: (prefix, downstream base URL)
    let platform_url = cfg.platform_svc_url.clone();
    let academy_url  = cfg.academy_svc_url.clone();
    let crm_url      = cfg.crm_svc_url.clone();
    let platform_ts  = cfg.platform_api_url.clone();
    let forge_ts     = cfg.forge_api_url.clone();

    let protected = Router::new()
        // Java services
        .nest("/api/v1/platform",  proxy_router(state.clone(), platform_url))
        .nest("/api/v1/academy",   proxy_router(state.clone(), academy_url))
        .nest("/api/v1/crm",       proxy_router(state.clone(), crm_url))
        // Existing TypeScript services
        .nest("/api/v1/workflows", proxy_router(state.clone(), platform_ts.clone()))
        .nest("/api/v1/agents",    proxy_router(state.clone(), platform_ts.clone()))
        .nest("/api/v1/knowledge", proxy_router(state.clone(), platform_ts.clone()))
        .nest("/api/v1/forge",     proxy_router(state.clone(), forge_ts))
        // Require JWT on all /api/v1/* routes
        .layer(middleware::from_fn_with_state(
            state.clone(),
            mw::auth::require_auth,
        ));

    let app = Router::new()
        .merge(public)
        .merge(protected)
        .layer(
            tower::ServiceBuilder::new()
                .layer(SetRequestIdLayer::x_request_id(MakeRequestUuid))
                .layer(PropagateRequestIdLayer::x_request_id())
                .layer(TraceLayer::new_for_http())
                .layer(CompressionLayer::new())
                .layer(cors)
                .layer(middleware::from_fn_with_state(
                    state.clone(),
                    mw::rate_limit::rate_limit,
                )),
        )
        .with_state(state.clone());

    let addr: SocketAddr = format!("{}:{}", cfg.host, cfg.port).parse()?;
    info!(%addr, "CerebroHive API Gateway listening");
    let listener = TcpListener::bind(addr).await?;
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

/// Creates a catch-all router that proxies every request to `base_url`.
fn proxy_router(state: Arc<AppState>, base_url: String) -> Router<Arc<AppState>> {
    // Separate owned copies for the second closure below. Both `.route()`
    // closures are `move`, and each needs its own capture of state/base_url
    // — the first closure takes ownership of the originals, so the second
    // one referencing the same identifiers again would not compile (this is
    // also almost certainly why the previous fix attempt here settled for
    // `String::new()` instead of a second `.clone()` on the same binding).
    let state_root    = state.clone();
    let base_url_root = base_url.clone();

    Router::new()
        .route("/{*path}", any(move |req: axum::extract::Request| {
            let state = state.clone();
            let base   = base_url.clone();
            async move {
                forward(&state, req, &base).await
            }
        }))
        .route("/", any(move |req: axum::extract::Request| {
            let state = state_root.clone();
            // Was `String::new()` — a placeholder that made every downstream
            // service's root path proxy to an empty base URL instead of the
            // real one (flagged in the original M25.4A audit, fixed here).
            let base   = base_url_root.clone();
            async move { forward(&state, req, &base).await }
        }))
}

async fn shutdown_signal() {
    use tokio::signal;
    let ctrl_c = async { signal::ctrl_c().await.expect("ctrl-c handler") };
    #[cfg(unix)]
    let term = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("SIGTERM handler")
            .recv()
            .await;
    };
    #[cfg(not(unix))]
    let term = std::future::pending::<()>();
    tokio::select! {
        _ = ctrl_c => info!("SIGINT received"),
        _ = term   => info!("SIGTERM received"),
    }
}

mod routes {
    pub mod health {
        use axum::Json;
        use serde_json::{json, Value};
        pub async fn health() -> Json<Value> { Json(json!({"status":"ok","service":"cerebro-gateway"})) }
        pub async fn ready()  -> Json<Value> { Json(json!({"status":"ready"})) }
    }
    pub mod proxy;
}

mod mw {
    pub mod auth;
    pub mod rate_limit;
}
