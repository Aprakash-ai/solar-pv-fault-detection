from pathlib import Path

import pandas as pd
from scipy.io import loadmat


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "dataset" / "raw"


def load_pv_dataset() -> pd.DataFrame:
    """Load and combine electrical, environmental, and fault data."""

    electrical_data = loadmat(DATA_DIR / "dataset_elec.mat")
    environmental_data = loadmat(DATA_DIR / "dataset_amb.mat")

    df = pd.DataFrame(
        {
            "vdc1": electrical_data["vdc1"].flatten(),
            "vdc2": electrical_data["vdc2"].flatten(),
            "idc1": electrical_data["idc1"].flatten(),
            "idc2": electrical_data["idc2"].flatten(),
            "irr": environmental_data["irr"].flatten(),
            "pvt": environmental_data["pvt"].flatten(),
            "fault": environmental_data["f_nv"].flatten(),
        }
    )

    return df


if __name__ == "__main__":
    dataset = load_pv_dataset()

    print("=" * 60)
    print("SOLAR PV DATASET")
    print("=" * 60)

    print(f"Shape: {dataset.shape}")

    print("\nColumns:")
    print(dataset.columns.tolist())

    print("\nFirst 5 rows:")
    print(dataset.head())

    print("\nData types:")
    print(dataset.dtypes)

    print("\nMissing values:")
    print(dataset.isnull().sum())