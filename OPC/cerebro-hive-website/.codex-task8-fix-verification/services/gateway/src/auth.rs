//! Keycloak JWT validation via JWKS — mirrors the TS @cerebro/auth package.
//! Validates RS256 tokens, extracts org_id / org_role custom claims.

use anyhow::{Context, Result};
use jsonwebtoken::{
    decode, decode_header, Algorithm, DecodingKey, TokenData, Validation,
};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    sync::{Arc, RwLock},
    time::{Duration, Instant},
};
use tracing::{debug, warn};

// ── Keycloak JWT Claims ───────────────────────────────────────────────────────

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RealmAccess {
    pub roles: Vec<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ResourceAccess {
    pub roles: Vec<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CerebroClaims {
    pub sub: String,
    pub email: Option<String>,
    pub name: Option<String>,
    pub preferred_username: Option<String>,
    pub realm_access: Option<RealmAccess>,
    pub resource_access: Option<HashMap<String, ResourceAccess>>,
    /// Custom Keycloak claim: org membership
    pub org_id: Option<String>,
    pub org_role: Option<String>,
    pub azp: Option<String>,
    pub iss: String,
    pub exp: i64,
    pub iat: i64,
}

impl CerebroClaims {
    pub fn realm_roles(&self) -> Vec<&str> {
        self.realm_access
            .as_ref()
            .map(|r| r.roles.iter().map(|s| s.as_str()).collect())
            .unwrap_or_default()
    }

    pub fn client_roles(&self, client_id: &str) -> Vec<&str> {
        self.resource_access
            .as_ref()
            .and_then(|ra| ra.get(client_id))
            .map(|r| r.roles.iter().map(|s| s.as_str()).collect())
            .unwrap_or_default()
    }

    pub fn is_system_admin(&self, client_id: &str) -> bool {
        self.realm_roles().contains(&"system-admin")
            || self.client_roles(client_id).contains(&"admin")
    }
}

// ── JWKS Cache ────────────────────────────────────────────────────────────────

#[derive(Clone)]
struct CachedKey {
    key: DecodingKey,
    fetched_at: Instant,
}

#[derive(Clone)]
pub struct JwksCache {
    keys: Arc<RwLock<HashMap<String, CachedKey>>>,
    jwks_url: String,
    ttl: Duration,
    client: reqwest::Client,
}

#[derive(Deserialize)]
struct JwksResponse {
    keys: Vec<JwkKey>,
}

#[derive(Deserialize)]
struct JwkKey {
    kid: String,
    #[serde(rename = "use")]
    key_use: Option<String>,
    kty: String,
    n: Option<String>,
    e: Option<String>,
}

impl JwksCache {
    pub fn new(jwks_url: String) -> Self {
        Self {
            keys: Arc::new(RwLock::new(HashMap::new())),
            jwks_url,
            ttl: Duration::from_secs(900), // 15 min
            client: reqwest::Client::new(),
        }
    }

    pub async fn get_key(&self, kid: &str) -> Result<DecodingKey> {
        // Fast path: key in cache and fresh
        {
            let keys = self.keys.read().unwrap();
            if let Some(cached) = keys.get(kid) {
                if cached.fetched_at.elapsed() < self.ttl {
                    debug!(kid, "JWKS cache hit");
                    return Ok(cached.key.clone());
                }
            }
        }

        // Slow path: refetch JWKS
        self.refresh().await?;

        let keys = self.keys.read().unwrap();
        keys.get(kid)
            .map(|c| c.key.clone())
            .with_context(|| format!("Unknown kid: {kid}"))
    }

    async fn refresh(&self) -> Result<()> {
        debug!(url = %self.jwks_url, "Fetching JWKS");
        let resp: JwksResponse = self.client.get(&self.jwks_url)
            .send().await?
            .json().await?;

        let now = Instant::now();
        let mut keys = self.keys.write().unwrap();
        for jwk in resp.keys {
            if jwk.key_use.as_deref() != Some("sig") { continue; }
            if jwk.kty != "RSA" { continue; }
            if let (Some(n), Some(e)) = (jwk.n, jwk.e) {
                match DecodingKey::from_rsa_components(&n, &e) {
                    Ok(key) => { keys.insert(jwk.kid, CachedKey { key, fetched_at: now }); }
                    Err(e) => warn!(error = %e, "Failed to parse JWKS key"),
                }
            }
        }
        Ok(())
    }
}

// ── Token Verifier ────────────────────────────────────────────────────────────

pub struct TokenVerifier {
    cache: JwksCache,
    issuer: String,
    audience: String,
}

impl TokenVerifier {
    pub fn new(jwks_url: String, issuer: String, audience: String) -> Self {
        Self { cache: JwksCache::new(jwks_url), issuer, audience }
    }

    pub async fn verify(&self, token: &str) -> Result<CerebroClaims> {
        // Decode header to get kid
        let header = decode_header(token)
            .context("Invalid JWT header")?;
        let kid = header.kid.context("JWT missing kid")?;

        let key = self.cache.get_key(&kid).await?;

        let mut validation = Validation::new(Algorithm::RS256);
        validation.set_issuer(&[&self.issuer]);
        validation.set_audience(&[&self.audience]);

        let data: TokenData<CerebroClaims> = decode(token, &key, &validation)
            .context("JWT verification failed")?;

        Ok(data.claims)
    }
}
