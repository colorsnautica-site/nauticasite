import type { NextConfig } from "next";
import path from "node:path";

// Landing page autônoma: usa apenas imagens locais (tag <img>), sem next/image
// remoto e sem dependências de dados externos. App estático e independente do
// e-commerce (que vive na raiz do repositório).
const nextConfig: NextConfig = {
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true
  },
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb"
    }
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "X-Frame-Options", value: "DENY" },
        {
          key: "Content-Security-Policy",
          value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        }
      ]
    }];
  }
};

export default nextConfig;
