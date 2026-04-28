// SHA-256 of the preview password — plaintext never stored here
// To change the password: echo -n "newpassword" | shasum -a 256
const PASSWORD_HASH = "180938c40e4f4948c29910014a50500960b94fd62cc8da182da844edc359e2d9";
const COOKIE_NAME   = "me_preview";
const COOKIE_TOKEN  = "me_ok_26";
const COOKIE_DAYS   = 30;

export default async function auth(request, context) {
  const url = new URL(request.url);

  // Static assets pass through without auth
  if (/\.(css|js|svg|woff2?|ico|vtt|webmanifest)$/.test(url.pathname)) {
    return context.next();
  }

  // Handle login form POST
  if (request.method === "POST" && url.pathname === "/_auth/login") {
    const body   = await request.text();
    const params = new URLSearchParams(body);
    const attempt  = params.get("password") ?? "";
    const returnTo = params.get("r") ?? "/";

    const hash = await sha256(attempt);

    if (hash === PASSWORD_HASH) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: returnTo,
          "Set-Cookie": `${COOKIE_NAME}=${COOKIE_TOKEN}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_DAYS * 86400}`,
        },
      });
    }

    return new Response(loginPage(true, returnTo), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Check auth cookie
  const cookieHeader = request.headers.get("cookie") ?? "";
  if (cookieHeader.includes(`${COOKIE_NAME}=${COOKIE_TOKEN}`)) {
    return context.next();
  }

  // Not authenticated
  return new Response(loginPage(false, url.pathname), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function sha256(value) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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
    input[type=password] {
      width: 100%; padding: 12px 16px;
      border: 1px solid rgba(255,255,255,0.15); border-radius: 4px;
      background: rgba(255,255,255,0.06); color: #fff; font-size: 15px; outline: none;
    }
    input[type=password]:focus { border-color: #C8732D; }
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
    <form method="POST" action="/_auth/login">
      <input type="hidden" name="r" value="${returnTo}">
      <input type="password" name="password" placeholder="Password" autofocus autocomplete="current-password">
      <button type="submit">Enter</button>
    </form>
    ${error ? '<p class="error">Incorrect password — try again</p>' : ""}
  </div>
</body>
</html>`;
}
