import path = require("path");
import metadata = require("./metadata");
import pyvenv = require("./pyvenv");

const args = process.argv.slice(2);
const appPath = path.join(metadata.projectDirectory, "src", "main.py");

pyvenv.runPython(`${appPath}`);
