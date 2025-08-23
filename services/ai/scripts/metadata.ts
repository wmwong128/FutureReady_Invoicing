import path = require("path");
import fs = require("fs");
import dotenv = require("dotenv");

const { config } = dotenv;

const projectDirectory = path.dirname(__dirname);

const envPath = path.join(projectDirectory, ".env");
const envLocalPath = path.join(projectDirectory, ".env.local");
if (fs.existsSync(envPath))
  config({
    path: envPath,
  });
if (fs.existsSync(envLocalPath))
  config({
    path: envLocalPath,
    override: true,
  });

const packageData = JSON.parse(
  fs.readFileSync(path.join(projectDirectory, "package.json")).toString()
);

export = {
  projectDirectory,
  packageData,
};
