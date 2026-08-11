/**
 * LinkedIn OAuth 2.0 — 3-legged authorization code flow
 *
 * Usage:
 *   npx tsx src/auth/linkedin-oauth.ts
 *
 * What it does:
 *   1. Starts a local HTTP server on port 3456
 *   2. Opens your browser to the LinkedIn consent page
 *   3. LinkedIn redirects back with ?code=...
 *   4. Exchanges the code for an access token
 *   5. Saves the token + expiry to services/contentops/.env
 *   6. Shuts down the server
 */

import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

// ── Config ────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, "../../.env");

const REDIRECT_PORT = 3456;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";

// Scopes required for posting
const SCOPES = ["openid", "profile", "w_member_social"].join(" ");

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(`
❌  Missing LinkedIn app credentials.

Set these in your .env before running this script:
  LINKEDIN_CLIENT_ID=your_client_id
  LINKEDIN_CLIENT_SECRET=your_client_secret

Get them from: https://www.linkedin.com/developers/apps
`);
    process.exit(1);
  }

  return { clientId, clientSecret };
}

/** Update or insert a key=value pair in the .env file */
async function upsertEnvVar(key: string, value: string): Promise<void> {
  let content = "";
  try {
    content = await fs.readFile(ENV_PATH, "utf-8");
  } catch {
    // .env doesn't exist yet — start fresh
  }

  const lines = content.split("\n");
  const keyPrefix = `${key}=`;
  const existingIndex = lines.findIndex((l) => l.startsWith(keyPrefix));

  if (existingIndex >= 0) {
    lines[existingIndex] = `${key}=${value}`;
  } else {
    lines.push(`${key}=${value}`);
  }

  await fs.writeFile(ENV_PATH, lines.join("\n"), "utf-8");
}

/** Open a URL in the default browser (cross-platform) */
async function openBrowser(url: string): Promise<void> {
  const { execSync } = await import("node:child_process");
  const platform = process.platform;
  try {
    if (platform === "win32") execSync(`start "" "${url}"`);
    else if (platform === "darwin") execSync(`open "${url}"`);
    else execSync(`xdg-open "${url}"`);
  } catch {
    // If auto-open fails, the user will see the URL printed to console
  }
}

// ── Token exchange ────────────────────────────────────────────────────────────

interface TokenResponse {
  access_token: string;
  expires_in: number; // seconds
  token_type: string;
}

async function exchangeCodeForToken(
  code: string,
  state: string,
  expectedState: string,
  clientId: string,
  clientSecret: string
): Promise<TokenResponse> {
  if (state !== expectedState) {
    throw new Error("State mismatch — possible CSRF attack. Aborting.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${text}`);
  }

  return (await response.json()) as TokenResponse;
}

// ── Fetch person URN ──────────────────────────────────────────────────────────

async function fetchPersonUrn(accessToken: string): Promise<string> {
  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Could not fetch userinfo: ${response.status}`);
  }

  const data = (await response.json()) as { sub: string; name?: string };
  console.log(`\n✔ Authenticated as: ${data.name ?? data.sub}`);
  return `urn:li:person:${data.sub}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { clientId, clientSecret } = getCredentials();

  // Generate a random state value to prevent CSRF
  const state = crypto.randomBytes(16).toString("hex");

  const authUrl =
    `${LINKEDIN_AUTH_URL}?` +
    new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      state,
    }).toString();

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║  LinkedIn OAuth 2.0 — Authorization Flow ║");
  console.log("╚══════════════════════════════════════════╝\n");
  console.log("Starting local callback server on port", REDIRECT_PORT, "...");
  console.log("\nOpening LinkedIn consent page in your browser...");
  console.log("If the browser doesn't open, visit this URL manually:\n");
  console.log(authUrl + "\n");

  await openBrowser(authUrl);

  // Start local server to receive the callback
  await new Promise<void>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (!req.url?.startsWith("/callback")) return;

      const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
      const code = url.searchParams.get("code");
      const returnedState = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      if (error) {
        const msg = url.searchParams.get("error_description") ?? error;
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(htmlPage("Authorization Failed", `<p style="color:red">${msg}</p>`));
        server.close();
        reject(new Error(`LinkedIn denied access: ${msg}`));
        return;
      }

      if (!code || !returnedState) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(htmlPage("Bad Request", "<p>Missing code or state parameter.</p>"));
        server.close();
        reject(new Error("Missing code or state in callback"));
        return;
      }

      try {
        console.log("Received authorization code. Exchanging for access token...");

        const token = await exchangeCodeForToken(
          code,
          returnedState,
          state,
          clientId,
          clientSecret
        );

        const expiresAt = new Date(
          Date.now() + token.expires_in * 1000
        ).toISOString();

        const personUrn = await fetchPersonUrn(token.access_token);

        // Save to .env
        await upsertEnvVar("LINKEDIN_ACCESS_TOKEN", token.access_token);
        await upsertEnvVar("LINKEDIN_TOKEN_EXPIRES_AT", expiresAt);
        await upsertEnvVar("LINKEDIN_PERSON_URN", personUrn);

        console.log("\n✔ Access token saved to .env");
        console.log(`✔ Token expires: ${new Date(expiresAt).toLocaleDateString()} (60 days)`);
        console.log(`✔ Person URN: ${personUrn}`);
        console.log("\n✅ LinkedIn OAuth setup complete. You can close this browser tab.\n");

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          htmlPage(
            "✅ LinkedIn Connected",
            `<p>Authentication successful!</p>
             <p><strong>Token expires:</strong> ${new Date(expiresAt).toLocaleDateString()}</p>
             <p>You can close this tab and return to your terminal.</p>`
          )
        );

        server.close();
        resolve();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end(htmlPage("Error", `<p style="color:red">${message}</p>`));
        server.close();
        reject(err);
      }
    });

    server.listen(REDIRECT_PORT, () => {
      console.log(`Waiting for LinkedIn callback on http://localhost:${REDIRECT_PORT}/callback ...`);
    });

    server.on("error", reject);
  });
}

function htmlPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 500px; margin: 80px auto; padding: 0 20px; }
    h1 { font-size: 1.5rem; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
</body>
</html>`;
}

main().catch((err) => {
  console.error("\n❌ OAuth failed:", err.message);
  process.exit(1);
});
