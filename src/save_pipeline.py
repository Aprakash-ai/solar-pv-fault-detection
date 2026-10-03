"""
Phase 13: Save the ML Pipeline.

Bundles feature engineering + the tuned XGBoost model into a single
sklearn Pipeline, so inference (Phase 14 FastAPI) is one call:
pipeline.predict(raw_input). Saved as one artifact.
"""

import os
import joblib
from sklearn.pipeline import Pipeline
from sklearn.metrics import f1_score
from xgboost import XGBClassifier

from data_loader import load_pv_dataset
from feature_engineering import get_feature_engineering_transformer
from preprocessing import RANDOM_STATE
from sklearn.model_selection import train_test_split

RAW_INPUT_FEATURES = ['vdc1', 'vdc2', 'idc1', 'idc2', 'irr', 'pvt']
TARGET = 'fault'

BEST_PARAMS = {
    'subsample': 0.8,
    'n_estimators': 300,
    'max_depth': 6,
    'learning_rate': 0.05,
    'colsample_bytree': 0.8,
}


def build_and_save_pipeline():
    # Load RAW data only (no pre-engineering - the pipeline does that itself)
    df = load_pv_dataset()
    X = df[RAW_INPUT_FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE
    )

    pipeline = Pipeline([
        ('feature_engineering', get_feature_engineering_transformer()),
        ('model', XGBClassifier(**BEST_PARAMS, random_state=RANDOM_STATE, eval_metric='mlogloss'))
    ])

    print("Training full pipeline (feature engineering + model)...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    macro_f1 = f1_score(y_test, y_pred, average='macro')
    print(f"\nPipeline Test Macro-F1: {macro_f1:.4f}  (should match Phase 11's 0.9980)")

    os.makedirs('../models', exist_ok=True)
    joblib.dump(pipeline, '../models/pv_fault_pipeline.pkl')
    print("\nFull pipeline saved to models/pv_fault_pipeline.pkl")

    # Quick sanity check: predict on a single raw sample, like an API would receive
    sample = X_test.iloc[[0]]
    sample_pred = pipeline.predict(sample)[0]
    print(f"\nSanity check - single raw input: {sample.to_dict('records')[0]}")
    print(f"Predicted fault class: {sample_pred}")

    return pipeline


if __name__ == "__main__":
    build_and_save_pipeline()