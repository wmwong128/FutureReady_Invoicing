from flask import Flask, jsonify
from metadata import package_data, env
from authlib.integrations.flask_oauth2 import ResourceProtector
from token_validator import Auth0JWTBearerTokenValidator

NAME : str = package_data["name"]
CONTAINER_PORT : int = package_data["containerPort"]
AUTH0_DOMAIN : str = env["AUTH0_DOMAIN"]
AUTH0_AUDIENCE : str = env["AUTH0_AUDIENCE"]
NOAUTH : bool = bool(env.get("NOAUTH", False))

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

@app.route("/")
@conditional_decorator(protector(None), not NOAUTH)
def main() -> None:
    return jsonify(message="Hello world")

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=CONTAINER_PORT)