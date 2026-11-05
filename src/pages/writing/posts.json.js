import { getPosts, iso, url } from "../../lib/posts.mjs";

// Post list for the YN-1 homepage (site/index.html): sheet 04's revision log and the terminal's `ls writing`.
// Same posts as the writing index, newest first, so drafts appear only where the index shows them.
export async function GET() {
  const posts = (await getPosts()).map((p) => ({
    rev: p.rev,
    title: p.data.title,
    date: iso(p.data.date),
    dek: p.data.dek,
    url: url(`writing/${p.id}/`),
    draft: p.data.draft || undefined,
  }));
  return new Response(JSON.stringify(posts), { headers: { "Content-Type": "application/json" } });
}
