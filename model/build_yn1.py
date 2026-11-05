"""YN-1 workstation — grey-box blockout, built entirely by script.

Run:  python3 build_yn1.py [--render]
Outputs (in ./out):
  yn1.blend        the scene, open it in Blender to tweak
  yn1.glb          parts + callout anchors + hero camera, for three.js
  hero.png         Cycles render of the hero camera (transparent bg, shadow kept)
  parts.json       part list: section, label, explode vector (three.js Y-up)

Blender is Z-up, front of the device faces -Y, the camera sits front-left.
Every part is an Empty (the part root) with mesh children; the root carries
custom properties that export as glTF extras.
"""
import bpy, math, json, os, sys
from mathutils import Vector

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
os.makedirs(OUT, exist_ok=True)
RENDER = "--render" in sys.argv

# ---------------------------------------------------------------- reset
# Start from the full default scene: an empty factory scene leaves Freestyle unable to draw.
bpy.ops.wm.read_factory_settings()
for _o in list(bpy.data.objects):
    bpy.data.objects.remove(_o)
scene = bpy.context.scene

def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, 1.0)

MATS = {}
def mat(name, hexcol, rough=0.55, metal=0.0, emit=None, emit_strength=0.0):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = srgb(hexcol)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = srgb(emit)
        b.inputs["Emission Strength"].default_value = emit_strength
    MATS[name] = m
    return m

PAL = {
    "beige": ("Case beige", "#d8ccb2", 0.6),
    "beige2": ("Panel beige", "#c3b393", 0.6),
    "brown": ("Chassis brown", "#3a2a20", 0.5),
    "orange": ("Signal orange", "#e2622b", 0.45),
    "smoke": ("Smoked glass", "#16201b", 0.15),
    "tube": ("Tube black", "#262624", 0.5),
    "pcb": ("Board green", "#2f5a48", 0.5),
    "chip": ("Chip black", "#1b1b1b", 0.4),
    "metal": ("Brushed metal", "#9a978f", 0.35),
    "key": ("Key brown", "#5a4636", 0.55),
}
def M(k):
    n, h, r = PAL[k]
    if k == "smoke":
        return mat(n, h, r, emit="#3d7a5a", emit_strength=0.25)
    if k == "metal":
        return mat(n, h, r, metal=0.9)
    return mat(n, h, r)

def box(name, size, loc, material, parent=None, bevel=0.004, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        b = o.modifiers.new("Bevel", "BEVEL")
        b.width = bevel
        b.segments = 3
        b.limit_method = "ANGLE"
    o.data.materials.append(material)
    if parent:
        parent_keep(o, parent)
    return o

def cut(target, size, loc):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    c = bpy.context.active_object
    c.scale = size
    c.display_type = "WIRE"
    c.hide_render = True
    mod = target.modifiers.new("Cut", "BOOLEAN")
    mod.object = c
    mod.operation = "DIFFERENCE"
    # keep bevel last so the cut edges get rounded too
    if "Bevel" in target.modifiers:
        target.modifiers.move(len(target.modifiers) - 1, 0)
    return c

def parent_keep(child, parent):
    mw = child.matrix_world.copy()
    child.parent = parent
    child.matrix_world = mw

def part(key, label, section, fig, explode, anchor):
    """A part root: an Empty that carries the site metadata."""
    e = bpy.data.objects.new(f"part_{key}", None)
    e.empty_display_type = "PLAIN_AXES"
    e.empty_display_size = 0.03
    scene.collection.objects.link(e)
    e["part"] = key
    e["label"] = label
    e["section"] = section
    e["fig"] = fig
    ex = Vector(explode)
    # three.js is Y-up: (x, z, -y)
    e["explode"] = [ex.x, ex.z, -ex.y]
    a = bpy.data.objects.new(f"anchor_{key}", None)
    a.empty_display_type = "SPHERE"
    a.empty_display_size = 0.01
    a.location = anchor
    scene.collection.objects.link(a)
    a.parent = e
    PARTS.append(dict(key=key, label=label, section=section, fig=fig,
                      explode=[ex.x, ex.z, -ex.y]))
    return e

PARTS = []

# ---------------------------------------------------------------- chassis (Index)
chassis = part("chassis", "Chassis", "Index", "Item 1", (0, 0, -0.06), (0.0, -0.23, 0.05))
box("chassis_pan", (0.56, 0.46, 0.05), (0, 0, 0.025), M("brown"), chassis, 0.006)
box("chassis_stripe", (0.562, 0.004, 0.012), (0, -0.2305, 0.03), M("orange"), chassis, 0)
box("power_unit", (0.14, 0.12, 0.10), (0.18, 0.16, 0.10), M("metal"), chassis, 0.003)
for i in range(4):  # rubber feet
    x = 0.24 if i % 2 else -0.24
    y = 0.19 if i // 2 else -0.19
    bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=0.012, location=(x, y, -0.006))
    f = bpy.context.active_object
    f.name = f"foot_{i}"
    f.data.materials.append(M("chip"))
    parent_keep(f, chassis)
# nameplate on the front deck
bpy.ops.object.text_add(location=(-0.25, -0.215, 0.0505))
t = bpy.context.active_object
t.data.body = "YN-1"
t.data.size = 0.045
t.data.extrude = 0.0015
t.name = "nameplate"
bpy.ops.object.convert(target="MESH")
t = bpy.context.active_object
t.data.materials.append(M("beige"))
parent_keep(t, chassis)

# ---------------------------------------------------------------- logic board (Work)
logic = part("logic", "Logic board", "Work", "Item 3", (0, 0.10, 0.17), (0.0, 0.08, 0.075))
box("pcb", (0.48, 0.26, 0.012), (0, 0.08, 0.058), M("pcb"), logic, 0.001)
chips = [(-0.16, 0.02, 0.07, 0.04), (-0.06, 0.02, 0.07, 0.04), (0.04, 0.02, 0.05, 0.04),
         (-0.16, 0.12, 0.09, 0.05), (-0.04, 0.13, 0.05, 0.05), (0.06, 0.13, 0.04, 0.03)]
for i, (x, y, w, d) in enumerate(chips):
    box(f"chip_{i}", (w, d, 0.01), (x, y, 0.069), M("chip"), logic, 0.0008)
box("heatsink", (0.06, 0.06, 0.035), (-0.17, 0.17, 0.0815), M("metal"), logic, 0.001)

# ---------------------------------------------------------------- hood / enclosure (About)
hood = part("hood", "Enclosure", "About", "Item 2", (0, 0.02, 0.46), (0.0, 0.08, 0.35))
shell = box("hood_shell", (0.56, 0.30, 0.30), (0, 0.08, 0.20), M("beige"), None, 0.012)
cut(shell, (0.30, 0.10, 0.21), (-0.07, -0.07, 0.215))   # screen window
cut(shell, (0.13, 0.10, 0.052), (0.19, -0.07, 0.13))    # tape slot
cut(shell, (0.54, 0.28, 0.32), (0, 0.08, 0.18))          # hollow it, open bottom
parent_keep(shell, hood)
for i in range(6):  # vent slats on top
    box(f"vent_{i}", (0.16, 0.006, 0.004), (0.14, 0.12 + i * 0.016, 0.351), M("brown"), hood, 0)
box("hood_badge", (0.05, 0.004, 0.012), (0.19, -0.0705, 0.28), M("orange"), hood, 0)

# ---------------------------------------------------------------- display (Writing)
disp = part("display", "Display", "Writing", "Item 4", (0, -0.30, 0.16), (-0.07, -0.06, 0.32))
box("screen", (0.29, 0.02, 0.20), (-0.07, -0.055, 0.215), M("smoke"), disp, 0.01)
box("bezel", (0.31, 0.012, 0.22), (-0.07, -0.042, 0.215), M("tube"), disp, 0.004)
bpy.ops.mesh.primitive_cone_add(radius1=0.115, radius2=0.045, depth=0.20, vertices=32,
                                location=(-0.07, 0.065, 0.215), rotation=(-math.pi / 2, 0, 0))
tube = bpy.context.active_object
tube.name = "tube"
tube.data.materials.append(M("tube"))
parent_keep(tube, disp)

# ---------------------------------------------------------------- tape drive (Archive)
tape = part("tape", "Tape drive", "Archive", "Item 5", (0.34, -0.04, 0.06), (0.25, -0.07, 0.155))
box("tape_body", (0.125, 0.20, 0.048), (0.19, 0.0, 0.13), M("beige2"), tape, 0.004)
box("tape_door", (0.09, 0.004, 0.022), (0.185, -0.1, 0.132), M("smoke"), tape, 0.002)
box("tape_eject", (0.014, 0.006, 0.01), (0.238, -0.1, 0.132), M("orange"), tape, 0.001)

# ---------------------------------------------------------------- keyboard (Contact)
kb = part("keyboard", "Keyboard", "Contact", "Item 6", (0, -0.22, 0.05), (0.0, -0.36, 0.06))
tilt = (math.radians(4), 0, 0)
box("kb_base", (0.50, 0.17, 0.035), (0, -0.37, 0.0175), M("beige"), kb, 0.008, tilt)
key = box("keys", (0.026, 0.026, 0.014), (-0.21, -0.43, 0.04), M("key"), None, 0.003, tilt)
arr = key.modifiers.new("Row", "ARRAY"); arr.count = 14; arr.relative_offset_displace = (1.23, 0, 0)
arr2 = key.modifiers.new("Col", "ARRAY"); arr2.count = 4; arr2.relative_offset_displace = (0, 1.23, 0)
key.modifiers.move(2, 0); key.modifiers.move(2, 0)  # arrays before bevel
parent_keep(key, kb)
box("key_return", (0.05, 0.026, 0.014), (0.215, -0.39, 0.042), M("orange"), kb, 0.003, tilt)

# ---------------------------------------------------------------- floor (render only)
bpy.ops.mesh.primitive_plane_add(size=6, location=(0, 0, -0.012))
floor = bpy.context.active_object
floor.name = "floor"
floor.is_shadow_catcher = True

# ---------------------------------------------------------------- camera
CAM_LOC = Vector((-0.95, -1.40, 0.88))
TARGET = Vector((0.02, -0.08, 0.17))
cam_data = bpy.data.cameras.new("hero_cam")
cam_data.sensor_fit = "VERTICAL"
cam_data.sensor_height = 24
cam_data.lens = 48
cam = bpy.data.objects.new("hero_cam", cam_data)
scene.collection.objects.link(cam)
cam.location = CAM_LOC
cam.rotation_euler = (TARGET - CAM_LOC).to_track_quat("-Z", "Y").to_euler()
scene.camera = cam

# ---------------------------------------------------------------- lights
def area(name, loc, power, size, color="#fff4e6"):
    d = bpy.data.lights.new(name, "AREA")
    d.energy = power
    d.size = size
    d.color = srgb(color)[:3]
    o = bpy.data.objects.new(name, d)
    o.location = loc
    o.rotation_euler = (Vector((0, 0, 0.15)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    scene.collection.objects.link(o)
area("key", (-1.2, -1.0, 1.6), 95, 1.2)
area("fill", (1.4, -0.9, 0.7), 28, 1.5, "#e6eeff")
area("rim", (0.4, 1.4, 1.2), 70, 0.8)

world = bpy.data.worlds.new("world")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = srgb("#ece6da")
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.45
scene.world = world

# ---------------------------------------------------------------- render settings
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 64
scene.cycles.use_denoising = True
scene.render.film_transparent = True
scene.render.resolution_x = 2400
scene.render.resolution_y = 1200
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "Standard"

# ---------------------------------------------------------------- save + export
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "yn1.blend"))

bpy.ops.object.select_all(action="DESELECT")
for o in scene.objects:
    if o.name != "floor" and not o.hide_render:
        o.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=os.path.join(OUT, "yn1.glb"),
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_extras=True,
    export_cameras=True,
    export_lights=False,
)

cam_info = dict(
    position=[CAM_LOC.x, CAM_LOC.z, -CAM_LOC.y],
    target=[TARGET.x, TARGET.z, -TARGET.y],
    vfov=math.degrees(2 * math.atan(cam_data.sensor_height / (2 * cam_data.lens))),
    aspect=scene.render.resolution_x / scene.render.resolution_y,
)
with open(os.path.join(OUT, "parts.json"), "w") as fh:
    json.dump(dict(camera=cam_info, parts=PARTS), fh, indent=2)

if RENDER:
    scene.render.filepath = os.path.join(OUT, "hero.png")
    bpy.ops.render.render(write_still=True)

print("done", OUT)
