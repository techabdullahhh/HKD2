import { defineConfig } from "vite";
import react from "vite-plugin-electron-renderer";
import electron from "vite-plugin-electron/simple";
import reactPlugin from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [
    reactPlugin(),
    electron({
      main: {
        entry: "electron/main/index.ts",
        vite: {
          build: {
            outDir: "dist-electron/main",
            rollupOptions: {
              external: ["better-sqlite3", "bcryptjs"]
            }
          }
        }
      },
      preload: {
        input: "electron/preload/index.ts",
        vite: {
          build: {
            outDir: "dist-electron/preload"
          }
        }
      },
      renderer: {}
    }),
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  }
});
