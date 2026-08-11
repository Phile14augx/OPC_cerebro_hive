use axum::{http::StatusCode, response::{IntoResponse, Response}, Json};
use serde_json::json;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum GatewayError {
    #[error("Unauthorized: {0}")]
    Unauthorized(String),
    #[error("Forbidden: {0}")]
    Forbidden(String),
    #[error("Rate limit exceeded")]
    RateLimited,
    #[error("Bad gateway: {0}")]
    BadGateway(String),
    #[error("Service unavailable: {0}")]
    ServiceUnavailable(String),
    #[error("Bad request: {0}")]
    BadRequest(String),
    #[error("Not found")]
    NotFound,
    #[error("Internal error: {0}")]
    Internal(String),
}

impl IntoResponse for GatewayError {
    fn into_response(self) -> Response {
        let (status, code, message) = match &self {
            GatewayError::Unauthorized(m) => (StatusCode::UNAUTHORIZED, "UNAUTHORIZED", m.clone()),
            GatewayError::Forbidden(m) => (StatusCode::FORBIDDEN, "FORBIDDEN", m.clone()),
            GatewayError::RateLimited => (
                StatusCode::TOO_MANY_REQUESTS,
                "RATE_LIMITED",
                "Too many requests. Please slow down.".to_string(),
            ),
            GatewayError::BadGateway(m) => (StatusCode::BAD_GATEWAY, "BAD_GATEWAY", m.clone()),
            GatewayError::ServiceUnavailable(m) => (StatusCode::SERVICE_UNAVAILABLE, "SERVICE_UNAVAILABLE", m.clone()),
            GatewayError::BadRequest(m) => (StatusCode::BAD_REQUEST, "BAD_REQUEST", m.clone()),
            GatewayError::NotFound => (StatusCode::NOT_FOUND, "NOT_FOUND", "Resource not found".to_string()),
            GatewayError::Internal(m) => (StatusCode::INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", m.clone()),
        };

        let body = Json(json!({
            "error": { "code": code, "message": message }
        }));

        (status, body).into_response()
    }
}

impl From<anyhow::Error> for GatewayError {
    fn from(e: anyhow::Error) -> Self {
        GatewayError::Internal(e.to_string())
    }
}

pub type GatewayResult<T> = Result<T, GatewayError>;
