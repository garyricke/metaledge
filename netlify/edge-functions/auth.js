const COOKIE_NAME = "me_preview";
const COOKIE_DAYS = 30;

export default async function auth(request, context) {
  const url = new URL(request.url);

  // Pass static assets through — no auth needed for CSS, JS, SVG, fonts, captions
  if (/\.(css|js|svg|woff2?|ico|vtt|webmanifest)$/.test(url.pathname)) {
    return context.next();
  }

  const password = Deno.env.get("SITE_PASSWORD") ?? "";

  // Handle login form POST
  if (request.method === "POST" && url.pathname === "/_auth/login") {
    const form = await request.formData();
    const attempt = form.get("password") ?? "";

    if (attempt === password) {
      const token = await hmac(password, password);
      const returnTo = url.searchParams.get("r") ?? "/";
      return new Response(null, {
        status: 302,
        headers: {
          Location: returnTo,
          "Set-Cookie": `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_DAYS * 86400}`,
        },
      });
    }

    return new Response(loginPage(true, url.searchParams.get("r") ?? "/"), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Verify auth cookie
  const cookie = parseCookie(request.headers.get("cookie") ?? "", COOKIE_NAME);
  if (cookie && cookie === await hmac(password, password)) {
    return context.next();
  }

  // Not authenticated — show login page
  return new Response(loginPage(false, url.pathname), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

function parseCookie(header, name) {
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

function loginPage(error, returnTo) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Preview Access · Metal Edge</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #0E1829; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .box {
      background: #152239; border-radius: 8px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.6);
      padding: 48px 40px; max-width: 360px; width: 90%;
      display: flex; flex-direction: column; align-items: center; gap: 20px;
    }
    img { height: 48px; width: auto; }
    .label { font-size: 14px; color: rgba(255,255,255,0.55); letter-spacing: 0.04em; }
    input[type="password"] {
      width: 100%; padding: 12px 16px;
      border: 1px solid rgba(255,255,255,0.15); border-radius: 4px;
      background: rgba(255,255,255,0.06); color: #fff; font-size: 15px; outline: none;
    }
    input[type="password"]:focus { border-color: #C8732D; }
    form { width: 100%; display: flex; flex-direction: column; gap: 12px; }
    button {
      width: 100%; padding: 13px; background: #C8732D; color: #fff; border: none;
      border-radius: 4px; font-size: 13px; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
    }
    button:hover { background: #a85e22; }
    .error { font-size: 13px; color: #e05c5c; }
  </style>
</head>
<body>
  <div class="box">
    <img src="/assets/images/logos/Metal-Edge-Logo-on-dark.svg" alt="Metal Edge">
    <p class="label">Enter preview password</p>
    <form method="POST" action="/_auth/login?r=${encodeURIComponent(returnTo)}">
      <input type="password" name="password" placeholder="Password" autofocus autocomplete="current-password">
      <button type="submit">Enter</button>
    </form>
    ${error ? '<p class="error">Incorrect password — try again</p>' : ''}
  </div>
</body>
</html>`;
}
