from pathlib import Path

import numpy as np
from scipy.io import loadmat


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "dataset" / "raw"


def main() -> None:
    data = loadmat(DATA_DIR / "dataset_amb.mat")

    labels = data["f_nv"].flatten()

    unique_labels, counts = np.unique(labels, return_counts=True)

    print("=" * 60)
    print("FAULT LABEL DISTRIBUTION")
    print("=" * 60)

    print(f"Total observations: {len(labels):,}")
    print()

    for label, count in zip(unique_labels, counts):
        percentage = (count / len(labels)) * 100

        print(
            f"Label {label}: "
            f"{count:,} observations "
            f"({percentage:.2f}%)"
        )


if __name__ == "__main__":
    main()