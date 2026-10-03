"""
Phase 8: Multiple ML Models.

Trains KNN, Decision Tree, SVM, Random Forest, Gradient Boosting, and
XGBoost. KNN and SVM use a stratified subsample of the training data
(computationally expensive at 1M+ rows); tree-based models and XGBoost
use the full training set. All models are evaluated on the SAME full
test set for a fair comparison.
"""

import time
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from sklearn.model_selection import train_test_split as tts_subsample
from xgboost import XGBClassifier

from data_loader import load_pv_dataset
from feature_engineering import add_engineered_features
from preprocessing import split_data, get_scaler, RANDOM_STATE

FAULT_NAMES = ['Normal', 'Short Circuit', 'Degradation', 'Open Circuit', 'Shadowing']
SUBSAMPLE_SIZE = 80000


def get_stratified_subsample(X, y, n_samples, random_state=RANDOM_STATE):
    """Stratified subsample for computationally expensive models (KNN, SVM)."""
    if n_samples >= len(X):
        return X, y

    X_sampled, _, y_sampled, _ = tts_subsample(
        X, y,
        train_size=n_samples,
        stratify=y,
        random_state=random_state
    )
    return X_sampled, y_sampled


def evaluate_model(name, model, X_train, y_train, X_test, y_test):
    print("=" * 60)
    print(f"MODEL: {name}")
    print("=" * 60)

    start = time.time()
    model.fit(X_train, y_train)
    train_time = time.time() - start

    y_pred = model.predict(X_test)
    macro_f1 = f1_score(y_test, y_pred, average='macro')

    print(f"Training time: {train_time:.1f}s | Training rows: {len(X_train)}")
    print(f"Macro-F1 Score: {macro_f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=FAULT_NAMES))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print()

    return {'model': name, 'macro_f1': macro_f1, 'train_time': train_time}


def run_all_models():
    df = load_pv_dataset()
    df = add_engineered_features(df)
    X_train, X_test, y_train, y_test = split_data(df)

    scaler = get_scaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    X_train_scaled = pd.DataFrame(X_train_scaled, columns=X_train.columns, index=X_train.index)
    X_test_scaled = pd.DataFrame(X_test_scaled, columns=X_test.columns, index=X_test.index)

    # Subsample for KNN and SVM (scaled data, since both need scaling)
    X_train_sub, y_train_sub = get_stratified_subsample(X_train_scaled, y_train, SUBSAMPLE_SIZE)

    results = []

    # --- Scale-sensitive models on subsample ---
    results.append(evaluate_model(
        "KNN", KNeighborsClassifier(n_neighbors=5),
        X_train_sub, y_train_sub, X_test_scaled, y_test
    ))

    results.append(evaluate_model(
        "SVM", SVC(class_weight='balanced', random_state=RANDOM_STATE),
        X_train_sub, y_train_sub, X_test_scaled, y_test
    ))

    # --- Tree-based models on full data (no scaling needed) ---
    results.append(evaluate_model(
        "Decision Tree", DecisionTreeClassifier(class_weight='balanced', random_state=RANDOM_STATE),
        X_train, y_train, X_test, y_test
    ))

    results.append(evaluate_model(
        "Random Forest", RandomForestClassifier(class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1),
        X_train, y_train, X_test, y_test
    ))

    results.append(evaluate_model(
        "Gradient Boosting", GradientBoostingClassifier(random_state=RANDOM_STATE),
        X_train, y_train, X_test, y_test
    ))

    results.append(evaluate_model(
        "XGBoost", XGBClassifier(random_state=RANDOM_STATE, eval_metric='mlogloss'),
        X_train, y_train, X_test, y_test
    ))

    print("=" * 60)
    print("SUMMARY - All Models")
    print("=" * 60)
    summary_df = pd.DataFrame(results).sort_values('macro_f1', ascending=False)
    print(summary_df.to_string(index=False))
    summary_df.to_csv('../reports/results/phase8_model_comparison.csv', index=False)

    return results


if __name__ == "__main__":
    run_all_models()