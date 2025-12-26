# Monad App with Farcaster Authentication

This is a React application built with Vite, TypeScript, and Wagmi that demonstrates how to implement Farcaster authentication in a web application.

## Features

- Wallet connection using Wagmi and Farcaster Frame connector
- Automatic Farcaster authentication after wallet connection
- Token-based authentication with the backend
- React Query for data fetching and state management
- Zustand for global state management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- A running backend server with the Farcaster authentication endpoints

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy the environment variables file:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your backend API URL if needed

### Development

Start the development server:

```bash
pnpm dev
```

### Authentication Flow

The authentication flow works as follows:

1. When the app loads, it automatically connects to the user's wallet using the Farcaster Frame connector
2. After successful wallet connection, the app requests a nonce from the backend
3. The app uses the Farcaster SDK to sign the nonce
4. The signature is sent to the backend for verification
5. Upon successful verification, the backend returns a user object and an authentication token
6. The token is stored in localStorage and used for subsequent authenticated requests

### Project Structure

- `src/services/` - API services for interacting with the backend
- `src/stores/` - Zustand stores for global state management
- `src/hooks/` - Custom React hooks including authentication hooks

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
