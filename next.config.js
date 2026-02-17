/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['onnxruntime-node'],
  },
  webpack: (config, { isServer }) => {
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
      // Treat onnxruntime-web .mjs files as ES modules so Terser
      // can handle import.meta syntax during minification
      config.module.rules.push({
        test: /\.mjs$/,
        include: /onnxruntime-web/,
        type: 'javascript/esm',
      });
    }
    return config;
  },
}

module.exports = nextConfig
