/// <reference types="vite/client" />

import type { HkdApi } from "@shared/api";

declare global {
  interface Window {
    hkd: HkdApi;
    hkdPrint: { ready: () => void };
  }
}

export {};
