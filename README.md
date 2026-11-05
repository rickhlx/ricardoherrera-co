# ricardoherrera.co

Personal site of Ricardo Herrera. The homepage is the **YN-1**, a fictional 1970s workstation drawn live in blueprint linework; each part opens a drawing sheet (About, Work, Writing, Archive, Contact), and the screen is a working terminal. See [docs/yn1-computer-direction.md](docs/yn1-computer-direction.md).

## Layout

| Path | What |
| --- | --- |
| `site/` | The hand-built YN-1 homepage: `index.html` (three.js 0.160 from jsDelivr), drawings, photos, the model (`yn1.glb.json`), social card and icons. Astro copies it into the build unchanged. |
| `src/content/writing/` | Blog posts, one Markdown file each. The file name is the URL: `spot-interruptions.md` → `/writing/spot-interruptions/` |
| `src/pages/writing/` | The writing index, the post page and the RSS feed (`/writing/feed.xml`) |
| `src/layouts/`, `src/styles/`, `src/lib/` | Writing layout, styles, Markdown extensions (`markdown.mjs`) and post helpers |
| `model/` | Blender 5.2 scripts that build the YN-1 and render the drawings |
| `make_assets.py` | Builds `site/og.png` and the favicon set |
| `fonts/` | Fonts for `make_assets.py` (OFL) |
| `site/fonts/dmvendor.css` | Dank Mono for the terminal, the vendor's obfuscated web build (Ricardo's personal license). Don't commit the raw `.woff2`/`.otf` files; the EULA forbids redistribution, and `.gitignore` blocks them |
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
2. Fill in the frontmatter: `title`, `dek` (the summary under the title, in the index and in link previews), `date`, `tags`. Optional: `updated`, `series`, `revisions`.
3. Write in Markdown. Beyond the basics you get:
   - `##` headings feed the contents list and get a shareable `#` link.
   - Footnotes with `[^name]`, collected under Notes at the end.
   - Callouts: `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`.
   - Code blocks with highlighting, a caption from `title="file.yaml"` (or the language) and a copy button.
   - Tables that scroll sideways on phones.
   - Raw HTML for anything else, such as a `<figure class="fig">` with an SVG diagram (see the spot post).
4. Keep `draft: true` while writing. Drafts show in `npm run dev` and on the preview build, with a Draft badge and `noindex`; they never go in the feed. Remove the line to publish.
5. When you change a published post, set `updated` and add a line to `revisions`. Both show at the end of the post.

Reading time, the revision letter in the index (A for the oldest post), newer/older links, related posts (shared tags), share tags, JSON-LD and the feed are generated.

## Deploy

Every push to `main` that touches the site builds it with Astro and publishes `dist/` to GitHub Pages (`.github/workflows/pages.yml`), at https://rickhlx.github.io/ricardoherrera-co/ until a custom domain is set. The workflow sets `BASE_PATH=/ricardoherrera-co` for that preview path and `INCLUDE_DRAFTS=true`.

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
python3 make_assets.py            # -> site/og.png, favicon.svg, favicon-32.png, apple-touch-icon.png, icon-512.png
```

Needs Pillow and `rsvg-convert`. It draws from `site/iso.png` and the fonts in `fonts/` (Archivo and Martian Mono, SIL Open Font License). Re-run it after re-rendering the drawings or changing the name or role.

The homepage and every writing page carry a meta description, canonical URL, Open Graph and Twitter tags, and the icon set. The tags use absolute `https://ricardoherrera.co/` URLs, so link previews only show the card once the domain points at this site.

## Before launch

- `site/index.html` still carries the claude.ai artifact page wrapper (its first line). Replace it with a proper `<head>`.
- In `.github/workflows/pages.yml`, remove `BASE_PATH` and set `INCLUDE_DRAFTS` to `"false"` when ricardoherrera.co points at Pages.
- The spot interruptions post is sample text written to show the layout. Rewrite or replace it before taking it out of draft.
- Sheet 04 on the YN-1 and the terminal's `ls writing` still list placeholder posts. Generate them from `src/content/writing/` once real posts exist.
- Content is mostly placeholders: posts, archive, contact links.
