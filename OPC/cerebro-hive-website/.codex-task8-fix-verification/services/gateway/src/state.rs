use crate::{auth::TokenVerifier, config::Config};
use anyhow::Result;
use bb8_redis::{bb8::Pool, RedisConnectionManager};
use reqwest::Client;
use std::sync::Arc;
use tracing::info;

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub verifier: Arc<TokenVerifier>,
    pub redis: Pool<RedisConnectionManager>,
    pub http: Client,
}

impl AppState {
    pub async fn new(cfg: &Config) -> Result<Self> {
        // HTTP client for proxying
        let http = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .pool_max_idle_per_host(50)
            .build()?;

        // Redis pool for rate limiting + session state
        info!(url = %cfg.redis_url, "Connecting to Redis");
        let manager = RedisConnectionManager::new(cfg.redis_url.as_str())?;
        let redis = Pool::builder()
            .max_size(20)
            .build(manager)
            .await?;

        // Keycloak JWKS verifier
        let verifier = TokenVerifier::new(
            cfg.jwks_url(),
            cfg.token_issuer(),
            cfg.keycloak_client_id.clone(),
        );

        info!(jwks = %cfg.jwks_url(), "Keycloak JWKS verifier initialized");

        Ok(Self {
            config: Arc::new(cfg.clone()),
            verifier: Arc::new(verifier),
            redis,
            http,
        })
    }
}
