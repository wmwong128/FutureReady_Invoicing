import metadata = require('./metadata');

const name = metadata.packageData['name'] as string;
console.log(`Daily routine of ${name} executed.`);
