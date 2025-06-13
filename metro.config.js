const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies in the workspace
config.resolver.disableHierarchicalLookup = true;

// 4. Extra module resolution for local packages
config.resolver.extraNodeModules = {
  '@oxyhq/services': path.resolve(workspaceRoot, 'OxyHQServices', 'src'),
  '@oxyhq/services/core': path.resolve(workspaceRoot, 'OxyHQServices', 'src', 'core'),
  '@oxyhq/services/full': path.resolve(workspaceRoot, 'OxyHQServices', 'src'),
  '@oxyhq/services/ui': path.resolve(workspaceRoot, 'OxyHQServices', 'src', 'ui'),
};

// 5. Enable source file watching for better hot reload
config.resolver.platforms = ['native', 'android', 'ios', 'tsx', 'ts', 'web'];

module.exports = config;
