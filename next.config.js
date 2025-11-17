/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Retirer output: 'export' pour permettre les routes dynamiques
  // output: 'export', // Commenté pour permettre les routes dynamiques
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig

