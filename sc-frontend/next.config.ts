import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // 允许通过局域网 IP 访问开发服务器
  allowedDevOrigins: ["192.168.1.74", "192.168.1.253"],
};

export default nextConfig;
