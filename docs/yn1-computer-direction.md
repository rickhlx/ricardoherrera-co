# YN-1 interactive computer — current direction

Updated 2026-11-04. This is the homepage direction being built now. It grew out of the "exploded manual" idea from round 1.

**Live prototype:** [YN-1 Drawing Set](https://claude.ai/artifact/1nfNLuhanvDoHRJFYF16i1). Private until shared from the page's Share menu.
**Plan doc:** [Exploded Manual × Blender — Site Plan](https://claude.ai/artifact/TQj3GzLGf6zvbYAUEakxjh). It holds the earlier directions A to G.

## What it is
The homepage is a fictional 1970s workstation, the **YN-1**, modeled in Blender. The browser draws it live in blueprint linework, with hidden edges dashed, floating in a dark drafting void.

- **Look around:** drag to turn the computer and scroll to zoom. Hovering over a part lifts it, turns it orange, and shows a label.
- **Click a part:** the camera flies to that part's drawing sheet, one of six blueprint sheets hanging in a ring around the computer.
- **"Take apart":** explodes the model. This uncovers the logic board.
- **Click the screen:** the camera zooms in and the screen becomes a working terminal. Commands are `help`, `whoami`, `ls`, `cat`, `git log`, `git show`, `open <sheet>`, `take apart`, `crt on|off` and `exit`. Work history is shown as a `git log`, with the current role at `HEAD`.

| Part | Opens | Sheet |
| --- | --- | --- |
| Chassis | Index | 01 General arrangement (isometric, callouts to every sheet) |
| Enclosure | About | 02 Three-view with overall dimensions |
| Logic board | Work | 03 Exploded assembly + parts list (each part a project) |
| Display | Terminal | — |
| (nav / terminal) | Writing | 04 Display detail + revision log (posts) |
| Tape drive | Archive | 05 Tape drive detail (wildcard slot) |
| Keyboard | Contact | 06 Keyboard plan, return key redlined |

## How it's built
1. `build_yn1.py` builds the YN-1 by script in Blender 5.2 (bpy), then saves `yn1.blend` and exports a GLB. Each part is an Empty that carries its section, label and explode vector as glTF extras.
2. `draw_sheets.py` renders the blueprint drawings with Freestyle: white lines on transparency, with hidden lines dashed.
3. `export_sharp.py` exports a bevel-free GLB for the live view, so its edge lines stay clean.
4. `index.html` is the page, built with three.js 0.160. WebGL draws the model and the void. CSS3D places the real HTML sheets and the terminal in 3D, and stops the camera where one CSS pixel equals one screen pixel, so text stays crisp.

Gotchas found so far:
- Start Blender from `read_factory_settings()`, not `use_empty=True`. Freestyle draws nothing from an empty factory scene.
- Read a camera's direction from `rotation_euler.to_matrix()` after changing its rotation. `matrix_world` is stale until the next update.
- Artifacts don't serve `.glb` files, so the model ships base64-encoded inside `yn1.glb.json`.

## Open items
- All content is still placeholders (name, projects, posts, roles in `git log`).
- Ideas not built yet: clicking keyboard keys types into the terminal, and real work history in `git log`.
- Not yet reviewed on a real device: font loading, motion smoothness and the phone feel.
