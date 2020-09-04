const { configFile, execCmd } = require('./utils/helper')
const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const chalk = require('chalk')

const startServer = async (port) => {
  try {
    const configObj = await fs.readJson(configFile)
    if (port) {
      configObj.port = port
      await fs.outputJson(configFile, configObj, {spaces: '\t'})
    }
    const { stdout, stderr } = await execCmd(
      'pm2 start ./lib/hooks.js --name webhooks --time',
      path.resolve(__dirname, '../')
    )
    if (stdout) {
      console.log(`${chalk.greenBright('Done!')} Webhooks serve is running at port ${configObj.port || 33333}`)
    }
    console.error(stderr)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

module.exports = async (port) => {
  const existConfig = await fs.pathExists(configFile)
  if (existConfig) {
    startServer(port)
  } else {
    console.log('No hook configuration yet.')
    const { answer } = await inquirer.prompt({
      type: 'confirm',
      name: 'answer',
      message: 'Do you want to create a configuration right row?'
    })
    if (answer) {
      await require('./config.js')()
      console.log()
      startServer(port)
    } else {
      process.exit(0)
    }
  }
}
