//! Redis-backed sliding-window rate limiting per (IP or user_id).

use crate::{error::GatewayError, state::AppState};
use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};
use bb8_redis::redis::AsyncCommands;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tracing::warn;

pub async fn rate_limit(
    State(state): State<Arc<AppState>>,
    req: Request,
    next: Next,
) -> Result<Response, GatewayError> {
    // Skip rate limiting for health/metrics
    let path = req.uri().path();
    if path == "/health" || path == "/metrics" {
        return Ok(next.run(req).await);
    }

    // Key = user_id if authed, else IP
    let key = req.extensions()
        .get::<crate::auth::CerebroClaims>()
        .map(|c| format!("rl:user:{}", c.sub))
        .or_else(|| {
            req.headers()
                .get("x-forwarded-for")
                .and_then(|h| h.to_str().ok())
                .map(|ip| format!("rl:ip:{}", ip.split(',').next().unwrap_or(ip).trim()))
        })
        .unwrap_or_else(|| "rl:anon".to_string());

    let window_secs = 60u64;
    let max_requests = state.config.rate_limit_rps as u64 * window_secs;
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    let window_key = format!("{}:{}", key, now / window_secs);

    let mut conn = state.redis.get().await
        .map_err(|e| GatewayError::Internal(format!("Redis: {e}")))?;

    let count: u64 = conn.incr(&window_key, 1u64).await
        .map_err(|e| GatewayError::Internal(format!("Redis INCR: {e}")))?;

    if count == 1 {
        let _: () = conn.expire(&window_key, window_secs as i64).await
            .map_err(|e| GatewayError::Internal(format!("Redis EXPIRE: {e}")))?;
    }

    if count > max_requests {
        warn!(key, count, limit = max_requests, "Rate limit exceeded");
        return Err(GatewayError::RateLimited);
    }

    Ok(next.run(req).await)
}
