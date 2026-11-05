# Working on ricardoherrera.co

This repo is the source of truth for Ricardo Herrera's site redesign. It is shared across sessions: pull before you start, and commit and push when you finish. Don't leave work only in an artifact or a local file.

- Read `README.md` for the layout, preview, rebuild steps and before-launch list. Read `docs/yn1-computer-direction.md` for the design direction.
- The site is built with Astro. `site/` holds the hand-built YN-1 homepage and is copied into the build as-is; blog posts are Markdown in `src/content/writing/`. A push to `main` that touches the site builds it and deploys `dist/` to GitHub Pages (`.github/workflows/pages.yml`).
- Check changes with `npm run build` before pushing.
- `ricardoherrera.co` still serves the current Next.js site. Don't add a `CNAME` or change DNS unless Ricardo asks for the cutover.
- Prototypes are also published as claude.ai artifacts (YN-1 page, Writing page). If you change one, bring the change into the repo too (`site/` for the YN-1, `src/` for Writing). If they disagree, the repo wins.
- Keep `docs/` in sync with the notes in the claude.ai Project when either changes.
- Small, focused commits with clear messages. Use a branch and PR for larger changes.
