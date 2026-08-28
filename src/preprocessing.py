"""
Preprocessing for Solar PV Fault Detection.

Handles train/test splitting (stratified, done before any resampling
or scaling) and defines the preprocessing pipeline used consistently
across training and inference.
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


RAW_FEATURES = ['vdc1', 'vdc2', 'idc1', 'idc2', 'irr', 'pvt']
ENGINEERED_FEATURES = ['P1', 'P2', 'Ptotal', 'delta_V', 'delta_I', 'delta_P', 'P_per_Irr']
ALL_FEATURES = RAW_FEATURES + ENGINEERED_FEATURES
TARGET = 'fault'
RANDOM_STATE = 42


def split_data(df: pd.DataFrame, test_size: float = 0.2, random_state: int = RANDOM_STATE):
    """
    Stratified train/test split. Must be called BEFORE any scaling
    or imbalance handling to avoid data leakage.
    """
    X = df[ALL_FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        stratify=y,
        random_state=random_state
    )

    return X_train, X_test, y_train, y_test

def get_scaler():
    """
    Returns a fresh StandardScaler instance.
    Fit ONLY on training data, then used to transform both train and test.
    Used for scale-sensitive models: Logistic Regression, KNN, SVM.
    Tree-based models (Decision Tree, Random Forest, Gradient Boosting,
    XGBoost) do not need this.
    """
    return StandardScaler()


if __name__ == "__main__":
    from data_loader import load_pv_dataset
    from feature_engineering import add_engineered_features

    df = load_pv_dataset()
    df = add_engineered_features(df)

    X_train, X_test, y_train, y_test = split_data(df)

    print("X_train shape:", X_train.shape)
    print("X_test shape:", X_test.shape)
    print("\nTrain class distribution (%):")
    print((y_train.value_counts(normalize=True) * 100).round(2))
    print("\nTest class distribution (%):")
    print((y_test.value_counts(normalize=True) * 100).round(2))

    scaler = get_scaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("\nScaled X_train sample (first row):")
    print(X_train_scaled[0])
    print("\nX_train mean (should be ~0):", X_train_scaled.mean().round(4))
    print("X_train std (should be ~1):", X_train_scaled.std().round(4))