const path = require('path')
const fs = require('fs-extra')
const { execCmd } = require('./utils/helper')

module.exports = async (repo, config) => {
  try {
    const { buildBranch, projectPath, deployPath, buildCmd } = config
    const packageJson = path.resolve(projectPath, 'package.json')
    const oldPackage = await fs.readJson(packageJson)
    
    // update code
    const pullCodeOutput = await execCmd(
      `git checkout ${buildBranch} && git pull`, projectPath
    )
    console.log(pullCodeOutput.stdout)
    console.error(pullCodeOutput.stderr)

    const modified = repo.commits.reduce(
      (prev, cur) => ([...prev, ...cur.modified]), []
    )
    let reinstall = false
    // check whether need to reinstall dependencies
    if (modified.some(file => file === 'package.json')) {
      const newPackage = await fs.readJson(packageJson)
      const depsChanged = Object.keys(newPackage.dependencies).some(key => {
        return newPackage.dependencies[key] !== oldPackage.dependencies[key]
      })
      const devDepsChanged = Object.keys(newPackage.devDependencies).some(key => {
        return newPackage.devDependencies[key] !== oldPackage.devDependencies[key]
      })
      reinstall = depsChanged || devDepsChanged
    }

    // build for production
    let buildOutput
    if (reinstall) {
      buildOutput = await execCmd(`npm install && ${buildCmd}`, projectPath)
    } else {
      buildOutput = await execCmd(buildCmd, projectPath)
    }
    console.log(buildOutput.stdout)
    console.error(buildOutput.stderr)

    // deploy to server
    await fs.copy(path.resolve(projectPath, 'dist'), deployPath)
  } catch (error) {
    console.error(error)
  }
}
