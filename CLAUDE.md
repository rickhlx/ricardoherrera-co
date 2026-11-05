# Working on ricardoherrera.co

This repo is the source of truth for Ricardo Herrera's site redesign. It is shared across sessions: pull before you start, and commit and push when you finish. Don't leave work only in an artifact or a local file.

- Read `README.md` for the layout, preview, rebuild steps and before-launch list. Read `docs/yn1-computer-direction.md` for the design direction.
- `site/` is what gets published. A push to `main` that touches `site/` deploys it to GitHub Pages (`.github/workflows/pages.yml`).
- `ricardoherrera.co` still serves the current Next.js site. Don't add a `CNAME` or change DNS unless Ricardo asks for the cutover.
- Prototypes are also published as claude.ai artifacts (YN-1 page, Writing page). If you change one, bring the change into `site/` here too. If they disagree, the repo wins.
- Keep `docs/` in sync with the notes in the claude.ai Project when either changes.
- Small, focused commits with clear messages. Use a branch and PR for larger changes.
