/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This will proxy requests from the frontend to the backend,
  // making them appear to come from the same origin.
  async rewrites() {
    return [
      {
        // Proxies API calls like /api/backend/posts to http://backend:8080/api/posts
        source: '/api/backend/:path*',
        destination: 'http://backend:8080/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig