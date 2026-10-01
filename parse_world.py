import xml.etree.ElementTree as ET
import json
import re

world_path = r"e:\SE\SE9_FA26\WarehouseVisualize\aws-robomaker-small-warehouse-world\worlds\small_warehouse.world"

with open(world_path, "r", encoding="utf-8") as f:
    xml_content = f.read()

# Parse XML
root = ET.fromstring(xml_content)
world = root.find("world")

models = []
for model in world.findall("model"):
    name = model.get("name")
    include = model.find("include")
    if include is not None:
        uri = include.find("uri").text.strip()
        model_id = uri.replace("model://", "")
    else:
        model_id = name
    
    pose_elem = model.find("pose")
    if pose_elem is not None and pose_elem.text:
        parts = [float(p) for p in pose_elem.text.strip().split()]
    else:
        parts = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    
    models.append({
        "name": name,
        "model_id": model_id,
        "x": parts[0],
        "y": parts[1],
        "z": parts[2],
        "roll": parts[3],
        "pitch": parts[4],
        "yaw": parts[5]
    })

print(f"Total models parsed: {len(models)}")
print(json.dumps(models, indent=2))
