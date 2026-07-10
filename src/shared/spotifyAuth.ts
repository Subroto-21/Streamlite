// Set VITE_SPOTIFY_CLIENT_ID in your .env file once.
// Users never see this - they just click "Connect Spotify".
const CLIENT_ID =
  (import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined) ?? "";

export const clientIdConfigured = CLIENT_ID.length > 0;
const REDIRECT_URI = () => window.location.origin + "/builder.html";

const KEYS = {
  accessToken: "sl_spotify_access_token",
  refreshToken: "sl_spotify_refresh_token",
  expiresAt: "sl_spotify_expires_at",
  codeVerifier: "sl_spotify_code_verifier",
};

function randomString(n: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(n)))
    .map((v) => chars[v % chars.length])
    .join("");
}

async function pkceChallenge(verifier: string): Promise<string> {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function storeTokens(access: string, refresh: string, expiresIn: number): void {
  localStorage.setItem(KEYS.accessToken, access);
  localStorage.setItem(KEYS.refreshToken, refresh);
  localStorage.setItem(KEYS.expiresAt, String(Date.now() + expiresIn * 1000));
}

export function isConnected(): boolean {
  return !!localStorage.getItem(KEYS.accessToken);
}

export function clearTokens(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

export async function connectSpotify(): Promise<void> {
  const verifier = randomString(64);
  localStorage.setItem(KEYS.codeVerifier, verifier);

  const challenge = await pkceChallenge(verifier);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI(),
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: "user-read-currently-playing user-read-playback-state",
    state: "sl_spotify",
  });

  window.open(
    `https://accounts.spotify.com/authorize?${params}`,
    "spotify_auth",
    "width=480,height=700,left=200,top=100",
  );
}

// Called on every builder page load - handles the popup landing back with ?code=
export async function handleOAuthCallback(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code || params.get("state") !== "sl_spotify") return;

  const verifier = localStorage.getItem(KEYS.codeVerifier);
  if (!verifier) return;
  localStorage.removeItem(KEYS.codeVerifier);

  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI(),
        client_id: CLIENT_ID,
        code_verifier: verifier,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };
      storeTokens(data.access_token, data.refresh_token, data.expires_in);
    }
  } catch {
    /* token stays empty */
  }

  if (window.opener) {
    window.opener.postMessage(
      { type: "sl_spotify_auth_done" },
      window.location.origin,
    );
    window.close();
  }
}

export async function getValidToken(): Promise<string | null> {
  const access = localStorage.getItem(KEYS.accessToken);
  const refresh = localStorage.getItem(KEYS.refreshToken);
  const expiresAt = Number(localStorage.getItem(KEYS.expiresAt) ?? 0);
  if (!access || !refresh) return null;
  if (Date.now() < expiresAt - 60_000) return access;

  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh,
        client_id: CLIENT_ID,
      }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };
    storeTokens(
      data.access_token,
      data.refresh_token ?? refresh,
      data.expires_in,
    );
    return data.access_token;
  } catch {
    return null;
  }
}
