import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: {
    port: 3001,
  },
  build: {
    outDir: "dist",
  },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.js"],
  },
});
