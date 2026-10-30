import os
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(MODEL_DIR, "placement_model.joblib")
METRICS_FILE = os.path.join(MODEL_DIR, "model_metrics.json")
SYNTHETIC_DATA_FILE = os.path.join(os.path.dirname(MODEL_DIR), "data", "synthetic_training_data.csv")

FEATURE_NAMES = [
    "cgpa",
    "relevant_skill_count",
    "project_count",
    "internship_count",
    "skill_match_percentage"
]


def generate_synthetic_dataset(num_samples: int = 600, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates a controlled, reproducible synthetic dataset for machine learning pipeline demonstration.
    
    DISCLAIMER: This dataset contains synthetic records constructed mathematically to illustrate
    the ML training pipeline, feature scaling, evaluation metrics, and model persistence.
    It does not contain authentic student records or validated institutional outcomes.
    """
    np.random.seed(random_seed)

    # 1. CGPA: 5.5 to 9.8 with mean 7.6
    cgpa = np.clip(np.random.normal(7.6, 1.1, num_samples), 5.0, 10.0)

    # 2. Skill Match Percentage: Beta distribution skewed toward 40-80%
    skill_match = np.clip(np.random.beta(3, 2, num_samples) * 100, 10.0, 100.0)

    # 3. Relevant skill count: correlated with skill match percentage
    relevant_skills = np.clip(
        np.round((skill_match / 100.0) * 10 + np.random.normal(0, 1.2, num_samples)),
        0, 12
    ).astype(int)

    # 4. Projects count: Poisson distribution
    project_count = np.clip(np.random.poisson(2.2, num_samples), 0, 7)

    # 5. Internship count: Zero-inflated distribution
    internship_count = np.clip(
        np.random.choice([0, 1, 2, 3], size=num_samples, p=[0.45, 0.35, 0.15, 0.05]),
        0, 4
    )

    # Calculate underlying placement log-odds with balanced realistic weighting + noise
    z = (
        0.55 * (cgpa - 7.5) +
        0.04 * (skill_match - 55.0) +
        0.35 * (project_count - 2.0) +
        0.75 * (internship_count - 0.7) +
        np.random.logistic(0, 0.6, num_samples)
    )
    probability = 1.0 / (1.0 + np.exp(-z))
    placed = (probability >= 0.50).astype(int)

    df = pd.DataFrame({
        "cgpa": np.round(cgpa, 2),
        "relevant_skill_count": relevant_skills,
        "project_count": project_count,
        "internship_count": internship_count,
        "skill_match_percentage": np.round(skill_match, 1),
        "placed": placed
    })

    # Save to data directory for auditability
    os.makedirs(os.path.dirname(SYNTHETIC_DATA_FILE), exist_ok=True)
    df.to_csv(SYNTHETIC_DATA_FILE, index=False)
    return df


def train_placement_model(data_df: pd.DataFrame = None) -> Tuple[Pipeline, Dict[str, Any]]:
    """
    Trains a Logistic Regression pipeline with StandardScaler on a train/test split.
    Calculates and returns transparent evaluation metrics.
    """
    if data_df is None:
        data_df = generate_synthetic_dataset()

    X = data_df[FEATURE_NAMES]
    y = data_df["placed"]

    # Stratified train/test split to avoid data leakage and maintain class proportions
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Build Pipeline: Feature Standardization + Regularized Logistic Regression
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(class_weight="balanced", C=1.0, random_state=42, max_iter=1000))
    ])

    pipeline.fit(X_train, y_train)

    # Evaluate strictly on held-out test split
    y_pred = pipeline.predict(X_test)

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()

    # Extract learned feature coefficients
    classifier = pipeline.named_steps["classifier"]
    coefficients = {
        name: round(float(coef), 4)
        for name, coef in zip(FEATURE_NAMES, classifier.coef_[0])
    }

    metrics = {
        "status": "Trained & Evaluated Successfully",
        "model_name": "Logistic Regression with StandardScaler",
        "description": "Supervised binary classification pipeline estimating readiness benchmark probability.",
        "sample_size": len(data_df),
        "train_test_split": "80% Train (480) / 20% Held-Out Test (120)",
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "feature_names": FEATURE_NAMES,
        "feature_coefficients": coefficients,
        "disclaimer": (
            "NOTICE: This model is trained on a synthetic statistical benchmark dataset to demonstrate "
            "ML pipeline architecture, evaluation metrics, and model persistence. Predictions represent "
            "a benchmark estimate and are NOT scientifically validated real-world placement guarantees."
        )
    }

    # Save trained pipeline and metrics to disk safely
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_FILE)

    with open(METRICS_FILE, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    return pipeline, metrics


def load_model_and_metrics() -> Tuple[Pipeline, Dict[str, Any]]:
    """Loads existing model from disk or trains a fresh baseline if missing."""
    if os.path.exists(MODEL_FILE) and os.path.exists(METRICS_FILE):
        pipeline = joblib.load(MODEL_FILE)
        with open(METRICS_FILE, "r", encoding="utf-8") as f:
            metrics = json.load(f)
        return pipeline, metrics

    return train_placement_model()


if __name__ == "__main__":
    p, m = train_placement_model()
    print("Model trained successfully:")
    print(json.dumps(m, indent=2))
