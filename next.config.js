/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['onnxruntime-node'],
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
