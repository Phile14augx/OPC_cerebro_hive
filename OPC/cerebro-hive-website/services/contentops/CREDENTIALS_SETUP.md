# Credential Setup Guide

---

## 1. Anthropic API Key

1. Go to [console.anthropic.com/settings/api-keys](https://console.anthropic.com/settings/api-keys)
2. Click **Create Key**, copy the key
3. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`

---

## 2. LinkedIn — Automated OAuth 2.0 Setup

LinkedIn uses 3-legged OAuth 2.0. The pipeline handles the full flow automatically — you just need a Client ID and Client Secret from a LinkedIn developer app.

### Step 1 — Create a LinkedIn Developer App

1. Go to [linkedin.com/developers/apps/new](https://www.linkedin.com/developers/apps/new)
2. Fill in app name (e.g. "CerebroContent"), attach your LinkedIn Page, upload any logo
3. Click **Create App** — you'll land on the app dashboard

### Step 2 — Get your Client ID and Client Secret

1. On the app dashboard, go to the **Auth** tab
2. Copy **Client ID** and **Client Secret**
3. Add both to `.env`:
   ```
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   ```

### Step 3 — Add the redirect URI

Still on the **Auth** tab, under **OAuth 2.0 settings → Authorized redirect URLs**:

1. Click the pencil icon
2. Add: `http://localhost:3456/callback`
3. Click **Update**

### Step 4 — Request the required product scopes

1. Go to the **Products** tab on your app
2. Request access to **Share on LinkedIn** → grants `w_member_social`
3. Request access to **Sign In with LinkedIn using OpenID Connect** → grants `openid`, `profile`
4. Personal-use apps are usually approved immediately

### Step 5 — Run the automated OAuth flow

```bash
cd services/contentops
pnpm auth:linkedin
```

This will:
- Open your browser to the LinkedIn consent page
- Ask you to log in and approve the permissions
- Automatically exchange the authorization code for an access token
- Save `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_TOKEN_EXPIRES_AT`, and `LINKEDIN_PERSON_URN` to your `.env`

You'll see a success page in the browser and a confirmation in the terminal.

### Token expiry

LinkedIn access tokens last **60 days**. The pipeline logs a warning when fewer than 7 days remain. When it expires, just re-run:

```bash
pnpm auth:linkedin
```

The new token overwrites the old one in `.env` automatically.

---

## 3. Medium

1. Go to [medium.com/me/settings](https://medium.com/me/settings)
2. Scroll to **Integration tokens**, enter a name (e.g. "CerebroContent")
3. Click **Get integration token**, copy it
4. Add to `.env`: `MEDIUM_INTEGRATION_TOKEN=your_token`

Medium tokens do not expire.

---

## 4. Verify everything works

```bash
cd services/contentops

# Test the full pipeline without posting anything live
DRY_RUN=true pnpm start
```

A sample article is already in `watch/incoming/test-article.md`. You should see it parsed, transformed by Claude, and the dry-run payloads logged to the console.

When you're ready to publish for real:

```bash
# In .env, set:
DRY_RUN=false

pnpm start
```
