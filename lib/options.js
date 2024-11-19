const { program } = require("commander");

function configOptions() {
  const version = require("../package.json").version;
  program.version(version, "-v --version");
}

module.exports = {
  configOptions,
};
