import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Next.js 16以降、Turbopackの設定はトップレベルの 'turbopack' キーに記述します
  turbopack: {
    root: __dirname,
  }
};

export default nextConfig;