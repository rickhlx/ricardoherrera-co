# YN-1 interactive computer — current direction

Updated 2026-11-07. This is the homepage direction being built now. It grew out of the "exploded manual" idea from round 1.

**Source of truth:** [github.com/rickhlx/ricardoherrera-co](https://github.com/rickhlx/ricardoherrera-co). Code and assets live in the repo, not in this Project. See `claude/source-control.md` before working.
**Live prototype:** [YN-1 Drawing Set](https://claude.ai/artifact/1nfNLuhanvDoHRJFYF16i1). Private until shared from the page's Share menu.
**Plan doc:** [Exploded Manual × Blender — Site Plan](https://claude.ai/artifact/TQj3GzLGf6zvbYAUEakxjh). It holds the earlier directions A to G.
**Annotation mockup:** [Annotated Blueprint Sheet](https://claude.ai/artifact/PZh9Urmp8hADv5qfuEzDCd). Sheet 06 with handwritten markup; Ricardo liked it.

## What it is
The homepage is a fictional 1970s workstation, the **YN-1**, modeled in Blender. The browser draws it live in blueprint linework, with hidden edges dashed, floating in a dark drafting void.

- **Look around:** drag to turn the computer and scroll to zoom. Hovering over a part lifts it and turns it orange; there is no label box.
- **Click a part:** the camera flies to that part's drawing sheet, one of six blueprint sheets hanging in a ring around the computer.
- **"Take apart":** explodes the model. This uncovers the logic board.
- **Click the screen:** the camera zooms in and the screen becomes a working terminal. Commands are `help`, `whoami`, `ls`, `cat`, `unlock`, `lock`, `git log`, `git show`, `open <sheet>`, `take apart`, `crt on|off`, `look`, `sound on|off` and `exit`, plus `uptime` (years in infrastructure since October 2013), `status` (an SLO page whose error budget burns 2.5% for every unknown command), `top`, `ping ricardo`, `history`, `man yn1`, `date` and `reboot` (runs the cold boot again). Unlisted: `kubectl get pods` (the coffee pod is in CrashLoopBackOff), `sudo`, `rm -rf`, `fortune`, `echo`, `pwd`, `cd`, `vim` and `beep`. Work history is shown as a `git log`, with the current role at `HEAD`. `ls` also lists `do-not-open.txt`, which is locked: `unlock` asks for a password, which is the code written on the back of the sticky note (peel it on the desk). It opens a short operator's log easter egg; `lock` closes it again. `whoami` prints the yellow-wall portrait redrawn in green phosphor with scanlines, made in the browser from `site/photos/portrait.jpg`.
- **Cold boot:** on every load of the homepage, refreshes included, the YN-1 powers on as the page opens. The line work plots itself part by part (chassis, logic board, tape, enclosure, display, keyboard, contact sheet, sticky note), the fills fade in, and the screen runs a power-on self-test (ROM rev B, memory counting to 64K, tape, display) mirrored in the bottom bar, ending on a beep. About 2.7 seconds; any click or key skips it. It doesn't run on deep links (`#about` etc.) or with reduced motion.
- **Sound:** on by default, synthesized with Web Audio (no audio files). Key clicks and a heavier return in the terminal, a relay when a part is clicked, a faint tick on hover, air during camera flights, a paper sound when a sheet arrives, a screw ratchet for take apart, a peel for the sticky note, a degauss thunk and a quiet mains hum while the terminal is up, a shutter and wind-on in the viewfinder, and the power switch and fan spin-up on the cold boot. Browsers keep audio silent until the first click or key, so the first-load boot is usually silent. The switch is in the top bar (just the lamp between 821 and 1180 px wide); `sound off` in the terminal does the same. The choice is remembered in `localStorage` (`yn1.sound`).
- **Drafting cursor:** with a mouse or trackpad, the pointer over a sheet's drawing becomes a crosshair. Two thin arms cross the whole sheet like a drafting machine, a small orange readout gives the zone and position (`C2 · X 0241 · Y 344 mm`, from the bottom-left corner, 1 CSS px = 1 mm), and the matching zone letters on the border turn orange. Off on touch.

| Part | Opens | Sheet |
| --- | --- | --- |
| Chassis | Index | 01 General arrangement (isometric, callouts to every sheet) |
| Enclosure | About | 02 Three-view with overall dimensions |
| Logic board | Work | 03 Exploded assembly + parts list (each part a project) |
| Display | Terminal | — |
| (nav / terminal) | Writing | 04 Display detail + revision log (posts) |
| Tape drive | Archive | 05 Tape drive detail (wildcard slot) |
| Keyboard | Contact | 06 Keyboard plan, return key redlined |
| Contact sheet (item 7) | Photographs | — (full-screen viewfinder, not a sheet) |

## Handwritten annotations
Hand markup on the sheets makes the drawings feel personal, like an engineer's working set.

- **Two inks:** red pencil for redlines (revision clouds, struck dimensions, "rev B" notes) and white graphite for notes.
- **Kinds of note:** redlines that tell the part's history; navigation disguised as notes ("press return to say hello", "→ sheet 04"); personal margin notes, some in Spanish; initials and dates in the title block.
- **Texture:** tape and a faint coffee ring, kept subtle.
- **Restraint:** three to five notes per sheet. The writing section stays clean, with at most a signature or date stamp.
- **Production:** use real scanned handwriting vectorized to SVG (not a font), so notes can draw themselves with a stroke animation. Notes that carry meaning or links stay as HTML/SVG overlays (crisp, clickable, accessible); texture-only marks can be baked into renders as decals.

**On hold (November 2026):** all stand-in handwriting is gone until Ricardo's real handwriting is scanned. Removed: Sheet 06's `.markup` group (revision cloud around the return key, rev B triangle, four Caveat-font notes that drew themselves in on arrival), the "that's me" note beside the portrait on Sheet 01, and "Paris, 2024" on the Sheet 02 print. The sticky note by the keyboard stays, since its back holds the `unlock` password, but is now set in Martian Mono. The Caveat font is no longer loaded. When handwriting comes back, follow the production notes above.

## Photos
- **Sheet 01 (Index):** the yellow-wall portrait (`site/photos/portrait.jpg`) is paper-clipped beside the name as a print, captioned *Fig. 0 · Operator*.
- **Sheet 02 (About):** the Paris overlook shot (`site/photos/paris.jpg`) is clipped above the General notes as *Fig. 2-C*. Note 4 points to it.
- **Viewfinder (item 7):** the model shows it as an 8×10 contact sheet lying on the desk to the right of the keyboard, with a loupe standing on it, added in three.js rather than Blender. (It replaced a rangefinder-style eyepiece on top of the enclosure.) Clicking it, the `look` terminal command, or `#viewfinder` opens a full-screen viewfinder, seen as through the loupe: the photo fades out softly at the edge of a round lens with a faint rim, above an orange exposure readout. **Advance** winds through the roll: Paris first, then five street photos from the old `rickhlx/personal-site` repo (`site/photos/street-1.jpg` to `street-5.jpg`, Fujifilm X100F, autumn 2024; the readout shows each frame's real exposure). The yellow portrait is not in the roll; it is on sheet 01, the blog avatar and the favicons. The viewfinder is left out of the top-bar register on purpose; visitors find it on the model or through `look`.
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
- Placeholder content left: the sample spot post. Everything else is real; the Archive sheet (05) holds the "things I use" list carried over from the old site's /uses page.
- Idea not built yet: clicking keyboard keys types into the terminal.
- Not yet reviewed on a real device: font loading, motion smoothness, the phone feel, and the sound mix (levels were set by ear in code, not heard on speakers).
- Deploy: Vercel builds the site from the repo; see the README.
