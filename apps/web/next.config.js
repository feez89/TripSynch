const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Force single React instance across the monorepo to prevent
    // "Cannot read properties of null (reading 'useContext')" errors.
    // Use require.resolve so this works regardless of where npm hoists React.
    config.resolve.alias['react'] = path.dirname(require.resolve('react/package.json'));
    config.resolve.alias['react-dom'] = path.dirname(require.resolve('react-dom/package.json'));
    return config;
  },
};

module.exports = nextConfig;
