import data_loader

# Uses the first load_* function in data_loader.py, whatever it is named.
loader = next(getattr(data_loader, n) for n in dir(data_loader) if n.startswith("load"))
df = loader()

FAULT_NAMES = ["Normal", "Short Circuit", "Degradation", "Open Circuit", "Shadowing"]
RAW = ["vdc1", "vdc2", "idc1", "idc2", "irr", "pvt"]

print("export const SAMPLES = [")
for class_id, name in enumerate(FAULT_NAMES):
    row = df[df["fault"] == class_id].sample(1, random_state=7).iloc[0]
    values = ", ".join(f"{c}: '{row[c]:.4f}'" for c in RAW)
    print(f"  {{ name: '{name}', values: {{ {values} }} }},")
print("]")