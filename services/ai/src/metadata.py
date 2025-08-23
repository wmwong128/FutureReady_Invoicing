import os
import json
from dotenv import load_dotenv


script_directory = os.path.dirname(os.path.realpath(__file__))
package_directory = os.path.dirname(script_directory)

env_path = os.path.join(package_directory, ".env")
env_local_path = os.path.join(package_directory, ".env.local")
if os.path.exists(env_path):
    load_dotenv(env_path, override=True)
if os.path.exists(env_local_path):
    load_dotenv(env_local_path, override=True)

env = os.environ

package_data = None
with open(os.path.join(package_directory, "package.json")) as file:
    package_data = json.load(file)