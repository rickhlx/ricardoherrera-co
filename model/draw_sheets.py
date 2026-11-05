"""Blueprint line drawings of the YN-1, rendered with Freestyle.

Run after build_yn1.py:  python3 draw_sheets.py
Writes white-line PNGs on transparency to ./drawings, plus drawings.json with
each view's scale (px per mm) and the image position of the model origin, so
the web page can draw dimension lines that match the drawing exactly.
"""
import bpy, math, json, os
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "drawings")
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.open_mainfile(filepath=os.path.join(HERE, "out", "yn1.blend"))
scene = bpy.context.scene
vl = scene.view_layers[0]

# ---------------------------------------------------------------- drawing mode
# Bevels make doubled crease lines; drafted parts read cleaner with sharp edges.
for o in scene.objects:
    for m in getattr(o, "modifiers", []):
        if m.type == "BEVEL":
            m.show_render = False
for name in ("floor",):
    if name in scene.objects:
        scene.objects[name].hide_render = True
for o in scene.objects:
    if o.type == "LIGHT":
        o.hide_render = True

scene.render.engine = "CYCLES"
scene.cycles.samples = 1
scene.cycles.use_denoising = False
scene.render.film_transparent = True
scene.render.use_freestyle = True
scene.render.line_thickness_mode = "ABSOLUTE"
scene.render.line_thickness = 1.0
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "Standard"
vl.use_solid = False          # lines only, no surfaces
vl.use_freestyle = True

fs = vl.freestyle_settings
fs.crease_angle = math.radians(150)
fs.use_culling = False
for ls in list(fs.linesets):
    fs.linesets.remove(ls)

def lineset(name, visibility, thickness, alpha, dashed=False):
    ls = fs.linesets.new(name)
    ls.select_by_visibility = True
    ls.visibility = visibility
    ls.select_by_edge_types = True
    ls.select_silhouette = True
    ls.select_border = True
    ls.select_crease = True
    ls.select_contour = True
    ls.select_external_contour = True
    ls.select_edge_mark = False
    st = ls.linestyle
    st.color = (1, 1, 1)
    st.alpha = alpha
    st.thickness = thickness
    st.caps = "ROUND"
    if dashed:
        st.use_dashed_line = True
        st.dash1, st.gap1 = 7, 5
    return ls

lineset("visible", "VISIBLE", 3.0, 1.0)
lineset("hidden", "HIDDEN", 1.6, 0.4, dashed=True)

# ---------------------------------------------------------------- cameras
cam_data = bpy.data.cameras.new("draft")
cam_data.type = "ORTHO"
cam_data.sensor_fit = "HORIZONTAL"
cam = bpy.data.objects.new("draft", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

PARTS = {o["part"]: o for o in scene.objects if "part" in o.keys()}
HOME = {k: o.location.copy() for k, o in PARTS.items()}

def explode(amount):
    for k, o in PARTS.items():
        e = o["explode"]  # stored Y-up: (x, z, -y)
        o.location = HOME[k] + Vector((e[0], -e[2], e[1])) * amount

def hide_except(keys):
    for k, o in PARTS.items():
        show = keys is None or k in keys
        stack = [o]
        while stack:
            c = stack.pop()
            c.hide_render = not show if c.type != "EMPTY" else c.hide_render
            stack.extend(c.children)

META = {}

def shoot(name, rot_deg, target, ortho, res=(1600, 1100), dist=3.0, keys=None, amount=0.0):
    explode(amount)
    hide_except(keys)
    rot = tuple(math.radians(a) for a in rot_deg)
    cam.rotation_euler = rot
    fwd = cam.rotation_euler.to_matrix() @ Vector((0, 0, -1))
    cam.location = Vector(target) - fwd.normalized() * dist
    cam_data.ortho_scale = ortho
    scene.render.resolution_x, scene.render.resolution_y = res
    scene.render.filepath = os.path.join(OUT, f"{name}.png")
    bpy.context.view_layer.update()
    # image position of the world origin and px per mm, for dimension overlays
    from bpy_extras.object_utils import world_to_camera_view
    def px(p):
        v = world_to_camera_view(scene, cam, Vector(p))
        return [round(v.x * res[0], 2), round((1 - v.y) * res[1], 2)]
    META[name] = dict(w=res[0], h=res[1], px_per_mm=round(res[0] / (ortho * 1000), 5),
                      origin=px((0, 0, 0)), project=None)
    bpy.ops.render.render(write_still=True)
    print("drew", name)
    return px

ISO = (54.7356, 0, -45)       # true isometric from front-left
FRONT = (90, 0, 0)            # looking +Y at the front
TOP = (0, 0, 0)
RIGHT = (90, 0, 90)           # looking -X at the right side

px = shoot("iso", ISO, (0.02, -0.08, 0.18), 1.35)
# a few reference points for leader lines on the cover sheet
META["iso"]["points"] = {k: px(tuple(PARTS[k].children[0].matrix_world.translation)) for k in PARTS
                         if PARTS[k].children}

for name, rot, tgt, scale in (("front", FRONT, (0, 0, 0.18), 1.05),
                              ("top", TOP, (0, -0.08, 0.2), 1.05),
                              ("right", RIGHT, (0, -0.08, 0.18), 1.05)):
    px = shoot(name, rot, tgt, scale, res=(1200, 900))
    # key extents in image px: chassis corners and hood top
    META[name]["marks"] = {
        "x0": px((-0.28, -0.455, 0)), "x1": px((0.28, -0.455, 0)),
        "y0": px((0.28, -0.455, 0)), "y1": px((0.28, 0.23, 0)),
        "z0": px((0.28, 0.23, 0)), "z1": px((0.28, 0.23, 0.35)),
    }

px = shoot("exploded", ISO, (0.04, -0.12, 0.34), 1.9, res=(1600, 1250), amount=1.0)
META["exploded"]["points"] = {}
for k, o in PARTS.items():
    anchor = next((c for c in o.children if c.name.startswith("anchor_")), None)
    if anchor:
        META["exploded"]["points"][k] = px(tuple(anchor.matrix_world.translation))

shoot("keyboard", TOP, (0, -0.37, 0.03), 0.6, res=(1400, 600), keys={"keyboard"})
shoot("display", (70, 0, -30), (-0.07, 0.0, 0.215), 0.55, res=(1200, 1000), keys={"display"})
shoot("tape", (60, 0, 35), (0.19, 0.0, 0.13), 0.32, res=(1100, 900), keys={"tape"})
shoot("logic", (35, 0, -20), (0, 0.08, 0.06), 0.62, res=(1300, 950), keys={"logic"})

explode(0.0)
hide_except(None)
with open(os.path.join(OUT, "drawings.json"), "w") as fh:
    json.dump(META, fh, indent=1)
print("done")
