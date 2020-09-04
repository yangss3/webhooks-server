const inquirer = require('inquirer')
const fs = require('fs-extra')
const chalk = require('chalk')
const { log } = console

const projectQuestions = [
  {
    type: 'input',
    name: 'projectPath',
    message: 'project path:',
    validate: val => !!val
  },
  {
    type: 'input',
    name: 'deployPath',
    message: 'deploy path:',
    validate: val => !!val
  },
  {
    type: 'input',
    name: 'buildBranch',
    message: 'build branch:',
    default: 'master',
    validate: val => !!val
  },
  {
    type: 'input',
    name: 'buildCmd',
    message: 'build command:',
    default: 'npm run build',
    validate: val => !!val
  }
]

const { configFile } = require('./utils/helper')

module.exports = async (projectName, list) => {
  let configObj = {},
    projectConfig = {}
  try {
    configObj = await fs.readJson(configFile)
  } catch (error) {
    if(!error.code) {
      log(chalk.redBright(`Error: ${error.message}`))
      log(chalk.redBright(`please check your configuration file.`))
      process.exit(1)
    }
    if (list) {
      process.exit(0)
    }
  }
  configObj.projects = configObj.projects || {}
  if (list) {
    if (projectName) {
      log(configObj.projects[projectName] || '')
    } else {
      log(configObj.projects)
    }
  } else {
    if (projectName) {
      projectConfig = await inquirer.prompt(projectQuestions)
      configObj.projects[projectName] = projectConfig
    } else {
      projectQuestions.unshift({
        type: 'input',
        name: 'projectName',
        message: 'project name:',
        validate: name => !!name
      })
      projectConfig = await inquirer.prompt(projectQuestions)
      projectName = projectConfig.projectName
      delete projectConfig.projectName
      configObj.projects[projectName] = projectConfig
    }
    await fs.outputJson(configFile, configObj, { spaces: '\t' })
    log(`The configuration info has been saved in ${chalk.yellowBright(configFile)}, you can directly edit this file to update it.`)
  }
}
