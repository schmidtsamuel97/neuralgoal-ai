import sys
import json
import numpy as np
import joblib
import os

def predict(features_json):
    try:
        # Parsear features
        features = json.loads(features_json)
        
        # Intentar cargar modelo entrenado
        model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
        
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            
            # Preparar input
            X = np.array([[
                features.get("home_xg", 1.5),
                features.get("away_xg", 1.2),
                features.get("home_defense", 1.0),
                features.get("away_defense", 1.3),
                features.get("home_form", 0.6),
                features.get("away_form", 0.5),
                features.get("home_advantage", 1.2),
                features.get("h2h_home_wins", 0),
                features.get("h2h_total", 1)
            ]])
            
            # Predecir probabilidades
            probs = model.predict_proba(X)[0]
            
            prediction = {
                "home_win": round(probs[2], 2),
                "draw": round(probs[1], 2),
                "away_win": round(probs[0], 2),
                "over25": round(min((features.get("home_xg", 1.5) + features.get("away_xg", 1.2)) / 3, 2),
                "btts": round((features.get("home_xg", 1.5) + features.get("away_xg", 1.2)) / 4, 2)
            }
        else:
            # Fallback a lógica heurística
            home_xg = features.get("home_xg", 1.5)
            away_xg = features.get("away_xg", 1.2)
            home_adv = features.get("home_advantage", 1.2)
            
            home_strength = home_xg * home_adv
            away_strength = away_xg
            total = home_strength + away_strength + 1
            
            prediction = {
                "home_win": round(home_strength / total, 2),
                "draw": round(1 / total, 2),
                "away_win": round(away_strength / total, 2),
                "over25": round((home_xg + away_xg) / 3, 2),
                "btts": round((home_xg + away_xg) / 4, 2)
            }
        
        print(json.dumps(prediction))
        
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "home_win": 0.45,
            "draw": 0.25,
            "away_win": 0.30,
            "over25": 0.60,
            "btts": 0.55
        }))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        predict(sys.argv[1])
    else:
        # Test con valores default
        predict('{}')