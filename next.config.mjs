/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is stable in Next.js 15
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*'
      }
    ];
  }
};

export default nextConfig;
