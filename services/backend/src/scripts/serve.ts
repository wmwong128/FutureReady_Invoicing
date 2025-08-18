import ChildProcess = require('child_process');
import metadata = require('../metadata');

const { execSync } = ChildProcess;
const { packageData, projectDirectory } = metadata;

const imageTag = `${packageData['name']}:latest`;
const containerName = `${packageData['name']}-container`;
const containerPort = packageData['containerPort'];
const hostPort = packageData['hostPort'];
const execSyncOptions: ChildProcess.ExecSyncOptionsWithStringEncoding = {
  encoding: 'ascii',
  cwd: projectDirectory,
};

const isContainerExists =
  execSync(
    `docker container list --all --filter "name=${containerName}" --format "{{.Names}}"`,
    execSyncOptions
  ).length !== 0;

if (isContainerExists)
  execSync(
    `docker container rm --force --volumes ${containerName}`,
    execSyncOptions
  );

execSync(
  `docker build . -t ${imageTag} --build-arg CONTAINER_PORT=${containerPort}`,
  execSyncOptions
);
execSync(
  `docker run -d -p ${hostPort}:${containerPort} --name ${containerName} ${imageTag}`,
  execSyncOptions
);
