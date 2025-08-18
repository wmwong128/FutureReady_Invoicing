import path = require('path');
import fs = require('fs');
import dotenv = require('dotenv');

const projectDirectory = path.dirname(__dirname);
const packageData = JSON.parse(
  fs.readFileSync(path.join(projectDirectory, 'package.json')).toString()
);
dotenv.config({
  path: path.join(projectDirectory, '.env'),
});
dotenv.config({
  path: path.join(projectDirectory, '.env.local'),
  override: true,
});

export = {
  projectDirectory,
  packageData,
};
