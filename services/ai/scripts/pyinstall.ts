import pyvenv = require("./pyvenv");

const args = process.argv.slice(2);
if (args.length !== 0) {
  pyvenv.installPackage(args.join(" "));
  pyvenv.saveRequirements();
} else pyvenv.installRequirements();
