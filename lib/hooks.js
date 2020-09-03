const express = require('express')
const app = express()
const fs = require('fs-extra')
const { configFile } = require('./utils/helper')
const { port = 33333 } = fs.readJsonSync(configFile)

app.use(express.json())

app.post('/webhooks', async (req, res) => {
  const repo = {
    branch: req.body.ref.split('/').pop(),
    name: req.body.repository.name,
    url: req.body.repository.clone_url,
    commits: req.body.commits
  }
  const config = await fs.readJson(configFile)
  const projectConfig = config.projects[repo.name]

  if (projectConfig) {
    if (repo.branch === projectConfig.buildBranch) {
      res.send('Build & Deploy')
      require('./build')(repo, projectConfig)
    } else {
      res.send('The push branch does not match the build branch.')
    }
  } else {
    res.send('The build and deploy configuration associated with the project was not found.')
  }
})

app.listen(port, () => {
  console.log(`Webhooks server is running on port ${port}...`)
})
