# ricardoherrera.co

Personal site of Ricardo Herrera. The homepage is the **YN-1**, a fictional 1970s workstation drawn live in blueprint linework; each part opens a drawing sheet (About, Work, Writing, Archive, Contact), and the screen is a working terminal. See [docs/yn1-computer-direction.md](docs/yn1-computer-direction.md).

## Layout

| Path | What |
| --- | --- |
| `site/` | The hand-built YN-1 homepage: `index.html` (three.js 0.160 from jsDelivr), drawings, photos, the blog avatar (`avatar.webp`), the model (`yn1.glb.json`), social card and icons. Astro copies it into the build unchanged. |
| `src/content/writing/` | Blog posts, one Markdown file each. The file name is the URL: `spot-interruptions.md` → `/writing/spot-interruptions/` |
| `src/pages/writing/` | The writing index, the post page, the RSS feed (`/writing/feed.xml`) and `posts.json`, which fills sheet 04's revision log and the terminal's `ls writing` / `cat writing/<n>` on the YN-1 |
| `src/layouts/`, `src/styles/`, `src/lib/` | Writing layout, styles, Markdown extensions (`markdown.mjs`) and post helpers |
| `model/` | Blender 5.2 scripts that build the YN-1 and render the drawings |
| `make_assets.py` | Builds `site/og.png` and the favicon set |
| `fonts/` | Fonts for `make_assets.py` (OFL) |
| `site/fonts/dmvendor.css` | Dank Mono for the terminal and for code in blog posts, the vendor's obfuscated web build (Ricardo's personal license). Don't commit the raw `.woff2`/`.otf` files; the EULA forbids redistribution, and `.gitignore` blocks them |
| `docs/` | Design direction and research notes |

The site is built with [Astro](https://astro.build) 7 (Node 22.23 or later).

## Preview

```sh
npm install
npm run dev        # http://localhost:4321/ (homepage) and /writing/ ; drafts are shown
npm run build      # static site in dist/
npm run preview    # serve dist/
```

## Writing a post

1. Copy `src/content/writing/_template.md` to `src/content/writing/<slug>.md`. Files starting with `_` are ignored.
2. Fill in the frontmatter: `title`, `dek` (the summary under the title, in the index and in link previews), `date`, `tags`. Optional: `updated`, `series`, `revisions`, `image`.
   - `image` is a cover with `src` (a path relative to the post, e.g. `./images/<slug>.jpg`), `alt` and an optional `caption`. It shows under the post header, resized for the page, and replaces the drawn share card in link previews, cropped to 1200×630 from the centre. Use at least 1200×630 and keep the subject near the middle.
3. Write in Markdown. Beyond the basics you get:
   - `##` headings feed the contents list and get a shareable `#` link.
   - Footnotes with `[^name]`, collected under Notes at the end.
   - Callouts: `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`.
   - Code blocks with highlighting, a caption from `title="file.yaml"` (or the language) and a copy button.
   - Tables that scroll sideways on phones.
   - Raw HTML for anything else, such as a `<figure class="fig">` with an SVG diagram (see the spot post).
4. Keep `draft: true` while writing. Drafts show in `npm run dev`, and in a build only when `INCLUDE_DRAFTS=true`, with a Draft badge and `noindex`; they never go in the feed. Remove the line to publish.
5. When you change a published post, set `updated` and add a line to `revisions`. Both show at the end of the post.

Reading time, the revision letter in the index (A for the oldest post), newer/older links, related posts (shared tags), the share card and share tags, JSON-LD and the feed are generated.

## Deploy

The site runs on **Vercel**, which builds it from the repo with `npm run build` and serves `dist/` from `/`. Vercel needs no extra settings:

- Leave `BASE_PATH` unset; Vercel serves from the root.
- Drafts are left out unless `INCLUDE_DRAFTS=true` is set in Vercel's environment variables. To see drafts on preview deployments, set it for **Preview** only, never for Production.

## Rebuilding the model and drawings

```sh
cd model
blender -b -P build_yn1.py        # -> out/yn1.blend, out/yn1.glb, out/parts.json
blender -b -P draw_sheets.py      # -> drawings/*.png, drawings/drawings.json
blender -b -P export_sharp.py     # -> out/yn1_sharp.glb (what the live page uses)
```

`model/out/` and `model/drawings/` are build output and not committed. Copy the drawings into `site/`, and base64-encode `yn1_sharp.glb` into `site/yn1.glb.json` as `{"base64": "..."}`.

## Social card and icons

```sh
python3 make_assets.py            # -> site/og.png, favicon-32.png, favicon-192.png, apple-touch-icon.png, icon-512.png
```

Needs Pillow. The social card draws from `site/iso.png` and the fonts in `fonts/` (Archivo and Martian Mono, SIL Open Font License); re-run it after re-rendering the drawings or changing the name or role. The favicons are the yellow-wall portrait (`site/photos/portrait.jpg`, the same photo as the blog avatar): round for browser tabs, square for Apple and the 512 icon.

The homepage and every writing page carry a meta description, canonical URL, Open Graph and Twitter tags, and the icon set. The homepage and the writing index share `site/og.png`. Each post gets its own share card, `/writing/<slug>/og.png`, drawn at build time from its title, summary, date, tags and revision letter (`src/lib/og-card.mjs`, satori and resvg). It uses static Archivo instances in `fonts/` (`archivo-800-112.ttf`, `archivo-600-82.ttf`, cut from the variable font), because satori can't set a variable font's axes. A post with an `image` uses that instead, cropped to 1200×630 (or the largest 1.91:1 crop a smaller image allows). The tags use absolute `https://ricardoherrera.co/` URLs, which resolve now that the domain points at this site.

## Before launch

- The spot interruptions post is live but is still sample text written to show the layout. Rewrite or replace it.
- Not yet checked on a real device: font loading, motion and the phone feel.
