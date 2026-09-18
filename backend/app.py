import os
import sys
import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r'/api/*': {'origins': '*'}})

FEATURE_NAMES = [
    'Buses Allocated',
    'Schedules Allocated',
    'Passengers',
    'Estimated Diesel Litres',
    'Estimated CO2 (Tonnes)',
    'Effective KM',
    'Estimated EV Energy (MWh)',
    'Passengers_per_Bus',
    'Passengers_per_Schedule',
    'Diesel_Litres_per_Bus',
    'Diesel_Litres_per_Schedule',
    'CO2_per_Bus_Tonnes',
    'Terrain_Score'
]

TERRAIN_SCORES = {
    'Flat': 1.00,
    'Flat/Rolling': 0.90,
    'Rolling': 0.75,
    'Hilly': 0.40,
    'Steep': 0.20
}

# Resolve model path from the project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

possible_paths = [
    os.path.join(
        PROJECT_ROOT,
        'models',
        'tejas_ev_priority_decision_tree_corrected.pkl'
    ),
    os.path.join(
        PROJECT_ROOT,
        'models',
        'tejas_ev_priority_decision_tree.pkl'
    )
]

model_path = None
for p in possible_paths:
    norm_p = os.path.normpath(p)
    if os.path.exists(norm_p):
        model_path = norm_p
        break

if not model_path:
    print('WARNING: Model file not found in searched paths!')
    model = None
else:
    print(f'Loading model from {model_path}...')
    model = joblib.load(model_path)
    print('Model loaded successfully.')

@app.route('/api/health', methods=['GET'])
def health():
    if model is None:
        return jsonify({
            'status': 'degraded',
            'error': 'Model not loaded',
            'model': None
        }), 500
    return jsonify({
        'status': 'healthy',
        'model': 'Tuned Decision Tree Classifier (Corrected Terrain)',
        'model_path': os.path.basename(model_path) if model_path else None,
        'holdout_accuracy': '92.37%',
        'macro_f1': '92.32%',
        'criterion': 'entropy',
        'max_depth': 6,
        'features': FEATURE_NAMES,
        'classes': list(model.classes_)
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Decision Tree model is unavailable'}), 503

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    try:
        if isinstance(data, list):
            if len(data) != 13:
                return jsonify({'error': f'Expected 13 features, received {len(data)}'}), 400
            df_features = pd.DataFrame([data], columns=FEATURE_NAMES)
        elif isinstance(data, dict) and 'features' in data:
            feats = data['features']
            if isinstance(feats, list) and len(feats) == 13:
                df_features = pd.DataFrame([feats], columns=FEATURE_NAMES)
            elif isinstance(feats, dict):
                row = [feats.get(fn, 0.0) for fn in FEATURE_NAMES]
                df_features = pd.DataFrame([row], columns=FEATURE_NAMES)
            else:
                return jsonify({'error': 'Invalid features format in request'}), 400
        else:
            row = [data.get(fn, 0.0) for fn in FEATURE_NAMES]
            df_features = pd.DataFrame([row], columns=FEATURE_NAMES)

        pred = model.predict(df_features)[0]
        probas = model.predict_proba(df_features)[0]
        prob_dict = {cls: float(probas[i]) for i, cls in enumerate(model.classes_)}
        confidence = float(np.max(probas))

        return jsonify({
            'prediction': str(pred),
            'prediction_confidence': confidence,
            'probabilities': {
                'EV Suitable': prob_dict.get('EV Suitable', 0.0),
                'Conditional': prob_dict.get('Conditional', 0.0),
                'Diesel Preferred': prob_dict.get('Diesel Preferred', 0.0)
            },
            'feature_values': {fn: round(float(df_features[fn].iloc[0]), 4) for fn in FEATURE_NAMES}
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict-scenario', methods=['POST'])
def predict_scenario():
    if model is None:
        return jsonify({'error': 'Decision Tree model is unavailable'}), 503

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON body'}), 400

    try:
        buses = float(data.get('buses', 0))
        schedules = float(data.get('schedules', 0))
        passengers = float(data.get('passengers', 0))
        effective_km = float(data.get('effective_km', 0))
        terrain_class = str(data.get('terrain_class', 'Flat/Rolling')).strip()

        if buses <= 0:
            return jsonify({'error': 'Buses Allocated must be greater than 0'}), 400
        if schedules <= 0:
            return jsonify({'error': 'Schedules Allocated must be greater than 0'}), 400
        if effective_km < 0:
            return jsonify({'error': 'Effective KM cannot be negative'}), 400
        if passengers < 0:
            return jsonify({'error': 'Passengers cannot be negative'}), 400

        if terrain_class not in TERRAIN_SCORES:
            return jsonify({'error': f'Invalid terrain class: {terrain_class}. Allowed: {list(TERRAIN_SCORES.keys())}'}), 400

        terrain_score = TERRAIN_SCORES[terrain_class]

        diesel_litres = effective_km / 4.08
        co2_baseline_tonnes = diesel_litres * 0.00268
        ev_energy_mwh = (effective_km * 1.25) / 1000.0
        opex_saving_inr = effective_km * 24.0

        passengers_per_bus = passengers / buses
        passengers_per_schedule = passengers / schedules
        diesel_per_bus = diesel_litres / buses
        diesel_per_schedule = diesel_litres / schedules
        co2_per_bus_tonnes = co2_baseline_tonnes / buses

        feature_values = [
            buses,
            schedules,
            passengers,
            diesel_litres,
            co2_baseline_tonnes,
            effective_km,
            ev_energy_mwh,
            passengers_per_bus,
            passengers_per_schedule,
            diesel_per_bus,
            diesel_per_schedule,
            co2_per_bus_tonnes,
            terrain_score
        ]

        df_input = pd.DataFrame([feature_values], columns=FEATURE_NAMES)

        pred = model.predict(df_input)[0]
        probas = model.predict_proba(df_input)[0]
        prob_dict = {cls: float(probas[i]) for i, cls in enumerate(model.classes_)}
        confidence = float(np.max(probas))

        monthly_impact = {
            'diesel_litres': round(diesel_litres, 2),
            'co2_baseline_tonnes': round(co2_baseline_tonnes, 2),
            'ev_energy_mwh': round(ev_energy_mwh, 2),
            'opex_saving_inr': round(opex_saving_inr, 2)
        }

        annualized_impact = {
            'annual_diesel_litres': round(diesel_litres * 12, 2),
            'annual_co2_baseline_tonnes': round(co2_baseline_tonnes * 12, 2),
            'annual_ev_energy_mwh': round(ev_energy_mwh * 12, 2),
            'annual_opex_saving_inr': round(opex_saving_inr * 12, 2),
            'annual_opex_saving_crores': round((opex_saving_inr * 12) / 1e7, 2)
        }

        return jsonify({
            'prediction': str(pred),
            'prediction_confidence': confidence,
            'probabilities': {
                'EV Suitable': prob_dict.get('EV Suitable', 0.0),
                'Conditional': prob_dict.get('Conditional', 0.0),
                'Diesel Preferred': prob_dict.get('Diesel Preferred', 0.0)
            },
            'scenario_inputs': {
                'buses': buses,
                'schedules': schedules,
                'passengers': passengers,
                'effective_km': effective_km,
                'terrain_class': terrain_class,
                'terrain_score': terrain_score
            },
            'constructed_features': {
                name: round(float(val), 4) for name, val in zip(FEATURE_NAMES, feature_values)
            },
            'monthly_impact': monthly_impact,
            'annualized_impact': annualized_impact
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)