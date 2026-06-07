/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  generateBuildId: async () => {
    return 'stable-build';
  },
};

export default nextConfig;