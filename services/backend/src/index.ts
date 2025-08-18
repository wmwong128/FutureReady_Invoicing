import express = require('express');
import metadata = require('./metadata');

const name = metadata.packageData['name'] as string;
const containerPort = metadata.packageData['containerPort'] as number;
const hostPort = metadata.packageData['hostPort'] as number;
const app = express();

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.listen(containerPort, () => {
  console.log(`${name} is listening on port ${hostPort}:${containerPort}`);
});
