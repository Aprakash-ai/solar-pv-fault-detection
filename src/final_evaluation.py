"""
Phase 11: Final Model Evaluation.

Trains the tuned XGBoost model (best params from Phase 10) on the
full training set, then evaluates ONCE on the held-out test set -
the first and only time this test set is used for evaluation.
"""

import os
import pandas as pd
import joblib
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from xgboost import XGBClassifier

from data_loader import load_pv_dataset
from feature_engineering import add_engineered_features
from preprocessing import split_data, RANDOM_STATE

FAULT_NAMES = ['Normal', 'Short Circuit', 'Degradation', 'Open Circuit', 'Shadowing']

BEST_PARAMS = {
    'subsample': 0.8,
    'n_estimators': 300,
    'max_depth': 6,
    'learning_rate': 0.05,
    'colsample_bytree': 0.8,
}


def final_evaluation():
    df = load_pv_dataset()
    df = add_engineered_features(df)
    X_train, X_test, y_train, y_test = split_data(df)

    model = XGBClassifier(
        **BEST_PARAMS,
        random_state=RANDOM_STATE,
        eval_metric='mlogloss'
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    macro_f1 = f1_score(y_test, y_pred, average='macro')

    print("=" * 60)
    print("FINAL MODEL EVALUATION - Tuned XGBoost")
    print("=" * 60)
    print(f"\nFinal Test Macro-F1: {macro_f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=FAULT_NAMES))
    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)

    os.makedirs('../reports/results', exist_ok=True)
    os.makedirs('../models', exist_ok=True)

    cm_df = pd.DataFrame(cm, index=FAULT_NAMES, columns=FAULT_NAMES)
    cm_df.to_csv('../reports/results/phase11_final_confusion_matrix.csv')

    report_dict = classification_report(y_test, y_pred, target_names=FAULT_NAMES, output_dict=True)
    pd.DataFrame(report_dict).transpose().to_csv('../reports/results/phase11_final_classification_report.csv')

    joblib.dump(model, '../models/final_xgboost_model.pkl')
    print("\nModel saved to models/final_xgboost_model.pkl")

    return model, macro_f1


if __name__ == "__main__":
    final_evaluation()