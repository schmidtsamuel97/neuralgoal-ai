import pandas as pd
from xgboost import XGBClassifier
import joblib

df = pd.DataFrame({
    "xG_A":[1.8,1.2],
    "xG_B":[1.2,1.5],
    "shotsA":[12,8],
    "shotsB":[8,10],
    "goalsA":[2,1],
    "goalsB":[1,2]
})

def get_result(row):
    if row["goalsA"] > row["goalsB"]:
        return 2
    elif row["goalsA"] < row["goalsB"]:
        return 0
    return 1

df["result"] = df.apply(get_result, axis=1)

X = df[["xG_A","xG_B","shotsA","shotsB"]]
y = df["result"]

model = XGBClassifier()
model.fit(X,y)

joblib.dump(model,"model.pkl")

print("Model trained")