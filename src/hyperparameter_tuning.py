"""
Phase 10: Hyperparameter Optimization.

Uses RandomizedSearchCV (not GridSearchCV - too slow at this dataset
size) to tune XGBoost. A small parameter space and iteration count
keep this practical; full rigor comes back in Phase 11's final
single evaluation on the held-out test set.
"""

import time
import pandas as pd
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold
from xgboost import XGBClassifier

from data_loader import load_pv_dataset
from feature_engineering import add_engineered_features
from preprocessing import split_data, RANDOM_STATE


def tune_xgboost():
    df = load_pv_dataset()
    df = add_engineered_features(df)
    X_train, X_test, y_train, y_test = split_data(df)

    param_distributions = {
        'n_estimators': [100, 200, 300],
        'max_depth': [4, 6, 8],
        'learning_rate': [0.05, 0.1, 0.2],
        'subsample': [0.8, 1.0],
        'colsample_bytree': [0.8, 1.0],
    }

    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=RANDOM_STATE)

    base_model = XGBClassifier(random_state=RANDOM_STATE, eval_metric='mlogloss')

    search = RandomizedSearchCV(
        base_model,
        param_distributions=param_distributions,
        n_iter=15,
        cv=cv,
        scoring='f1_macro',
        random_state=RANDOM_STATE,
        n_jobs=-1,
        verbose=2
    )

    print("Starting RandomizedSearchCV for XGBoost...")
    start = time.time()
    search.fit(X_train, y_train)
    elapsed = time.time() - start

    print(f"\nSearch completed in {elapsed:.1f}s")
    print(f"\nBest parameters: {search.best_params_}")
    print(f"Best CV Macro-F1: {search.best_score_:.4f}")

    results_df = pd.DataFrame(search.cv_results_)
    results_df = results_df.sort_values('rank_test_score')
    results_df[['params', 'mean_test_score', 'std_test_score', 'rank_test_score']].to_csv(
        '../reports/results/phase10_tuning_results.csv', index=False
    )

    return search.best_estimator_, search.best_params_, search.best_score_


if __name__ == "__main__":
    tune_xgboost()