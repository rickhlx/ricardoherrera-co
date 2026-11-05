import rss from "@astrojs/rss";
import { render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getPosts } from "../../lib/posts.mjs";

// The feed never includes drafts, even when draft pages are built for the preview.
export async function GET(context) {
  const posts = await getPosts({ includeDrafts: false });
  const container = await AstroContainer.create();
  const items = [];
  for (const post of posts) {
    const { Content } = await render(post);
    const permalink = new URL(`writing/${post.id}/`, context.site);
    // Feed readers show the HTML away from the page, so in-page (#) and relative links must be absolute.
    const html = (await container.renderToString(Content)).replace(
      /\s(href|src)="(?!https?:|mailto:|data:)([^"]*)"/g,
      (_, attr, value) => ` ${attr}="${new URL(value, permalink).href}"`,
    );
    items.push({
      title: post.data.title,
      description: post.data.dek,
      pubDate: post.data.date,
      // Canonical link on the real domain, without the preview base path.
      link: permalink.href,
      categories: post.data.tags,
      content: html,
    });
  }
  return rss({
    title: "Ricardo Herrera · Writing",
    description: "Long-form notes on platform engineering, reliability and running infrastructure.",
    site: context.site,
    items,
    customData: "<language>en</language>",
  });
}
