use anyhow::{Context, Result};
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub keycloak_url: String,
    pub keycloak_realm: String,
    pub keycloak_client_id: String,
    // Downstream service URLs
    pub platform_svc_url: String,
    pub academy_svc_url: String,
    pub crm_svc_url: String,
    pub ml_svc_grpc_url: String,
    pub platform_api_url: String,   // existing TS service
    pub forge_api_url: String,      // existing TS service
    // Infra
    pub database_url: String,
    pub redis_url: String,
    pub nats_url: String,
    // Rate limiting
    pub rate_limit_rps: u32,
    pub rate_limit_burst: u32,
    // CORS
    pub allowed_origins: Vec<String>,
    // Metrics
    pub metrics_port: u16,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        let keycloak_url = env_str("KEYCLOAK_SERVER_URL", "http://keycloak:8080");
        let keycloak_realm = env_str("KEYCLOAK_REALM", "cerebro-hive");

        Ok(Self {
            host: env_str("HOST", "0.0.0.0"),
            port: env_u16("PORT", 8080)?,
            keycloak_client_id: env_str("KEYCLOAK_CLIENT_ID", "cerebro-platform"),
            keycloak_url: keycloak_url.clone(),
            keycloak_realm: keycloak_realm.clone(),
            platform_svc_url: env_str("PLATFORM_SVC_URL", "http://platform-svc:3001"),
            academy_svc_url: env_str("ACADEMY_SVC_URL", "http://academy-svc:3002"),
            crm_svc_url: env_str("CRM_SVC_URL", "http://crm-svc:3003"),
            ml_svc_grpc_url: env_str("ML_SVC_GRPC_URL", "http://ml-svc:50051"),
            platform_api_url: env_str("PLATFORM_API_URL", "http://platform-api:4000"),
            forge_api_url: env_str("FORGE_API_URL", "http://forge-api:4001"),
            database_url: env_required("DATABASE_URL")?,
            redis_url: env_str("REDIS_URL", "redis://:redispassword123@redis:6379"),
            nats_url: env_str("NATS_URL", "nats://nats:4222"),
            rate_limit_rps: env_u32("RATE_LIMIT_RPS", 100),
            rate_limit_burst: env_u32("RATE_LIMIT_BURST", 200),
            allowed_origins: env_str("ALLOWED_ORIGINS", "http://localhost:3000,https://cerebro-hive.com")
                .split(',').map(String::from).collect(),
            metrics_port: env_u16("METRICS_PORT", 9090)?,
        })
    }

    pub fn jwks_url(&self) -> String {
        format!("{}/realms/{}/protocol/openid-connect/certs",
            self.keycloak_url, self.keycloak_realm)
    }

    pub fn token_issuer(&self) -> String {
        format!("{}/realms/{}", self.keycloak_url, self.keycloak_realm)
    }

    pub fn allowed_origins(&self) -> Vec<axum::http::HeaderValue> {
        self.allowed_origins.iter()
            .filter_map(|o| o.parse().ok())
            .collect()
    }
}

fn env_str(key: &str, default: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| default.to_string())
}

fn env_required(key: &str) -> Result<String> {
    std::env::var(key).with_context(|| format!("Missing required env var: {key}"))
}

fn env_u16(key: &str, default: u16) -> Result<u16> {
    match std::env::var(key) {
        Ok(v) => v.parse().with_context(|| format!("Invalid u16 for {key}")),
        Err(_) => Ok(default),
    }
}

fn env_u32(key: &str, default: u32) -> u32 {
    std::env::var(key)
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(default)
}
