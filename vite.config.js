import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: ".",
  server: {
    port: 3001,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        landing: resolve(__dirname, "index.html"),
        "kitchen-sink": resolve(__dirname, "demos/kitchen-sink/index.html"),
        story: resolve(__dirname, "demos/story/index.html"),
        explorer: resolve(__dirname, "demos/explorer/index.html"),
      },
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.js"],
  },
});
