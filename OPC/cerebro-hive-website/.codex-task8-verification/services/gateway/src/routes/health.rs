use axum::{Json, Router, routing::get};
use serde_json::{json, Value};

pub fn router() -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/ready", get(ready))
}

async fn health() -> Json<Value> {
    Json(json!({ "status": "ok", "service": "cerebro-gateway" }))
}

async fn ready() -> Json<Value> {
    Json(json!({ "status": "ready" }))
}
