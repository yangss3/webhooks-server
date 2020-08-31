#!/usr/bin/env node
const { program } = require('commander')
const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const enhanceErrorMessages = require('../lib/utils/enhanceErrorMessages')

program
  .version(
    `git-webhooks-server v${require('../package.json').version}`,
    '-v,--version'
  )
  .name('git-webhooks-server')
  .usage('<command> [options]')

program
  .command('start')
  .description('Start an webhooks server for auto deployment')
  .action(() => {

      require('../lib/start.js')()

  })

program
  .command('restart')
  .description('Restart the webhooks server')
  .action(() => {
    // require('../lib/restart.js')()
  })

program
  .command('stop')
  .description('Stop the webhooks server')
  .action(() => {})

program
  .command('config <project-name>')
  .option('-l, --list', 'List configurations')
  .description('Create a project template')
  .action((projectName, cmd) => {
    require('../lib/config.js')(projectName, cmd.list)
  })

enhanceErrorMessages()

program.parse(process.argv)
