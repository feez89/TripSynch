const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Force single React instance across the monorepo to prevent
    // "Cannot read properties of null (reading 'useContext')" errors
    config.resolve.alias['react'] = path.resolve(__dirname, 'node_modules/react');
    config.resolve.alias['react-dom'] = path.resolve(__dirname, 'node_modules/react-dom');
    return config;
  },
};

module.exports = nextConfig;
