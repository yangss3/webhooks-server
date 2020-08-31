const { Command } = require('commander');
const chalk = require('chalk')

function enhanceErrorMessages(methodName, log) {
  Command.prototype[methodName] = function (...args) {
    if (methodName === 'unknownOption' && this._allowUnknownOption) {
      return;
    }
    this.outputHelp();
    console.log(`\n${chalk.red(log(...args))}\n`);
    process.exit(1);
  };
}

module.exports = () => {
  enhanceErrorMessages('missingArgument', (argName) => {
    return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`;
  });

  enhanceErrorMessages('unknownOption', (optionName) => {
    return `Unknown option ${chalk.yellow(optionName)}.`;
  });

  enhanceErrorMessages('optionMissingArgument', (option, flag) => {
    return (
      `Missing required argument for option ${chalk.yellow(option.flags)}` +
      (flag ? `, got ${chalk.yellow(flag)}` : ``)
    );
  });
}
