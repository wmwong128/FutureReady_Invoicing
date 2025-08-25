from flask import Flask, jsonify, request
from flask_cors import CORS
from metadata import package_data, env
from authlib.integrations.flask_oauth2 import ResourceProtector
from token_validator import Auth0JWTBearerTokenValidator
from pymongo import MongoClient

import os
os.environ['XLA_PYTHON_CLIENT_PREALLOCATE'] = 'false'
os.environ['JAX_PMAP_USE_TENSORSTORE'] = 'false'
import timesfm
import torch
import pickle
import json
import numpy as np
import pandas as pd
from collections import defaultdict
from datetime import datetime, timedelta

NAME : str = package_data["name"]
CONTAINER_PORT : int = package_data["containerPort"]
AUTH0_DOMAIN : str = env["AUTH0_DOMAIN"]
AUTH0_AUDIENCE : str = env["AUTH0_AUDIENCE"]
FRONTEND_MAIN_URL : str = env["FRONTEND_MAIN_URL"]
NOAUTH : bool = bool(env.get("NOAUTH", False))
MONGO_URI: str = env.get("MONGO_URI", "mongodb://localhost:27017") #template (need to adjust ltr)
MONGO_DB: str = env.get("MONGO_DB", "invoicing_db") #template (need to adjust ltr)
MONGO_INVOICES: str = env.get("MONGO_INVOICES", "invoices") #template (need to adjust ltr)
MONGO_ORDERS: str = env.get("MONGO_ORDERS", "orders") #template (need to adjust ltr)
MONGO_ORDERLINES: str = env.get("MONGO_ORDERLINES", "orderlines") #template (need to adjust ltr)

# Reference from https://auth0.com/docs/quickstart/backend/python/interactive 
protector = ResourceProtector()
validator = Auth0JWTBearerTokenValidator(
    AUTH0_DOMAIN, 
    AUTH0_AUDIENCE
)
protector.register_token_validator(validator)

def conditional_decorator(func, condition: bool):
    return lambda x: func(x) if condition else x

app = Flask(__name__)
CORS(app, origins=FRONTEND_MAIN_URL)

# Model paths (relative to Docker container)
CHECKPOINT_DIR = "/app/timesfm_checkpoint"
EXPORT_DIR = "/app/timesfm_export"
model_weights_path = os.path.join(EXPORT_DIR, "timesfm_model.pt")
config_path = os.path.join(EXPORT_DIR, "timesfm_config.json")

# Load TimesFM model at startup
tfm_reloaded = None
try:
    # Load config
    hparams_dict = None
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            hparams_dict = json.load(f)
        print(f"Loaded config from {config_path}")
    except UnicodeDecodeError:
        print(f"UnicodeDecodeError: Trying to read {config_path} with cp1252 encoding")
        try:
            with open(config_path, "r", encoding="cp1252") as f:
                hparams_dict = json.load(f)
            print(f"Loaded config with cp1252 encoding")
        except Exception as e:
            print(f"Failed to read {config_path}: {e}")
            raise
    except Exception as e:
        print(f"Error loading config {config_path}: {e}")
        raise

    # Verify checkpoint
    checkpoint_file = os.path.join(CHECKPOINT_DIR, "torch_model.ckpt")
    if not os.path.exists(checkpoint_file):
        raise FileNotFoundError(f"Checkpoint file {checkpoint_file} not found")
    try:
        with open(checkpoint_file, "rb") as f:
            pass  # Test read access
        print(f"Read permissions verified for {checkpoint_file}")
    except PermissionError as e:
        print(f"PermissionError: Cannot read {checkpoint_file}: {e}")
        raise

    # Verify model weights
    if not os.path.exists(model_weights_path):
        raise FileNotFoundError(f"Model weights {model_weights_path} not found")
    try:
        with open(model_weights_path, "rb") as f:
            if f.read(1) == b'{':
                print(f"Error: {model_weights_path} appears to be a JSON file, not a valid PyTorch pickle")
                raise pickle.UnpicklingError("Invalid file format")
    except pickle.UnpicklingError:
        print(f"Invalid or corrupted {model_weights_path}. Please regenerate it.")
        raise

    # Load model
    tfm_reloaded = timesfm.TimesFm(
        hparams=timesfm.TimesFmHparams(**hparams_dict),
        checkpoint=timesfm.TimesFmCheckpoint(path=checkpoint_file),
    )
    # Try loading with weights_only=True
    try:
        tfm_reloaded._model.load_state_dict(torch.load(model_weights_path, weights_only=True))
        print("Reloaded model successfully with weights_only=True")
    except pickle.UnpicklingError as e:
        print(f"UnpicklingError with weights_only=True: {e}")
        print("Loading with weights_only=False (safe since timesfm_model.pt is from a trusted source)")
        tfm_reloaded._model.load_state_dict(torch.load(model_weights_path, weights_only=False))
        print("Reloaded model successfully with weights_only=False")
    tfm_reloaded._model.eval()
except Exception as e:
    print(f"Error loading model: {e}")
    tfm_reloaded = None

def fetch_and_process_data():
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI) #template (need to adjust ltr)
        db = client[MONGO_DB] #template (need to adjust ltr)
        invoices_collection = db[MONGO_INVOICES] #template (need to adjust ltr)
        orders_collection = db[MONGO_ORDERS] #template (need to adjust ltr)
        orderlines_collection = db[MONGO_ORDERLINES] #template (need to adjust ltr)

        # Fetch invoices and orders
        invoices = list(invoices_collection.find())
        orders = list(orders_collection.find())
        orderlines = list(orderlines_collection.find())

        if not invoices or not orders or not orderlines:
            raise ValueError("No data found in invoices, orders, or orderlines collections")

        # Create DataFrames
        invoices_df = pd.DataFrame(invoices)
        orders_df = pd.DataFrame(orders)
        orderlines_df = pd.DataFrame(orderlines)

        # Join invoices and orders on ordernumber
        df = invoices_df.merge(orders_df[['ordernumber', 'orderdate']], on='ordernumber', how='left')
        
        # Join with orderlines on ordernumber
        df = df.merge(orderlines_df[['ordernumber', 'orderlinenumber', 'quantityordered', 'priceeach', 'sales']], 
                      on='ordernumber', how='left')

        # Map fields
        df['ORDERDATE'] = pd.to_datetime(df['orderdate']).dt.date  # Use invoicedate for ORDERDATE
        df['SALES'] = df['sales']  # From orderlines
        df['QUANTITYORDERED'] = df['quantityordered']  # From orderlines
        df['PRICEEACH'] = df['priceeach']  # From orderlines
        df['ORDERLINENUMBER'] = df['orderlinenumber']  # From orderlines

        # Drop rows with missing required fields
        df = df.dropna(subset=['ORDERDATE', 'SALES', 'QUANTITYORDERED', 'PRICEEACH', 'ORDERLINENUMBER'])

        # Aggregate per day
        daily_sales = df.groupby('ORDERDATE').agg({
            'SALES': 'sum',
            'QUANTITYORDERED': 'sum',
            'PRICEEACH': 'mean',
            'ORDERLINENUMBER': 'mean'
        })

        # Create complete date range
        complete_dates = pd.date_range(start=daily_sales.index.min(), end=daily_sales.index.max(), freq='D')

        # Reindex and fill missing values
        complete_sales = daily_sales.reindex(complete_dates)
        complete_sales['SALES'] = complete_sales['SALES'].fillna(0)
        complete_sales['QUANTITYORDERED'] = complete_sales['QUANTITYORDERED'].fillna(0)
        complete_sales['PRICEEACH'] = complete_sales['PRICEEACH'].fillna(0)
        complete_sales['ORDERLINENUMBER'] = complete_sales['ORDERLINENUMBER'].fillna(0)

        # Reset index and rename
        if 'ORDERDATE' not in complete_sales.columns:
            complete_sales = complete_sales.reset_index()
            if 'index' in complete_sales.columns:
                complete_sales = complete_sales.rename(columns={'index': 'ORDERDATE'})
            elif complete_sales.index.name is not None:
                complete_sales = complete_sales.reset_index()
                complete_sales = complete_sales.rename(columns={complete_sales.index.name: 'ORDERDATE'})

        # Add WEEKDAY
        complete_sales['WEEKDAY'] = pd.to_datetime(complete_sales['ORDERDATE']).dt.dayofweek

        return complete_sales

    except Exception as e:
        print(f"Error fetching/processing data: {e}")
        return None

@app.route("/")
@conditional_decorator(protector(None), not NOAUTH)
def main() -> None:
    return jsonify(message="Hello world")

@app.route("/forecast", methods=["POST"])
@conditional_decorator(protector(None), not NOAUTH)
def forecast():
    if tfm_reloaded is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        # Fetch and process data from MongoDB
        complete_sales = fetch_and_process_data()
        if complete_sales is None or len(complete_sales) < 512:
            return jsonify({"error": f"Insufficient data: need at least 512 points, got {len(complete_sales) if complete_sales is not None else 0}"}), 400

        context_len = 512
        horizon_len = 53

        # Prepare input for forecasting
        inputs = [complete_sales["SALES"][-context_len:].tolist()]
        dynamic_numerical_covariates = {
            "quantity_ordered": [complete_sales["QUANTITYORDERED"][-context_len - horizon_len:].tolist()],
            "price_each": [complete_sales["PRICEEACH"][-context_len - horizon_len:].tolist()],
            "order_line_number": [complete_sales["ORDERLINENUMBER"][-context_len - horizon_len:].tolist()],
        }
        dynamic_categorical_covariates = {
            "week_day": [complete_sales["WEEKDAY"][-context_len - horizon_len:].tolist()]
        }
        dates = complete_sales["ORDERDATE"][-context_len - horizon_len:].dt.strftime("%Y-%m-%d").tolist()

        # Perform forecasting
        cov_forecast, _ = tfm_reloaded.forecast_with_covariates(
            inputs=inputs,
            dynamic_numerical_covariates=dynamic_numerical_covariates,
            dynamic_categorical_covariates=dynamic_categorical_covariates,
            static_numerical_covariates={},
            static_categorical_covariates={},
            freq=[0] * len(inputs),
            xreg_mode="xreg + timesfm",
            ridge=0.0,
            force_on_cpu=False,
            normalize_xreg_target_per_input=True,
        )

        # Generate forecast dates (extend from last date)
        last_date = pd.to_datetime(complete_sales["ORDERDATE"].iloc[-1])
        forecast_dates = [last_date + timedelta(days=i) for i in range(1, horizon_len + 1)]
        forecast_dates = [d.strftime("%Y-%m-%d") for d in forecast_dates]

        # Return forecast
        forecast_values = cov_forecast[0].tolist()  # Single batch
        return jsonify({
            "forecast": forecast_values,
            "dates": forecast_dates
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=CONTAINER_PORT)