# DiscoSat Platform UI

This is the frontend application for the DiscoSat satellite operations platform. The application is built using Next.js and provides a comprehensive interface for managing satellites, ground stations, and flight operations.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js version 18 or higher
- npm package manager
- Docker and Docker Compose for running the backend

## Getting Started

The project supports two different operational modes depending on your development needs.

### Installation

First, clone the repository and install the required dependencies:

```bash
npm install
```

This will install all necessary packages including Next.js, React, and various UI component libraries.

Create a .env file in the root of the project with the following secrets:

```API_BASE_URL=http://localhost:5111/api/v1

# Auth0 Configuration
# IMPORTANT: Replace AUTH0_SECRET with a secure value using: openssl rand -hex 32
AUTH0_SECRET=secret
APP_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=secret
AUTH0_CLIENT_ID=secret
AUTH0_CLIENT_SECRET=secret
# Auth0 Scope - what information you want from the user
AUTH0_SCOPE=openid profile email
# Only needed if you're using an Auth0 API (leave commented if not using)
AUTH0_AUDIENCE=http://localhost:5111
```

Replace the secret values with your own secret from Auth0.

### Development Mode Options

#### Option 1: Full Stack Development

This mode connects the frontend to a live backend API. It is recommended when you need to test end-to-end functionality or work with real data flows.

Start the backend service first. Navigate to the backend projekt and execute:

```bash
docker compose up dev
```

The backend will be available at http://localhost:5111 with a pre-configured database.

Then start the frontend development server:

```bash
npm run dev
```

The application will be accessible at http://localhost:3000.

You can log in using your own google account. You must elevate your role by editing the backend database manually.

#### Option 2: Standalone Frontend Development

This mode allows you to work on the UI without running the backend. It uses mocked data and is useful for component development and design work.

Start the frontend in mocked mode:

```bash
npm run dev:mocked
```

In this mode, authentication is simulated and you will have full administrative access, but you still have to login first that cannot be avoided. All API responses come from mock files in the codebase.

## Project Structure

The application follows a standard Next.js app directory structure. The main directories include:

- app/ - Contains all application pages and routes
- components/ - Reusable UI components
- lib/ - Utility functions and shared logic
- public/ - Static assets

## Building for Production

To create an optimized production build:

```bash
npm run build
```

After building, you can start the production server:

```bash
npm start
```

## Additional Information

The application uses TypeScript for type safety and includes ESLint for code quality. It leverages various modern React patterns and libraries for state management and UI rendering.
