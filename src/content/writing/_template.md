---
# Copy this file to src/content/writing/<slug>.md. The file name becomes the URL: /writing/<slug>/
# Files starting with _ are ignored.
title: Post title
dek: One or two sentences that say what the reader gets. Shown under the title, in the index and in link previews.
date: 2026-11-05
# updated: 2026-11-06        # set when you change a published post, and add a line to revisions
tags: [kubernetes, reliability]
draft: true                  # drafts show in `npm run dev`, not on the live site
# image:                     # optional cover: shown under the header and used for link previews
#   src: ./images/<slug>.jpg # relative to this file; at least 1200×630, it's cropped to that for previews
#   alt: What the image shows
#   caption: Optional line under the image
# series:
#   name: Running on spot
#   part: 2
#   next: Title of the next part, if it isn't out yet
# revisions:
#   - date: 2026-11-06
#     note: Fixed the Helm value name.
---

Opening paragraph. The first line is set in small caps.

## A section heading

Every `##` heading goes in the contents list and gets a shareable link.

> [!NOTE]
> Callouts: NOTE, TIP, IMPORTANT, WARNING, CAUTION.

```yaml title="file-name.yaml"
code: blocks get a caption from title="…" (or the language) and a copy button
```

| Tables | wrap | and scroll on phones |
| --- | --- | --- |
| a | b | c |

A claim that needs a source.[^1]

[^1]: Footnotes collect under Notes at the end, with links back.
