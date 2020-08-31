const inquirer = require('inquirer')
const fs = require('fs-extra')
const { prompt } = require('./utils/helper')

const projectPrompt = function () {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'projectPath',
      message: 'project source path:',
      validate: path => !!path
    },
    {
      type: 'input',
      name: 'deployPath',
      message: 'project deploy path:',
      validate: path => !!path
    },
    {
      type: 'input',
      name: 'buildBranch',
      message: 'build branch:',
      default: 'master'
    },
    {
      type: 'input',
      name: 'buildCmd',
      message: 'build command:',
      default: 'npm run build'
    }
  ])
}

const { configFile } = require('./utils/helper')

module.exports = async (projectName, list) => {
  let configObj = {},
    projectConfig = {}
  try {
    configObj = await fs.readJson(configFile)
    if (list && configObj.projects && configObj.projects[projectName]) {
      console.log(configObj.projects[projectName])
      process.exit(0)
    } else if (!list) {
      if (configObj.projects) {
        if (configObj.projects[projectName]) {
          const answer = await prompt(
            `${projectName}'s configuration already exists, overwrite it?`
          )
          if (!answer) {
            process.exit(0)
          }
        }
        projectConfig = await projectPrompt()
        configObj.projects[projectName] = projectConfig
      } else {
        projectConfig = await projectPrompt()
        configObj.projects = { [projectName]: projectConfig }
      }
    }
  } catch (error) {
    if (list) {
      process.exit(0)
    } else {
      projectConfig = await projectPrompt()
      configObj.projects = { [projectName]: projectConfig }
    }
  }
  await fs.outputJson(configFile, configObj, { spaces: '\t' })
}
