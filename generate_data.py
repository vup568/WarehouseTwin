import xml.etree.ElementTree as ET
import json
import os
import math

base_dir = r"e:\SE\SE9_FA26\WarehouseVisualize\aws-robomaker-small-warehouse-world"
world_file = os.path.join(base_dir, "worlds", "small_warehouse.world")
models_dir = os.path.join(base_dir, "models")

with open(world_file, "r", encoding="utf-8") as f:
    world_xml = f.read()

root = ET.fromstring(world_xml)
world = root.find("world")

# Models metadata
model_catalogs = {}
for m_name in os.listdir(models_dir):
    m_path = os.path.join(models_dir, m_name)
    if not os.path.isdir(m_path):
        continue
    
    dae_rel = f"models/{m_name}/meshes/{m_name}_visual.DAE"
    dae_full = os.path.join(base_dir, dae_rel.replace("/", os.sep))
    
    # Read model.config if exists
    config_file = os.path.join(m_path, "model.config")
    desc = m_name
    author = "AWS RoboMaker"
    if os.path.exists(config_file):
        try:
            cfg = ET.parse(config_file).getroot()
            desc_elem = cfg.find("description")
            if desc_elem is not None and desc_elem.text:
                desc = desc_elem.text.strip()
        except Exception:
            pass

    textures = []
    tex_dir = os.path.join(m_path, "materials", "textures")
    if os.path.exists(tex_dir):
        textures = os.listdir(tex_dir)

    model_catalogs[m_name] = {
        "id": m_name,
        "name": m_name.replace("aws_robomaker_warehouse_", "").replace("_", " "),
        "description": desc,
        "dae_path": dae_rel,
        "exists": os.path.exists(dae_full),
        "textures": textures
    }

instances = []
for model in world.findall("model"):
    name = model.get("name")
    include = model.find("include")
    if include is not None and include.find("uri") is not None:
        model_id = include.find("uri").text.strip().replace("model://", "")
    else:
        model_id = name
    
    pose_elem = model.find("pose")
    if pose_elem is not None and pose_elem.text:
        parts = [float(p) for p in pose_elem.text.strip().split()]
    else:
        parts = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

    category = "general"
    if "Shelf" in model_id:
        category = "rack"
    elif "Wall" in model_id:
        category = "wall"
    elif "Roof" in model_id:
        category = "roof"
    elif "Ground" in model_id:
        category = "ground"
    elif "PalletJack" in model_id:
        category = "vehicle"
    elif "Cluttering" in model_id or "Bucket" in model_id:
        category = "cargo"
    elif "Lamp" in model_id:
        category = "light"
    elif "Desk" in model_id or "TrashCan" in model_id:
        category = "facility"

    instances.append({
        "name": name,
        "model_id": model_id,
        "category": category,
        "pose": {
            "x": parts[0],
            "y": parts[1],
            "z": parts[2],
            "roll": parts[3],
            "pitch": parts[4],
            "yaw": parts[5]
        }
    })

output_data = {
    "world_name": "aws_robomaker_small_warehouse_world",
    "catalog": model_catalogs,
    "instances": instances
}

out_path = os.path.join(base_dir, "warehouse_data.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output_data, f, indent=2)

print(f"Generated {out_path} with {len(instances)} instances and {len(model_catalogs)} catalog items.")
