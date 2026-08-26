from pathlib import Path
from scipy.io import loadmat


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "dataset" / "raw"


def inspect_mat_file(file_path: Path) -> None:
    print(f"\n{'=' * 60}")
    print(f"File: {file_path.name}")
    print(f"Path: {file_path}")
    print(f"{'=' * 60}")

    if not file_path.exists():
        print("ERROR: File does not exist.")
        return

    data = loadmat(file_path)

    print("Variables:")
    for key, value in data.items():
        if not key.startswith("__"):
            print(
                f"  {key}: "
                f"shape={value.shape}, "
                f"dtype={value.dtype}"
            )


if __name__ == "__main__":
    inspect_mat_file(DATA_DIR / "dataset_elec.mat")
    inspect_mat_file(DATA_DIR / "dataset_amb.mat")