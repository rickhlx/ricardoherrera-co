# YN-1 interactive computer — current direction

Updated 2026-11-05. This is the homepage direction being built now. It grew out of the "exploded manual" idea from round 1.

**Source of truth:** [github.com/rickhlx/ricardoherrera-co](https://github.com/rickhlx/ricardoherrera-co). Code and assets live in the repo, not in this Project. See `claude/source-control.md` before working.
**Live prototype:** [YN-1 Drawing Set](https://claude.ai/artifact/1nfNLuhanvDoHRJFYF16i1). Private until shared from the page's Share menu.
**Plan doc:** [Exploded Manual × Blender — Site Plan](https://claude.ai/artifact/TQj3GzLGf6zvbYAUEakxjh). It holds the earlier directions A to G.
**Annotation mockup:** [Annotated Blueprint Sheet](https://claude.ai/artifact/PZh9Urmp8hADv5qfuEzDCd). Sheet 06 with handwritten markup; Ricardo liked it.

## What it is
The homepage is a fictional 1970s workstation, the **YN-1**, modeled in Blender. The browser draws it live in blueprint linework, with hidden edges dashed, floating in a dark drafting void.

- **Look around:** drag to turn the computer and scroll to zoom. Hovering over a part lifts it and turns it orange; there is no label box.
- **Click a part:** the camera flies to that part's drawing sheet, one of six blueprint sheets hanging in a ring around the computer.
- **"Take apart":** explodes the model. This uncovers the logic board.
- **Click the screen:** the camera zooms in and the screen becomes a working terminal. Commands are `help`, `whoami`, `ls`, `cat`, `git log`, `git show`, `open <sheet>`, `take apart`, `crt on|off` and `exit`. Work history is shown as a `git log`, with the current role at `HEAD`. `whoami` prints the yellow-wall portrait redrawn in green phosphor with scanlines, made in the browser from `site/photos/portrait.jpg`.

| Part | Opens | Sheet |
| --- | --- | --- |
| Chassis | Index | 01 General arrangement (isometric, callouts to every sheet) |
| Enclosure | About | 02 Three-view with overall dimensions |
| Logic board | Work | 03 Exploded assembly + parts list (each part a project) |
| Display | Terminal | — |
| (nav / terminal) | Writing | 04 Display detail + revision log (posts) |
| Tape drive | Archive | 05 Tape drive detail (wildcard slot) |
| Keyboard | Contact | 06 Keyboard plan, return key redlined |
| Contact sheet and loupe | Photographs | — (full-screen contact sheet, not a sheet) |

## Handwritten annotations
Hand markup on the sheets makes the drawings feel personal, like an engineer's working set.

- **Two inks:** red pencil for redlines (revision clouds, struck dimensions, "rev B" notes) and white graphite for notes.
- **Kinds of note:** redlines that tell the part's history; navigation disguised as notes ("press return to say hello", "→ sheet 04"); personal margin notes, some in Spanish; initials and dates in the title block.
- **Texture:** tape and a faint coffee ring, kept subtle.
- **Restraint:** three to five notes per sheet. The writing section stays clean, with at most a signature or date stamp.
- **Production:** use real scanned handwriting vectorized to SVG (not a font), so notes can draw themselves with a stroke animation. Notes that carry meaning or links stay as HTML/SVG overlays (crisp, clickable, accessible); texture-only marks can be baked into renders as decals.

**Built so far — Sheet 06 (Contact):** a `.markup` group in the sheet's SVG holds a red revision cloud around the return key, a rev B triangle, and four notes: "rev B — return moved 4 mm in. kept catching the rail.", "ojo: muy justo aquí", "press return to say hello" (mailto link) and "→ sheet 04 for the writing" (flies to Writing). The title block rev is B. Lines draw in with `stroke-dashoffset` and notes fade in, staggered by a `--d` delay, when the camera arrives (the sheet gets a `drawn` class). Reduced motion shows them at once; the no-WebGL flat fallback shows them static. Text uses Caveat as a stand-in until Ricardo's scanned handwriting replaces it.

## Photos
- **Sheet 01 (Index):** the yellow-wall portrait (`site/photos/portrait.jpg`) is paper-clipped beside the name as a print, captioned *Fig. 0 · Operator*, with a handwritten redline note.
- **Sheet 02 (About):** the Paris overlook shot (`site/photos/paris.jpg`) is clipped above the General notes as *Fig. 2-C*, with a handwritten "Paris, 2024" on the print. Note 4 points to it.
- **Contact sheet and loupe (item 7):** replaced the rooftop viewfinder eyepiece. An 8×10 contact sheet lies on the desk to the right of the keyboard, with a loupe standing on it, both built in three.js rather than Blender. Clicking it, the `look` terminal command, or `#photos` opens a full-screen light table: the sheet carries two strips of four frames (a fogged leader, the six photos, the end of the roll) with sprocket holes and edge numbers, and the portrait frame lies on its side as on a real sheet. The loupe magnifies the sheet 3× (2.6× on phones). A mouse carries it; on touch you drag it by the lens. The readout under the sheet shows the exposure and caption of the frame under the loupe. Clicking or tapping a frame marks it with a red china-marker ring; clicking it again enlarges it as a work print. Arrow keys and ◂ ▸ step through the frames. The photos are Paris first, then five street photos from the old `rickhlx/personal-site` repo (`site/photos/street-1.jpg` to `street-5.jpg`, Fujifilm X100F, autumn 2024, with each frame's real exposure). The yellow portrait is not on the sheet; it is on sheet 01, the blog avatar and the favicons. The contact sheet is left out of the top-bar register on purpose; visitors find it on the desk or through `look`.
- Mockup canvas: [YN-1 Photo Moments](https://claude.ai/artifact/SK7uFHMXVWnYhwG3bNDbo5).

## How it's built
Paths are in the repo.
1. `model/build_yn1.py` builds the YN-1 by script in Blender 5.2 (bpy), then saves `yn1.blend` and exports a GLB. Each part is an Empty that carries its section, label and explode vector as glTF extras.
2. `model/draw_sheets.py` renders the blueprint drawings with Freestyle: white lines on transparency, with hidden lines dashed.
3. `model/export_sharp.py` exports a bevel-free GLB for the live view, so its edge lines stay clean.
4. `site/index.html` is the page, built with three.js 0.160. WebGL draws the model and the void. CSS3D places the real HTML sheets and the terminal in 3D, and stops the camera where one CSS pixel equals one screen pixel, so text stays crisp.

Gotchas found so far:
- Start Blender from `read_factory_settings()`, not `use_empty=True`. Freestyle draws nothing from an empty factory scene.
- Read a camera's direction from `rotation_euler.to_matrix()` after changing its rotation. `matrix_world` is stale until the next update.
- Artifacts don't serve `.glb` files, so the model ships base64-encoded inside `yn1.glb.json`. (Vercel can serve `.glb` directly, so this can be simplified later.)

## Open items
- All content is still placeholders (name, projects, posts, roles in `git log`).
- Ideas not built yet: clicking keyboard keys types into the terminal, and real work history in `git log`.
- Annotations: Ricardo hand-writes the Sheet 06 notes (the four notes, "B", a revision cloud, a triangle and two arrows); trace the scans to SVG and swap them in for the Caveat text. Then markup for the other sheets.
- Not yet reviewed on a real device: font loading, motion smoothness and the phone feel.
- Deploy: Vercel builds the site from the repo; see the README.
