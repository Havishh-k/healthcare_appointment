"""
app.py — FastAPI Cardiovascular Risk Prediction Service

Exposes:
  POST /predict          → predict risk from patient vitals
  GET  /health           → service health check
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
import os

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="HealthBook ML Risk Prediction",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",       # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Load pre-trained model (trained by train.py)
# ---------------------------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "cardiovascular_model.pkl")

model = None
if os.path.isfile(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print(f"[✓] Model loaded from {MODEL_PATH}")
else:
    print(f"[!] No model found at {MODEL_PATH}. Run `python train.py` first.")


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class HealthInput(BaseModel):
    age: int = Field(..., ge=1, le=120, description="Age in years")
    gender: str = Field(..., pattern="^[MF]$", description="M or F")
    height: float = Field(..., ge=50, le=250, description="Height in cm")
    weight: float = Field(..., ge=20, le=300, description="Weight in kg")
    systolic_bp: int = Field(..., ge=60, le=250, description="Systolic blood pressure")
    diastolic_bp: int = Field(..., ge=40, le=160, description="Diastolic blood pressure")
    cholesterol: int = Field(..., ge=1, le=3, description="1=normal, 2=above, 3=well above")
    glucose: int = Field(..., ge=1, le=3, description="1=normal, 2=above, 3=well above")
    smoking: bool = False
    alcohol: bool = False
    physical_activity: bool = False


class RiskOutput(BaseModel):
    risk_score: float
    risk_level: str
    recommended_department: str | None
    message: str
    recommendations: list[str]
    bmi: float


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def generate_recommendations(data: HealthInput, risk: float, bmi: float) -> list[str]:
    recs: list[str] = []

    if bmi > 30:
        recs.append("BMI indicates obesity — consult a nutritionist for a weight-management programme")
    elif bmi > 25:
        recs.append("BMI is above normal — consider dietary adjustments and regular exercise")

    if data.systolic_bp > 140 or data.diastolic_bp > 90:
        recs.append("Blood pressure is elevated — monitor daily and reduce sodium intake")
    elif data.systolic_bp > 130:
        recs.append("Blood pressure is slightly elevated — track it weekly")

    if data.cholesterol >= 2:
        recs.append("Cholesterol is above normal — schedule a lipid panel test")

    if data.glucose >= 2:
        recs.append("Blood glucose is elevated — consider an HbA1c screening")

    if data.smoking:
        recs.append("Smoking cessation support is available — talk to your doctor")

    if data.alcohol:
        recs.append("Limit alcohol consumption to reduce cardiovascular load")

    if not data.physical_activity:
        recs.append("Aim for ≥ 150 minutes of moderate-intensity exercise per week")

    if risk > 0.5:
        recs.append("Schedule a preventive cardiology screening at your earliest convenience")

    if not recs:
        recs.append("Maintain your current healthy lifestyle — great job!")

    return recs


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.post("/predict", response_model=RiskOutput)
def predict_risk(data: HealthInput):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Run `python train.py` first.",
        )

    bmi = round(data.weight / ((data.height / 100) ** 2), 1)

    features = np.array([[
        data.age,
        1 if data.gender == "M" else 2,
        data.height,
        data.weight,
        bmi,
        data.systolic_bp,
        data.diastolic_bp,
        data.cholesterol,
        data.glucose,
        int(data.smoking),
        int(data.alcohol),
        int(data.physical_activity),
    ]])

    risk_probability = float(model.predict_proba(features)[0][1])

    if risk_probability >= 0.7:
        risk_level = "high"
        recommended_dept = "Cardiology"
        message = "High cardiovascular risk detected. Immediate consultation recommended."
    elif risk_probability >= 0.4:
        risk_level = "moderate"
        recommended_dept = "Internal Medicine"
        message = "Moderate risk. Preventive checkup advised within 2 weeks."
    else:
        risk_level = "low"
        recommended_dept = None
        message = "Low risk. Continue healthy lifestyle. Annual checkup recommended."

    recs = generate_recommendations(data, risk_probability, bmi)

    return RiskOutput(
        risk_score=round(risk_probability * 100, 1),
        risk_level=risk_level,
        recommended_department=recommended_dept,
        message=message,
        recommendations=recs,
        bmi=bmi,
    )


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HealthBook ML Risk Prediction",
        "model_loaded": model is not None,
    }
