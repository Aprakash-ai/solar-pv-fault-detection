from pathlib import Path

import numpy as np

from data_loader import load_pv_dataset


PROJECT_ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    df = load_pv_dataset()

    print("=" * 70)
    print("SOLAR PV DATA QUALITY VALIDATION")
    print("=" * 70)

    # 1. Dataset shape
    print("\n[1] Dataset Shape")
    print(df.shape)

    # 2. Missing values
    print("\n[2] Missing Values")
    print(df.isnull().sum())

    # 3. Infinite values
    print("\n[3] Infinite Values")

    numeric_columns = df.select_dtypes(include=np.number).columns

    infinite_counts = np.isinf(df[numeric_columns]).sum()

    print(infinite_counts)

    # 4. Duplicate rows
    print("\n[4] Duplicate Rows")

    duplicate_count = df.duplicated().sum()

    print(f"Duplicate rows: {duplicate_count:,}")

    # 5. Descriptive statistics
    print("\n[5] Descriptive Statistics")

    print(df.describe().T)

    # zero values
    print("\n[6] Zero Value Counts")

    zero_counts = (df == 0).sum()

    print(zero_counts)

    # 7. Negative values
    print("\n[7] Negative Value Counts")

    negative_counts = (df < 0).sum()

    print(negative_counts)

    # 8. Target distribution
    print("\n[8] Fault Distribution")

    fault_counts = df["fault"].value_counts().sort_index()

    total = len(df)

    for fault, count in fault_counts.items():
        percentage = count / total * 100

        print(
            f"Fault {fault}: "
            f"{count:,} samples "
            f"({percentage:.2f}%)"
        )

    # feature ranges
    print("\n[9] Feature Ranges")

    for column in numeric_columns:
        print(
            f"{column:>6}: "
            f"min={df[column].min():.6f}, "
            f"max={df[column].max():.6f}"
        )

    print("\n" + "=" * 70)
    print("VALIDATION COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()