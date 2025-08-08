import fs = require('fs');
import path = require('path');

const projectDirectory = path.dirname(__dirname);
const packageData = JSON.parse(
  fs.readFileSync(path.join(projectDirectory, 'package.json')).toString()
);

export = {
  projectDirectory,
  packageData,
};
