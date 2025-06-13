# Oxy Stack

This monorepo contains the Oxy Stack mobile application and its backend services.

## Structure

```
oxy-stack/
├── packages/
│   ├── frontend/         # Oxy Stack React Native/Expo mobile app
│   └── backend/          # Oxy Stack Node.js backend server
├── package.json          # Root package.json with workspace configuration
└── README.md            # This file
```

## Getting Started

### Prerequisites

- Node.js (>= 16.0.0)
- npm (>= 8.0.0)
- Expo CLI (for mobile app development)

### Installation

1. Install all dependencies for the monorepo:
   ```bash
   npm run install:all
   ```

### Development

#### Start both frontend and backend concurrently:
```bash
npm run dev
```

#### Start only the mobile app:
```bash
npm run start
```

#### Start only the backend:
```bash
npm run start:backend
```

### Individual Package Commands

#### Mobile App (packages/frontend)
```bash
cd packages/frontend
npm start          # Start Expo development server
npm run android    # Start Android development
npm run ios        # Start iOS development
npm run web        # Start web development
```

#### Backend (packages/backend)
```bash
cd packages/backend
npm start          # Start backend server with nodemon
```

## Workspace Management

This monorepo uses npm workspaces to manage dependencies and scripts across packages.

- All packages are located in the `packages/` directory
- Shared dependencies can be installed at the root level
- Each package maintains its own `package.json` for specific dependencies

## Contributing

Please read the individual package READMEs for specific contribution guidelines.
