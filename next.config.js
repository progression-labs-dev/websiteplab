/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/experiment',
      },
      // A2A Agent Card — served from a route handler (app/well-known/agent-card)
      // so siteContent.ts stays the single source of truth. Next.js ignores
      // dot-prefixed segments in the app dir, so the spec-required dotted paths
      // are rewritten onto a routable, non-dotted segment.
      {
        source: '/.well-known/agent-card.json',
        destination: '/well-known/agent-card',
      },
      {
        // Legacy A2A discovery path (pre-2025 spec used /.well-known/agent.json).
        source: '/.well-known/agent.json',
        destination: '/well-known/agent-card',
      },
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['onnxruntime-node'],
    outputFileTracingExcludes: {
      '*': ['./node_modules/onnxruntime-node/**'],
    },
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Prevent onnxruntime-node native binaries from being bundled client-side
      config.resolve.alias = {
        ...config.resolve.alias,
        'onnxruntime-node': false,
      };
      // Treat any .node binary files as static assets (not JS)
      config.module.rules.push({
        test: /\.node$/,
        type: 'asset/resource',
      });
      // Production only: treat onnxruntime-web .mjs as ESM so Terser
      // can handle import.meta syntax during minification.
      // In dev, webpack handles import.meta natively — applying this
      // rule in dev breaks the RelativeURL polyfill.
      if (!dev) {
        config.module.rules.push({
          test: /\.mjs$/,
          include: /onnxruntime-web/,
          type: 'javascript/esm',
        });
      }
    }
    return config;
  },
}

module.exports = nextConfig
