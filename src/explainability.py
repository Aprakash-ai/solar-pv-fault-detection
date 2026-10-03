"""
Phase 12: Explainable AI.

Global feature importance (XGBoost built-in) and SHAP values
(on a sample of the test set, for speed) to understand what
drives the model's predictions.
"""

import os
import pandas as pd
import matplotlib.pyplot as plt
import shap
import joblib

from data_loader import load_pv_dataset
from feature_engineering import add_engineered_features
from preprocessing import split_data, RANDOM_STATE

FAULT_NAMES = ['Normal', 'Short Circuit', 'Degradation', 'Open Circuit', 'Shadowing']
SHAP_SAMPLE_SIZE = 3000


def run_explainability():
    df = load_pv_dataset()
    df = add_engineered_features(df)
    X_train, X_test, y_train, y_test = split_data(df)

    model = joblib.load('../models/final_xgboost_model.pkl')

    os.makedirs('../reports/figures', exist_ok=True)
    os.makedirs('../reports/results', exist_ok=True)

    # --- 1. Global feature importance (XGBoost built-in) ---
    importance_df = pd.DataFrame({
        'feature': X_train.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)

    print("=" * 60)
    print("GLOBAL FEATURE IMPORTANCE (XGBoost built-in)")
    print("=" * 60)
    print(importance_df.to_string(index=False))
    importance_df.to_csv('../reports/results/phase12_feature_importance.csv', index=False)

    plt.figure(figsize=(8, 6))
    plt.barh(importance_df['feature'], importance_df['importance'])
    plt.xlabel('Importance')
    plt.title('XGBoost Feature Importance')
    plt.gca().invert_yaxis()
    plt.tight_layout()
    plt.savefig('../reports/figures/feature_importance.png')
    plt.close()

    # --- 2. SHAP values on a sample of the test set ---
    X_sample = X_test.sample(SHAP_SAMPLE_SIZE, random_state=RANDOM_STATE)

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_sample)

    # Global SHAP summary (bar plot, averaged across classes)
    plt.figure()
    shap.summary_plot(shap_values, X_sample, class_names=FAULT_NAMES,
                       plot_type='bar', show=False)
    plt.tight_layout()
    plt.savefig('../reports/figures/shap_summary_bar.png')
    plt.close()

    # Detailed summary for one class (Shadowing - our known weak point)
    shadowing_idx = FAULT_NAMES.index('Shadowing')
    plt.figure()
    shap.summary_plot(shap_values[:, :, shadowing_idx], X_sample, show=False)
    plt.tight_layout()
    plt.savefig('../reports/figures/shap_summary_shadowing.png')
    plt.close()

    print("\nSHAP plots saved to reports/figures/")
    print("Done.")


if __name__ == "__main__":
    run_explainability()