const TOKEN_URL = "https://oauth2.googleapis.com/token";

export async function exchangeCodeForTokens({ code, clientId, clientSecret, redirectUri }) {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!resp.ok) {
    const err = await resp.text().catch(() => "");
    throw new Error(`Token exchange failed (${resp.status}): ${err || resp.statusText}`);
  }
  // { access_token, refresh_token, expires_in, scope, token_type, (maybe) expiry_date }
  return resp.json();
}

export async function refreshAccessToken({ refreshToken, clientId, clientSecret }) {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
  });

  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!resp.ok) {
    const err = await resp.text().catch(() => "");
    throw new Error(`Refresh failed (${resp.status}): ${err || resp.statusText}`);
  }
  // { access_token, expires_in, scope, token_type, (maybe) expiry_date }
  return resp.json();
}

export async function googleApiGet(url, accessToken) {
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`Google GET failed (${resp.status}) ${url}: ${errText || resp.statusText}`);
  }
  return resp.json();
}

export async function googleApiPost(url, accessToken, bodyObj) {
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyObj),
  });

  if (!resp.ok) {
    const err = await resp.text().catch(() => "");
    throw new Error(`Google POST failed (${resp.status}) ${url}: ${err || resp.statusText}`);
  }
  return resp.json();
}
