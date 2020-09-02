const os = require('os')
const path = require('path')
const childProcess = require('child_process')
const util = require('util')
const exec = util.promisify(childProcess.exec)

exports.configFile = path.resolve(os.homedir(), '.webhooksrc.json')

exports.execCmd = (cmd, execPath) => {
  return exec(execPath ? `cd ${execPath} && ${cmd}` : cmd)
}
