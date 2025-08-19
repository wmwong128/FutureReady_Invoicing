/// <reference types="vite/client" />

interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
  readonly VITE_AUTH0_API_CLIENT_ID: string;
  readonly VITE_AUTH0_API_CLIENT_SECRET: string;
  readonly VITE_AUTH0_API_AUDIENCE: string;
  readonly VITE_BACKEND_MAIN_URL: string;
  readonly VITE_AI_MAIN_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
