from fastapi import APIRouter
from app.schemas import MLMetricsResponse
from app.ml.trainer import load_model_and_metrics, train_placement_model
import app.ml.predictor as predictor

router = APIRouter(prefix="/ml", tags=["Machine Learning"])


@router.get("/metrics", response_model=MLMetricsResponse)
def get_model_evaluation_metrics():
    """
    Returns transparent evaluation metrics of the Placement Probability model,
    including accuracy, precision, recall, F1, confusion matrix, and feature coefficients.
    """
    _, metrics = load_model_and_metrics()
    return MLMetricsResponse(**metrics)


@router.post("/retrain", response_model=MLMetricsResponse)
def retrain_model():
    """
    Retrains the supervised Logistic Regression pipeline on the benchmark dataset,
    re-evaluating strictly on the 20% held-out test split.
    """
    _, metrics = train_placement_model()
    # Invalidate cached model in predictor
    predictor._pipeline = None
    predictor._metrics = None
    return MLMetricsResponse(**metrics)
