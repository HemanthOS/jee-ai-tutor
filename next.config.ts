/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // If you have CORS issues
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;