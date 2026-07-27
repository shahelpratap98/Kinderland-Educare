import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    The parent directory ("claude code") is itself a git repo with its own
    lockfile, so Turbopack infers it as the workspace root and warns. Pin the root
    to this project so builds don't reach outside it.
  */
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
