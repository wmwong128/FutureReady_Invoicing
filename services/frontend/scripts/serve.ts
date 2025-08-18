import metadata = require("./metadata");
import ChildProcess = require("child_process");

const { execSync } = ChildProcess;
const { projectDirectory, packageData } = metadata;

const imageTag = `${packageData["name"]}:latest`;
const containerName = `${packageData["name"]}-container`;
const hostPort = packageData["hostPort"] as number;
const execSyncOptions: ChildProcess.ExecSyncOptionsWithStringEncoding = {
  encoding: "ascii",
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

execSync(`docker build . -t ${imageTag}`, execSyncOptions);
execSync(
  `docker run -d -p ${hostPort}:80 --name ${containerName} ${imageTag}`,
  execSyncOptions
);
