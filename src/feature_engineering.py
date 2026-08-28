"""
Feature Engineering for Solar PV Fault Detection.

Creates physically meaningful derived features from raw electrical
and environmental measurements. This module is used both during
training and at inference time, so the transformation must stay
identical in both places.
"""

import pandas as pd


def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add derived power, imbalance, and normalized features to the dataframe.

    Expects columns: vdc1, vdc2, idc1, idc2, irr
    Adds columns: P1, P2, Ptotal, delta_V, delta_I, delta_P, P_per_Irr
    """
    df = df.copy()

    # Power per string (P = V x I)
    df['P1'] = df['vdc1'] * df['idc1']
    df['P2'] = df['vdc2'] * df['idc2']

    # Total system power
    df['Ptotal'] = df['P1'] + df['P2']

    # Inter-string imbalance features
    df['delta_V'] = df['vdc1'] - df['vdc2']
    df['delta_I'] = df['idc1'] - df['idc2']
    df['delta_P'] = df['P1'] - df['P2']

    # Power normalized by irradiance.
    # When irradiance is very low (near-zero / night-time noise), the
    # ratio explodes to unrealistic values, so we treat irr <= 5 as
    # "negligible sunlight" and set the ratio to 0 in that case.
    df['P_per_Irr'] = df['Ptotal'] / df['irr'].where(df['irr'] > 5, pd.NA)
    df['P_per_Irr'] = df['P_per_Irr'].fillna(0)

    return df


if __name__ == "__main__":
    from data_loader import load_pv_dataset

    df = load_pv_dataset()
    df_features = add_engineered_features(df)

    new_cols = ['P1', 'P2', 'Ptotal', 'delta_V', 'delta_I', 'delta_P', 'P_per_Irr']

    print("Original columns:", list(df.columns))
    print("New columns:", list(df_features.columns))
    print("\nSample rows with new features:")
    print(df_features[new_cols].head())
    print("\nMissing values in new features:")
    print(df_features[new_cols].isnull().sum())
    print("\nP_per_Irr stats after fix:")
    print(df_features['P_per_Irr'].describe())