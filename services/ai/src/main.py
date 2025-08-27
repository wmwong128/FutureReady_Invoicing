from flask import Flask, jsonify
from flask_cors import CORS
from metadata import package_data, env
from authlib.integrations.flask_oauth2 import ResourceProtector
from token_validator import Auth0JWTBearerTokenValidator

NAME : str = package_data["name"]
CONTAINER_PORT : int = package_data["containerPort"]
AUTH0_DOMAIN : str = env["AUTH0_DOMAIN"]
AUTH0_AUDIENCE : str = env["AUTH0_AUDIENCE"]
FRONTEND_MAIN_URL : str = env["FRONTEND_MAIN_URL"]
NOAUTH : bool = bool(env.get("NOAUTH", False))
<<<<<<< Updated upstream
=======
MONGO_URI: str = env.get("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB: str = env.get("MONGO_DB", "futurereadyinvoice")
MONGO_ORDERS: str = env.get("MONGO_ORDERS", "orders")
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
=======
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
        client = MongoClient(MONGO_URI) 
        db = client[MONGO_DB] 
        orders_collection = db[MONGO_ORDERS] 

         # Fetch orders
        orders = list(orders_collection.find())
        if not orders:
            raise ValueError("No orders found in the database")
        
        # Flatten orderlines array
        records = []
        for order in orders:
            orderdate = pd.to_datetime(order['orderdate']).date()
            for line in order.get('orderlines', []):
                records.append({
                    'ORDERDATE': orderdate,
                    'SALES': line['sales'],
                    'QUANTITYORDERED': line['quantityordered'],
                    'PRICEEACH': line['priceeach'],
                    'ORDERLINENUMBER': line['orderlinenumber']
                })

        if not records:
            raise ValueError("No orderlines found in orders")

        ## Create DataFrame
        df = pd.DataFrame(records)

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

>>>>>>> Stashed changes
@app.route("/")
@conditional_decorator(protector(None), not NOAUTH)
def main() -> None:
    return jsonify(message="Hello world")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=CONTAINER_PORT)