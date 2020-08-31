const express = require('express')
const app = express()
const child_process = require('child_process')
const { promisify } = require('util')
const exec = promisify(child_process.exec)
const fs = require('fs-extra')

const port = 6000
const buildDir = 'D:\\Projects\\webhooks-test'
const deployDir = 'D:\\Projects\\webhooks-deploy'
const buildBranch = 'mobile'

app.use(express.json())

app.post('/webhooks', async (req, res) => {
  const repo = {
    branch: req.body.ref.split('/').pop(),
    name: req.body.repository.name,
    url: req.body.repository.clone_url,
    commit: req.body.commits[0]
  }

  // check branch
  if (repo.branch !== buildBranch) {
    return res.send(
      'The push branch is not master branch, build process ignored.'
    )
  }

  res.send('Build & Deploy')

  const source = `${buildDir}/${repo.name}`
  const dest = `${deployDir}/${repo.name}`

  try {
    // pull code from remote
    const pullCodeOutput = await exec(
      `cd ${source} && git checkout ${repo.branch} && git pull`
    )
    console.log(pullCodeOutput.stdout)
    console.error(pullCodeOutput.stderr)

    // check package.json change
    if (repo.commit.modified.some(file => file === 'package.json')) {
      // check whether need to reinstall dependencies
      const package = await fs.readJson(`${source}/package.json`)
      const reposDeps = await fs.readJson('repos-deps.json')
      const depsChanged = Object.keys(package.dependencies).some(key => {
        const oldVersion =
          reposDeps[repo.name] && reposDeps[repo.name].dependencies[key]
        return package.dependencies[key] !== oldVersion
      })
      const devDepsChanged = Object.keys(package.devDependencies).some(key => {
        const oldVersion =
          reposDeps[repo.name] && reposDeps[repo.name].devDependencies[key]
        return package.devDependencies[key] !== oldVersion
      })
      process.env.REINSTALL_DEPS = depsChanged || devDepsChanged
      if (!reposDeps[repo.name] || process.env.REINSTALL_DEPS) {
        reposDeps[repo.name] = {
          dependencies: package.dependencies,
          devDependencies: package.devDependencies
        }
        await fs.outputJson('repos-deps.json', reposDeps)
      }
    }

    // build for production
    let cmd = ''
    if (process.env.REINSTALL_DEPS) {
      cmd = `cd ${source} && npm install && npm run build`
    } else {
      cmd = `cd ${source} && npm run build`
    }
    const buildOutput = await exec(cmd)
    console.log(buildOutput.stdout)
    console.error(buildOutput.stderr)

    // deploy to server
    await fs.copy(`${source}/dist`, dest)
  } catch (error) {
    console.error(error)
  }
})

app.listen(port, () => {
  console.log('Webhooks server is running on 6000...')
})
