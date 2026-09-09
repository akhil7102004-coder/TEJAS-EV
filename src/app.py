import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# Determine base directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WORKSPACE_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))

MODEL_PATH = os.path.join(BASE_DIR, "models", "tejas_ev_priority_logistic.pkl")
TRANSITION_PLAN_PATH = os.path.join(BASE_DIR, "outputs", "TEJAS_FINAL_EV_TRANSITION_PLAN.csv")
PREDICTIONS_PATH = os.path.join(BASE_DIR, "outputs", "FUTURE_DEPOT_PREDICTIONS.csv")
ROUTE_PATH = os.path.join(WORKSPACE_DIR, "ROUTE.csv")

app = Flask(__name__)
CORS(app)

# Fallback CORS headers
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response

# Load Model
model = None
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print(f"[TEJAS-EV] Loaded model successfully from {MODEL_PATH}")
        print(f"[TEJAS-EV] Model classes: {getattr(model, 'classes_', None)}")
    except Exception as e:
        print(f"[TEJAS-EV] Error loading model: {e}", file=sys.stderr)
else:
    print(f"[TEJAS-EV] WARNING: Model file not found at {MODEL_PATH}", file=sys.stderr)

# Load Finalized Datasets
depots_df = None
if os.path.exists(TRANSITION_PLAN_PATH):
    try:
        depots_df = pd.read_csv(TRANSITION_PLAN_PATH)
        print(f"[TEJAS-EV] Loaded transition plan with {len(depots_df)} depots.")
    except Exception as e:
        print(f"[TEJAS-EV] Error loading transition plan: {e}", file=sys.stderr)

routes_df = None
if os.path.exists(ROUTE_PATH):
    try:
        routes_df = pd.read_csv(ROUTE_PATH)
        print(f"[TEJAS-EV] Loaded routes with {len(routes_df)} corridors.")
    except Exception as e:
        print(f"[TEJAS-EV] Error loading ROUTE.csv: {e}", file=sys.stderr)

FEATURE_COLS = [
    "Effective KM",
    "Passengers",
    "Buses Allocated",
    "Schedules Allocated",
    "Estimated CO2 (Tonnes)",
    "Estimated EV Energy (MWh)",
    "Potential EV OPEX Saving (INR)",
    "Terrain_Score"
]

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "project": "TEJAS-EV",
        "description": "Transport Electrification and Journey Analytics System Backend API",
        "status": "online",
        "ml_model": "Logistic Regression with StandardScaler",
        "holdout_accuracy": "85.87%",
        "holdout_macro_f1": "85.05%",
        "test_year": 2025,
        "total_depots": len(depots_df) if depots_df is not None else 0
    })

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "classes": [str(c) for c in getattr(model, "classes_", [])] if model is not None else [],
        "features": FEATURE_COLS,
        "data_loaded": depots_df is not None,
        "depots_count": len(depots_df) if depots_df is not None else 0
    })

@app.route("/api/metrics", methods=["GET"])
def get_metrics():
    if depots_df is None:
        return jsonify({"error": "Depot dataset not loaded"}), 500

    metrics = {
        "total_depots": len(depots_df),
        "total_fleet": round(float(depots_df["Buses Allocated"].sum())),
        "total_fleet_exact": float(depots_df["Buses Allocated"].sum()),
        "total_schedules": round(float(depots_df["Schedules Allocated"].sum())),
        "total_effective_km": float(depots_df["Effective KM"].sum()),
        "total_passengers": float(depots_df["Passengers"].sum()),
        "total_estimated_co2": float(depots_df["Estimated CO2 (Tonnes)"].sum()),
        "total_estimated_ev_energy_mwh": float(depots_df["Estimated EV Energy (MWh)"].sum()),
        "total_potential_opex_saving_inr": float(depots_df["Potential EV OPEX Saving (INR)"].sum()),
        "priority_counts": depots_df["Predicted_2026_Priority"].value_counts().to_dict(),
        "final_category_counts": depots_df["Final_Transition_Category"].value_counts().to_dict(),
        "optimization": {
            "name": "Scenario-based EV Allocation",
            "ev_bus_cost_inr": 12000000,
            "total_scenario_budget_inr": 1200000000,
            "max_ev_buses": 100,
            "max_depot_transition_rate": 0.25,
            "optimized_ev_buses": int(depots_df["Optimized_EV_Buses"].sum()),
            "diesel_buses_after_transition": int(depots_df["Diesel_Buses_After_Transition"].sum()),
            "total_ev_investment_inr": float(depots_df["EV_Investment_INR"].sum()),
            "expected_annual_opex_saving_inr": float(depots_df["Expected_Annual_OPEX_Saving_INR"].sum()),
            "expected_annual_co2_reduction_tonnes": float(depots_df["Expected_Annual_CO2_Reduction_Tonnes"].sum()),
            "allocated_depots_count": int((depots_df["Optimized_EV_Buses"] > 0).sum()),
            "disclaimer": "₹1.20 crore/bus and the 25% depot limit are PROJECT SCENARIO ASSUMPTIONS, not official KSRTC procurement policy."
        },
        "model_performance": {
            "model_type": "Logistic Regression",
            "scaler": "StandardScaler",
            "training_years": "2022–2024 (276 samples)",
            "holdout_year": "2025 (92 samples)",
            "accuracy": 85.87,
            "macro_f1": 85.05,
            "correct_predictions": "79 / 92"
        }
    }
    return jsonify(metrics)

@app.route("/api/depots", methods=["GET"])
def get_depots():
    if depots_df is None:
        return jsonify({"error": "Depots dataset not loaded"}), 500

    query = request.args.get("q", "").strip().lower()
    priority = request.args.get("priority", "").strip()
    district = request.args.get("district", "").strip()
    category = request.args.get("category", "").strip()

    filtered = depots_df.copy()

    if query:
        filtered = filtered[
            filtered["Depot Name"].str.lower().str.contains(query, na=False) |
            filtered["Depot ID"].str.lower().str.contains(query, na=False) |
            filtered["District"].str.lower().str.contains(query, na=False)
        ]

    if priority:
        filtered = filtered[filtered["Predicted_2026_Priority"] == priority]

    if district:
        filtered = filtered[filtered["District"].str.lower() == district.lower()]

    if category:
        filtered = filtered[filtered["Final_Transition_Category"].str.lower() == category.lower()]

    records = filtered.replace({np.nan: None}).to_dict(orient="records")
    return jsonify({
        "total": len(records),
        "depots": records
    })

@app.route("/api/depots/<depot_id>", methods=["GET"])
def get_depot(depot_id):
    if depots_df is None:
        return jsonify({"error": "Depots dataset not loaded"}), 500

    match = depots_df[depots_df["Depot ID"].str.upper() == depot_id.strip().upper()]
    if match.empty:
        return jsonify({"error": f"Depot {depot_id} not found"}), 404

    record = match.iloc[0].replace({np.nan: None}).to_dict()
    return jsonify(record)

@app.route("/api/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "ML model not initialized on server"}), 500

    data = request.get_json(force=True)
    if not data:
        return jsonify({"error": "Missing JSON request body"}), 400

    missing_fields = [col for col in FEATURE_COLS if col not in data]
    if missing_fields:
        return jsonify({
            "error": "Missing required input features",
            "missing": missing_fields,
            "required": FEATURE_COLS
        }), 400

    try:
        input_dict = {col: [float(data[col])] for col in FEATURE_COLS}
        X = pd.DataFrame(input_dict)

        # Predict
        predicted_class = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        classes = list(model.classes_)

        prob_dict = {
            classes[i]: float(probabilities[i])
            for i in range(len(classes))
        }

        confidence = float(np.max(probabilities))
        ml_suitability = float(prob_dict.get("EV Priority", 0.0))

        return jsonify({
            "status": "success",
            "predicted_priority": str(predicted_class),
            "prediction_confidence": confidence,
            "ml_suitability_score": ml_suitability,
            "probabilities": {
                "EV Priority": prob_dict.get("EV Priority", 0.0),
                "Conditional": prob_dict.get("Conditional", 0.0),
                "Defer / Diesel": prob_dict.get("Defer / Diesel", 0.0)
            },
            "features_used": {col: float(data[col]) for col in FEATURE_COLS},
            "model_metadata": {
                "algorithm": "Logistic Regression",
                "scaler": "StandardScaler",
                "holdout_accuracy": "85.87%",
                "holdout_macro_f1": "85.05%",
                "note": "2026 predictions generated using finalized Logistic Regression pipeline."
            }
        })

    except Exception as e:
        return jsonify({"error": f"Inference failed: {str(e)}"}), 500

@app.route("/api/optimization", methods=["GET"])
def get_optimization():
    if depots_df is None:
        return jsonify({"error": "Dataset not loaded"}), 500

    allocated = depots_df[depots_df["Optimized_EV_Buses"] > 0].copy()
    allocated = allocated.sort_values("Transition_Rank")
    records = allocated.replace({np.nan: None}).to_dict(orient="records")

    return jsonify({
        "scenario_name": "Scenario-based EV Allocation",
        "assumptions": {
            "ev_bus_cost_inr": 12000000,
            "ev_bus_cost_crores": 1.20,
            "total_scenario_budget_inr": 1200000000,
            "total_scenario_budget_crores": 120.0,
            "max_ev_buses": 100,
            "max_depot_fleet_transition_percentage": 25,
            "disclaimer": "₹1.20 crore/bus and the 25% depot limit are PROJECT SCENARIO ASSUMPTIONS, not official KSRTC procurement policy."
        },
        "summary": {
            "total_ev_buses_allocated": int(depots_df["Optimized_EV_Buses"].sum()),
            "total_investment_inr": float(depots_df["EV_Investment_INR"].sum()),
            "total_expected_annual_opex_saving_inr": float(depots_df["Expected_Annual_OPEX_Saving_INR"].sum()),
            "total_expected_annual_co2_reduction_tonnes": float(depots_df["Expected_Annual_CO2_Reduction_Tonnes"].sum()),
            "remaining_diesel_buses": int(depots_df["Diesel_Buses_After_Transition"].sum()),
            "depots_count": len(records)
        },
        "allocated_depots": records
    })

@app.route("/api/routes", methods=["GET"])
def get_routes():
    if routes_df is None:
        return jsonify({"error": "Routes dataset not loaded"}), 500

    records = routes_df.replace({np.nan: None}).to_dict(orient="records")
    return jsonify({
        "total": len(records),
        "note": "Distance_KM is unavailable in dataset; corridor terrain and operational factors are evaluated.",
        "routes": records
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting TEJAS-EV Backend on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
