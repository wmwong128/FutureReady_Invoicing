from flask import Flask
from metadata import package_data

NAME : str = package_data["name"]
CONTAINER_PORT : int = package_data["containerPort"]

app = Flask(__name__)

@app.route("/")
def hello_world() -> None:
    return f"Hello world from {NAME}."

if __name__ == '__main__':
    app.run(host='localhost', port=CONTAINER_PORT)