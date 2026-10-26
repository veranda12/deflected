import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Next.js injects inline scripts for hydration, so script-src needs 'unsafe-inline'
// unless every page is rendered dynamically with a nonce. Everything else is locked down.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

// The apex is the canonical host; www requests get a permanent redirect to it.
// Behind a reverse proxy the original host may only survive in X-Forwarded-Host, so both are matched.
const siteUrl = process.env.SITE_URL ? new URL(process.env.SITE_URL) : null;
const wwwHost = siteUrl && !siteUrl.hostname.startsWith("www.") ? `www.${siteUrl.hostname}` : null;
const wwwPattern = wwwHost ? `${wwwHost.replace(/\./g, "\\.")}(:\\d+)?` : "";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Pages render fully before the first byte anyway, so stream nothing: title, description and canonical
  // always land in <head> for every client instead of only for the bots Next.js lists by default.
  htmlLimitedBots: /.*/,
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  images: {
    localPatterns: [{ pathname: "/media/**", search: "" }, { pathname: "/images/**", search: "" }],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [64, 128, 256, 384],
  },
  async redirects() {
    if (!siteUrl || !wwwHost) return [];
    const destination = `${siteUrl.origin}/:path*`;
    return [
      { source: "/:path*", has: [{ type: "host", value: wwwPattern }], destination, permanent: true },
      { source: "/:path*", has: [{ type: "header", key: "x-forwarded-host", value: wwwPattern }], destination, permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
