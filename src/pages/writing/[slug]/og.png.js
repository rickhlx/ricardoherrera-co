import { getPosts, longDate } from "../../../lib/posts.mjs";
import { renderPostCard } from "../../../lib/og-card.mjs";

// /writing/<slug>/og.png: the post's share card, used for og:image and twitter:image on the post page.
export async function getStaticPaths() {
  const posts = await getPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export async function GET({ props: { post } }) {
  const png = await renderPostCard({
    title: post.data.title,
    dek: post.data.dek,
    date: longDate(post.data.date),
    rev: post.rev,
    minutes: post.minutes,
    tags: post.data.tags,
  });
  return new Response(png, { headers: { "Content-Type": "image/png" } });
}
