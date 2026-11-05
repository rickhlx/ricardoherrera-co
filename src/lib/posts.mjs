import { getCollection } from "astro:content";

// Drafts show in `npm run dev`, and in a build only when INCLUDE_DRAFTS=true.
export const showDrafts = import.meta.env.DEV || process.env.INCLUDE_DRAFTS === "true";

export const iso = (d) => d.toISOString().slice(0, 10);
export const longDate = (d) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Joins a path onto the configured base, e.g. url("writing/") -> "/ricardoherrera-co/writing/". */
export function url(path = "") {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return base + path.replace(/^\//, "");
}

export function readingMinutes(body = "") {
  const words = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

/** Posts newest first, each with a revision letter (oldest post is A, like sheet 04). */
export async function getPosts({ includeDrafts = showDrafts } = {}) {
  const all = await getCollection("writing", ({ data }) => includeDrafts || !data.draft);
  const asc = all.sort((a, b) => a.data.date - b.data.date);
  asc.forEach((p, i) => {
    p.rev = i < 26 ? String.fromCharCode(65 + i) : String(i + 1);
    p.minutes = readingMinutes(p.body);
  });
  return asc.reverse();
}
