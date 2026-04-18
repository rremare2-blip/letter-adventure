/// <reference types="vite/client" />

interface StorageAPI {
  get: (key: string) => Promise<{ value: string | null }>;
  set: (key: string, value: string) => Promise<void>;
}

declare global {
  interface Window {
    storage: StorageAPI;
  }
}

export {};
