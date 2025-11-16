import { StrictMode } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '../src/index.css';

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log("Frontend ENV KEY:", import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);


interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  // add other env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

if (!PUBLISHABLE_KEY) {
  throw new Error(
    'Missing VITE_CLERK_PUBLISHABLE_KEY. Create a .env at the project root and set:\nVITE_CLERK_PUBLISHABLE_KEY=pk_test_...'
  );
}


createRoot(document.getElementById('root')!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <StrictMode>
      <App />
    </StrictMode>
  </ClerkProvider>
);
