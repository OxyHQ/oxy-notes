const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [
  workspaceRoot,
  path.resolve(require('os').homedir(), 'OxyServicesandApi', 'OxyHQServices'),
];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies in the workspace
config.resolver.disableHierarchicalLookup = true;

// 4. Extra module resolution for local packages
config.resolver.extraNodeModules = {
  '@oxyhq/services': path.resolve(require('os').homedir(), 'OxyServicesandApi', 'OxyHQServices', 'src', 'index.ts'),
  '@oxyhq/services/core': path.resolve(require('os').homedir(), 'OxyServicesandApi', 'OxyHQServices', 'src', 'core'),
  '@oxyhq/services/full': path.resolve(require('os').homedir(), 'OxyServicesandApi', 'OxyHQServices', 'src', 'index.ts'),
  '@oxyhq/services/ui': path.resolve(require('os').homedir(), 'OxyServicesandApi', 'OxyHQServices', 'src', 'ui'),
};

// 5. Enable better platform resolution
config.resolver.platforms = ['native', 'android', 'ios', 'tsx', 'ts', 'web'];

module.exports = config;