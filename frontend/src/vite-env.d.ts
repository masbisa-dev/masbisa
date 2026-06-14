/// <reference types="vite/client" />

// Env vars exposed to the client via Vite (must be prefixed with VITE_)
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
