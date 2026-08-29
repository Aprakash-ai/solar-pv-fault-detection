"""
Phase 7: Baseline Model - Logistic Regression.

Establishes baseline metrics using class_weight='balanced' to handle
imbalance (no SMOTE here - full SMOTE comparison happens later in
cross-validation/tuning phases).
"""

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, f1_score

from data_loader import load_pv_dataset
from feature_engineering import add_engineered_features
from preprocessing import split_data, get_scaler, RANDOM_STATE


FAULT_NAMES = ['Normal', 'Short Circuit', 'Degradation', 'Open Circuit', 'Shadowing']


def train_baseline():
    df = load_pv_dataset()
    df = add_engineered_features(df)
    X_train, X_test, y_train, y_test = split_data(df)

    scaler = get_scaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = LogisticRegression(
        class_weight='balanced',
        max_iter=1000,
        random_state=RANDOM_STATE
    )
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)

    macro_f1 = f1_score(y_test, y_pred, average='macro')

    print("=" * 60)
    print("BASELINE MODEL: Logistic Regression (class_weight=balanced)")
    print("=" * 60)
    print(f"\nMacro-F1 Score: {macro_f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=FAULT_NAMES))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    return model, macro_f1


if __name__ == "__main__":
    train_baseline()