const { configFile, execCmd, prompt } = require('./utils/helper')
const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')

const startServer = async () => {
  try {
    const { stdout, stderr } = await execCmd(
      'pm2 start ./lib/hooks.js',
      path.resolve(__dirname, '../')
    )
    console.log(stdout)
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
    const answer = await prompt(
      'Do you want to create a configuration right row?'
    )
    if (answer) {
      const projectName = await prompt(
        'Please enter your project name:',
        'input',
        true
      )
      await require('./config.js')(projectName)
      startServer()
    } else {
      process.exit(0)
    }
  }
}
