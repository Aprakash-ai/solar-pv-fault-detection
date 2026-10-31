"""
Phase 14: FastAPI inference backend.

Loads the saved pipeline (feature engineering + tuned XGBoost) and exposes
a /predict endpoint that takes the 6 raw sensor readings.
"""

import os
import sys
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# The saved pipeline references feature_engineering.add_engineered_features,
# so src/ must be importable BEFORE the pickle is loaded.
sys.path.append(str(PROJECT_ROOT / "src"))

MODEL_PATH = PROJECT_ROOT / "models" / "pv_fault_pipeline.pkl"
RAW_FEATURES = ["vdc1", "vdc2", "idc1", "idc2", "irr", "pvt"]
FAULT_NAMES = ["Normal", "Short Circuit", "Degradation", "Open Circuit", "Shadowing"]

# Comma-separated list of allowed frontend origins, set via the ALLOWED_ORIGINS
# environment variable in production (e.g. "https://my-app.web.app,https://my-app.firebaseapp.com").
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

pipeline = joblib.load(MODEL_PATH)

app = FastAPI(title="Solar PV Fault Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SensorReading(BaseModel):
    vdc1: float
    vdc2: float
    idc1: float
    idc2: float
    irr: float
    pvt: float


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(reading: SensorReading):
    X = pd.DataFrame([reading.model_dump()])[RAW_FEATURES]
    probabilities = pipeline.predict_proba(X)[0]
    predicted_class = int(probabilities.argmax())

    return {
        "predicted_class": predicted_class,
        "predicted_label": FAULT_NAMES[predicted_class],
        "confidence": round(float(probabilities[predicted_class]), 4),
        "probabilities": {
            name: round(float(p), 4) for name, p in zip(FAULT_NAMES, probabilities)
        },
    }