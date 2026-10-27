import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    target: "es2022",
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 30,
              minSize: 20000,
              maxSize: 200000,
            },
            {
              name: "router-vendor",
              test: /[\\/]node_modules[\\/]@tanstack[\\/]react-router[\\/]/,
              priority: 25,
            },
            {
              name: "query-vendor",
              test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
              priority: 25,
            },
            {
              name: "msw-vendor",
              test: /[\\/]node_modules[\\/](msw|@mswjs)[\\/]/,
              priority: 20,
            },
            {
              name: "mocks",
              test: /[\\/]src[\\/]mocks[\\/]/,
              priority: 15,
            },
            {
              name: "api",
              test: /[\\/]src[\\/]shared[\\/]api[\\/]/,
              priority: 15,
            },
          ],
        },
      },
    },
  },
});
