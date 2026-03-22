import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

/*
 * ESM __dirname workaround.
 * Vite config files are loaded as ES modules, where __dirname is not available.
 * We reconstruct it from import.meta.url so that resolve() calls below produce
 * correct absolute paths regardless of how the config is invoked.
 */
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: ".",
  base: "/mapx-demo-embed/",
  server: {
    port: 3001,
  },
  build: {
    outDir: "dist",

    /*
     * Multi-Page Application (MPA) configuration.
     *
     * Rollup's `input` object defines the entry points for the production
     * build. Each key becomes a chunk name and each value is the HTML file
     * that Vite will process (resolving <script> tags, CSS imports, etc.).
     *
     * Route mapping:
     *   landing      → /                       (index.html — landing page)
     *   kitchen-sink → /demos/kitchen-sink/     (full SDK feature demo)
     *   story        → /demos/story/            (guided narrative story map)
     *   explorer     → /demos/explorer/         (DELTA-style data explorer)
     *   metrics      → /demos/metrics/          (scrollytelling metrics hub)
     *
     * Vite automatically deduplicates shared modules across entry points.
     * For example, shared.css and pin-gate.js are imported by every page
     * but will be emitted once and referenced by all entry chunks, keeping
     * the production bundle lean.
     */
    rollupOptions: {
      input: {
        landing: resolve(__dirname, "index.html"),
        "kitchen-sink": resolve(__dirname, "demos/kitchen-sink/index.html"),
        story: resolve(__dirname, "demos/story/index.html"),
        explorer: resolve(__dirname, "demos/explorer/index.html"),
        metrics: resolve(__dirname, "demos/metrics/index.html"),
      },
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.js"],
  },
});
