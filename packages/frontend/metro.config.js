const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Check if OxyHQ services exists locally (for development)
const oxyServicesPath = path.resolve(require('os').homedir(), 'OxyStackApiANDModule', 'OxyHQServices', 'packages', 'services');
const hasLocalOxyServices = fs.existsSync(oxyServicesPath);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// Add OxyHQ services to watch folders only if it exists
if (hasLocalOxyServices) {
  config.watchFolders.push(oxyServicesPath);
}

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies in the workspace
config.resolver.disableHierarchicalLookup = true;

// 4. Extra module resolution for local packages (only if they exist)
if (hasLocalOxyServices) {
  config.resolver.extraNodeModules = {
    '@oxyhq/services': path.resolve(oxyServicesPath, 'src', 'index.ts'),
    '@oxyhq/services/core': path.resolve(oxyServicesPath, 'src', 'core'),
    '@oxyhq/services/full': path.resolve(oxyServicesPath, 'src', 'index.ts'),
    '@oxyhq/services/ui': path.resolve(oxyServicesPath, 'src', 'ui'),
  };
}

// 5. Enable better platform resolution
config.resolver.platforms = ['native', 'android', 'ios', 'tsx', 'ts', 'web'];

module.exports = config;