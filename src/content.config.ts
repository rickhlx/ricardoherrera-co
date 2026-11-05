import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// One Markdown file per post in src/content/writing/. The file name is the URL slug.
const writing = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/writing" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    dek: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Optional cover image, shown under the post header and used as the share image (cropped to 1200×630).
    // `src` is relative to the post file, e.g. ./images/<slug>.jpg.
    image: z
      .object({
        src: image(),
        alt: z.string(),
        caption: z.string().optional(),
      })
      .optional(),
    series: z
      .object({
        name: z.string(),
        part: z.number().int().positive(),
        next: z.string().optional(),
      })
      .optional(),
    revisions: z.array(z.object({ date: z.coerce.date(), note: z.string() })).default([]),
  }),
});

export const collections = { writing };
