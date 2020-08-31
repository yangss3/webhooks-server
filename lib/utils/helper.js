const os = require('os')
const path = require('path')
const childProcess = require('child_process')
const util = require('util')
const exec = util.promisify(childProcess.exec)
const inquirer = require('inquirer')

exports.configFile = path.resolve(os.homedir(), 'webhooksrc.json')

exports.execCmd = (cmd, execPath) => {
  return exec(`cd ${execPath} & ${cmd}`)
}

exports.prompt = async (message, type = 'confirm', required = false) => {
  const question = {
    type,
    message,
    name: 'answer'
  }
  if (required) {
    question.validate = name => !!name
  }
  const { answer } = await inquirer.prompt(question)
  return answer
}
