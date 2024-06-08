/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "d236s7dmu4g35p.cloudfront.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
