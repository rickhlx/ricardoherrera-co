// @ts-check
import { defineConfig } from "astro/config";
import { unified, rehypeHeadingIds } from "@astrojs/markdown-remark";
import { remarkCallouts, rehypePostBody, shikiCodeFrame } from "./src/lib/markdown.mjs";

// The GitHub Pages preview lives under /ricardoherrera-co/; the workflow sets BASE_PATH for it.
// On ricardoherrera.co (after the cutover) leave BASE_PATH unset so the site builds at /.
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  site: "https://ricardoherrera.co",
  base,
  // site/ holds the hand-built YN-1 homepage and its assets. Astro copies it to the build as-is.
  publicDir: "./site",
  outDir: "./dist",
  trailingSlash: "ignore",
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      transformers: [shikiCodeFrame()],
    },
    processor: unified({
      remarkPlugins: [remarkCallouts],
      rehypePlugins: [rehypeHeadingIds, rehypePostBody],
      remarkRehype: {
        footnoteLabel: "Notes",
        footnoteLabelProperties: { className: ["notes-label"] },
        footnoteBackLabel: (i) => `Back to reference ${i + 1}`,
      },
    }),
  },
});
