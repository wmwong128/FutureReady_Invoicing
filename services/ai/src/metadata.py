import os
import json

script_directory = os.path.dirname(os.path.realpath(__file__))
package_directory = os.path.dirname(script_directory)
package_data = None
with open(os.path.join(package_directory, "package.json")) as file:
    package_data = json.load(file)