import type { NextConfig } from "next";
import path from "node:path";

// Landing page autônoma: usa apenas imagens locais (tag <img>), sem next/image
// remoto e sem dependências de dados externos. App estático e independente do
// e-commerce (que vive na raiz do repositório).
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  outputFileTracingRoot: path.join(__dirname)
};

export default nextConfig;
