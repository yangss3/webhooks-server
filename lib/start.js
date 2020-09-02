const { configFile, execCmd } = require('./utils/helper')
const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')

const startServer = async () => {
  try {
    const { stdout, stderr } = await execCmd(
      'pm2 start ./lib/hooks.js --name webhooks --time',
      path.resolve(__dirname, '../')
    )
    if (stdout) {
      console.log('Done. Webhooks serve is running.')
    }
    console.error(stderr)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

module.exports = async () => {
  const existConfig = await fs.pathExists(configFile)
  if (existConfig) {
    startServer()
  } else {
    console.log('No hook configuration yet.')
    const { answer } = await inquirer.prompt({
      type: 'confirm',
      name: 'answer',
      message: 'Do you want to create a configuration right row?'
    })
    if (answer) {
      await require('./config.js')()
      startServer()
    } else {
      process.exit(0)
    }
  }
}
