/* Request handling shared by the public API routes in functions/api.
   The host allowlist lives here so a new domain is one edit, not two. */

/* Every hostname allowed to post to our API. Anything else is not our page. */
const ALLOWED_HOSTS = [
  "invest.elfortincapital.com",
  "el-fortin.pages.dev",
  "localhost",
  "127.0.0.1",
];

export function isOurSite(request) {
  /* Browsers send Origin on any POST; Referer is the fallback for the rare
     client that strips it. */
  const claimed = request.headers.get("Origin") || request.headers.get("Referer");
  if (!claimed) return false;

  let hostname;
  try {
    hostname = new URL(claimed).hostname;
  } catch {
    return false;
  }

  return ALLOWED_HOSTS.some(
    (host) => hostname === host || hostname.endsWith("." + host)
  );
}

export function declaredBodyTooBig(request, maxBytes) {
  const declared = Number(request.headers.get("Content-Length"));
  return Number.isFinite(declared) && declared > maxBytes;
}

export async function readJson(request, maxBytes) {
  /* Content-Length can lie or be absent, so cap the bytes we actually read. */
  const body = await request.text();
  if (!body || body.length > maxBytes) return null;
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

/* Single-line field: no control characters at all. */
export function line(value, maxLength) {
  return text(value)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function json(status, body, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}
