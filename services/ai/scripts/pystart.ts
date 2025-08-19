import path = require("path");
import metadata = require("./metadata");
import pyvenv = require("./pyvenv");
import ChildProcess = require("child_process");

const containerPort: number = metadata.packageData["containerPort"];
const srcDirectory = path.join(metadata.projectDirectory, "src");
const hypercornPath = path.join(
  pyvenv.virtualEnvironmentDirectory,
  "bin",
  "hypercorn"
);
const args = process.argv.slice(2);
const execSyncOptions: ChildProcess.ExecSyncOptionsWithStringEncoding = {
  encoding: "ascii",
  cwd: srcDirectory,
  stdio: "inherit",
};

ChildProcess.execSync(
  `${hypercornPath} production:asgi_app --bind 0.0.0.0:${containerPort} ${args}`,
  execSyncOptions
);
