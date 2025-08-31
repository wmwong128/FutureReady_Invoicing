import metadata = require('../metadata');
import fs = require('fs');
import path = require('path');
import childProcess = require('child_process');

const { projectDirectory, packageData } = metadata;
const { execSync } = childProcess;
const clusterDirectory = packageData['clusterDirectory'] as string;
const excludedServices = packageData['excludedServices'] as string[];
const excludedServicesRegExp = excludedServices.map(
  (pattern) => new RegExp(pattern)
);

fs.readdirSync(path.join(projectDirectory, clusterDirectory)).forEach(
  (serviceName) => {
    for (const regexp of excludedServicesRegExp)
      if (regexp.test(serviceName)) return;
    const serviceDirectory = path.join(
      projectDirectory,
      clusterDirectory,
      serviceName
    );
    if (!fs.lstatSync(serviceDirectory).isDirectory()) return;
    console.log(`Activating ${serviceName}`);
    execSync(`npm install && npm run serve`, {
      cwd: serviceDirectory,
      stdio: 'inherit',
    });
  }
);
