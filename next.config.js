/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Ensure we're using pages router explicitly
    experimental: {
        appDir: false
    }
};

module.exports = nextConfig;