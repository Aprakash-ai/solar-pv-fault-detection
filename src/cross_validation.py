"""
Phase 9: Cross-Validation and Model Comparison.

Runs Stratified 5-Fold CV on the top 2 candidates from Phase 8
(XGBoost, Random Forest). Uses ONLY the training data (X_train) -
the test set stays completely untouched until final evaluation
(Phase 11). Reports both train and validation fold scores to
directly check for overfitting.
"""

import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

from data_loader import load_pv_dataset
from feature_engineering import add_engineered_features
from preprocessing import split_data, RANDOM_STATE


def run_cross_validation():
    df = load_pv_dataset()
    df = add_engineered_features(df)
    X_train, X_test, y_train, y_test = split_data(df)

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    models = {
        "XGBoost": XGBClassifier(random_state=RANDOM_STATE, eval_metric='mlogloss'),
        "Random Forest": RandomForestClassifier(class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1),
    }

    summary = []

    for name, model in models.items():
        print("=" * 60)
        print(f"CROSS-VALIDATION: {name}")
        print("=" * 60)

        results = cross_validate(
            model, X_train, y_train,
            cv=cv,
            scoring='f1_macro',
            return_train_score=True,
            n_jobs=-1
        )

        train_scores = results['train_score']
        val_scores = results['test_score']

        print(f"\nPer-fold validation Macro-F1: {[round(s, 4) for s in val_scores]}")
        print(f"Mean validation Macro-F1: {val_scores.mean():.4f}  (std: {val_scores.std():.4f})")
        print(f"Mean training Macro-F1:   {train_scores.mean():.4f}")
        print(f"Train-Val gap: {train_scores.mean() - val_scores.mean():.4f}")

        summary.append({
            'model': name,
            'mean_val_f1': val_scores.mean(),
            'std_val_f1': val_scores.std(),
            'mean_train_f1': train_scores.mean(),
            'train_val_gap': train_scores.mean() - val_scores.mean()
        })
        print()

    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    summary_df = pd.DataFrame(summary)
    print(summary_df.to_string(index=False))
    summary_df.to_csv('../reports/results/phase9_cross_validation.csv', index=False)

    return summary_df


if __name__ == "__main__":
    run_cross_validation()