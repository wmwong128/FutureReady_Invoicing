import metadata = require("./metadata");
import ChildProcess = require("child_process");
import fs = require("fs");
import path = require("path");

const execSyncOptions: ChildProcess.ExecSyncOptionsWithStringEncoding = {
  encoding: "ascii",
  cwd: metadata.projectDirectory,
  stdio: "inherit",
};

const requirementsPath = path.join(
  metadata.projectDirectory,
  "requirements.txt"
);
const virtualEnvironmentDirectory = path.join(
  metadata.projectDirectory,
  ".venv.local"
);

if (!fs.existsSync(virtualEnvironmentDirectory)) {
  ChildProcess.execSync(
    `python3 -m venv ${virtualEnvironmentDirectory}`,
    execSyncOptions
  );
}

const virtualPythonPath = path.join(
  virtualEnvironmentDirectory,
  "bin",
  "python3"
);

const virtualPipPath = path.join(virtualEnvironmentDirectory, "bin", "pip");

const installRequirements = () => {
  ChildProcess.execSync(
    `${virtualPipPath} install -r ${requirementsPath}`,
    execSyncOptions
  );
};

const saveRequirements = () => {
  ChildProcess.execSync(
    `${virtualPipPath} freeze > ${requirementsPath}`,
    execSyncOptions
  );
};

const installPackage = (packageName: string) => {
  ChildProcess.execSync(
    `${virtualPipPath} install ${packageName}`,
    execSyncOptions
  );
};

const runPython = (arg: string) => {
  ChildProcess.execSync(`${virtualPythonPath} ${arg}`, execSyncOptions);
};

export = {
  virtualEnvironmentDirectory,
  virtualPythonPath,
  virtualPipPath,
  installRequirements,
  saveRequirements,
  installPackage,
  runPython,
};
