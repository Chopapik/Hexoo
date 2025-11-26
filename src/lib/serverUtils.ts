import { headers } from "next/headers";

/**
 * [Senior Dev Note] Why do we need this helper instead of a simple req.ip?
 * * 1. Web Standard Compliance: In Next.js App Router, the `req` object is the
 * standard Web Request API, which does not define an `.ip` property.
 * * 2. Production Environment (The Proxy Problem): When the app is deployed
 * behind a Load Balancer (like Vercel, Nginx, or Cloudflare), the direct
 * source IP seen by the server is the proxy's IP (e.g., 10.x.x.x), NOT the
 * client's IP.
 * * 3. Solution: Proxies forward the true client IP in the standard 'X-Forwarded-For'
 * HTTP header. We must read this header and take the first entry, as it
 * is the user's original IP. This ensures reliable Audit Logs.
 */
export async function getClientIp() {
  const headersList = await headers();
  // X-Forwarded-For is the standard header used by proxies/load balancers.
  const forwardedFor = headersList.get("x-forwarded-for");

  if (forwardedFor) {
    // The header can contain a list (client IP, proxy IP, etc.). We take the first one.
    return forwardedFor.split(",")[0].trim();
  }

  // Fallback for direct local environment or when the header is missing.
  return "127.0.0.1";
}
