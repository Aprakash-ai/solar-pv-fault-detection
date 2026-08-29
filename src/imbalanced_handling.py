"""
Class Imbalance Handling for Solar PV Fault Detection.

Provides SMOTE-based oversampling, applied ONLY to training data.
Never apply this to test data — that would be data leakage.
"""

from imblearn.over_sampling import SMOTE
from preprocessing import RANDOM_STATE


def apply_smote(X_train, y_train):
    """
    Apply SMOTE to training data only. Balances minority classes by
    generating synthetic samples (interpolated, not duplicated).
    """
    smote = SMOTE(random_state=RANDOM_STATE)
    X_resampled, y_resampled = smote.fit_resample(X_train, y_train)
    return X_resampled, y_resampled


if __name__ == "__main__":
    from data_loader import load_pv_dataset
    from feature_engineering import add_engineered_features
    from preprocessing import split_data

    df = load_pv_dataset()
    df = add_engineered_features(df)
    X_train, X_test, y_train, y_test = split_data(df)

    print("Before SMOTE - class distribution (train):")
    print(y_train.value_counts())

    X_train_smote, y_train_smote = apply_smote(X_train, y_train)

    print("\nAfter SMOTE - class distribution (train):")
    print(y_train_smote.value_counts())

    print("\nX_train shape before:", X_train.shape)
    print("X_train shape after SMOTE:", X_train_smote.shape)

    print("\nTest set (untouched):")
    print(y_test.value_counts())