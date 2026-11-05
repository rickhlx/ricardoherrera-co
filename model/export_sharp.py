"""Export the YN-1 without bevels, for the live blueprint view (clean edge lines)."""
import bpy, os
HERE = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.open_mainfile(filepath=os.path.join(HERE, "out", "yn1.blend"))
s = bpy.context.scene
for o in s.objects:
    for m in getattr(o, "modifiers", []):
        if m.type == "BEVEL":
            m.show_viewport = False
            m.show_render = False
bpy.ops.object.select_all(action="DESELECT")
for o in s.objects:
    if o.type in ("MESH", "EMPTY") and o.name != "floor" and not o.hide_render:
        o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, "out", "yn1_sharp.glb"), export_format="GLB",
    use_selection=True, export_apply=True, export_extras=True, export_cameras=False, export_lights=False,
    export_materials="NONE")
print("ok")
