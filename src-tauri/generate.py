import json
from tauri import invoke
from pathlib import Path

@invoke.command
def generate_json(project_path: str):
    config = json.load(open(f"{project_path}/config.json"))
    # ... your JSON logic
    final = build_final_config(config)
    output_dir = f"{project_path}/output"
    Path(output_dir).mkdir(exist_ok=True)
    json.dump(final, open(f"{output_dir}/final.json", "w"), indent=2)
    return f"Saved to {output_dir}/final.json"