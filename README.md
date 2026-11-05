# ricardoherrera.co

Personal site of Ricardo Herrera. The homepage is the **YN-1**, a fictional 1970s workstation drawn live in blueprint linework; each part opens a drawing sheet (About, Work, Writing, Archive, Contact), and the screen is a working terminal. See [docs/yn1-computer-direction.md](docs/yn1-computer-direction.md).

## Layout

| Path | What |
| --- | --- |
| `site/` | The deployable static site: `index.html` (YN-1, three.js 0.160 from jsDelivr), `writing.html`, drawings, the model (`yn1.glb.json`), social card and icons |
| `model/` | Blender 5.2 scripts that build the YN-1 and render the drawings |
| `make_assets.py` | Builds `site/og.png` and the favicon set |
| `fonts/` | Fonts for `make_assets.py` (OFL) |
| `docs/` | Design direction and research notes |

## Preview

```sh
cd site && python3 -m http.server 8000
```

The page fetches `yn1.glb.json`, so it needs to be served over HTTP, not opened as a file.

## Deploy

Every push to `main` that touches `site/` publishes it to GitHub Pages (`.github/workflows/pages.yml`), at https://rickhlx.github.io/ricardoherrera-co/ until a custom domain is set.

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

Both pages carry a meta description, canonical URL, Open Graph and Twitter tags, and the icon set. The tags use absolute `https://ricardoherrera.co/` URLs, so link previews only show the card once the domain points at this site.

## Before launch

- Both HTML files still carry the claude.ai artifact page wrapper (the first line of each). Replace it with a proper `<head>`.
- Content is mostly placeholders: posts, archive, contact links.
