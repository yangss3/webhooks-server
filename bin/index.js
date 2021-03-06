#!/usr/bin/env node
const { program } = require('commander')
const enhanceErrorMessages = require('../lib/utils/enhanceErrorMessages')
const { execCmd } = require('../lib/utils/helper')

program
  .version(
    `git-webhooks v${require('../package.json').version}`,
    '-v, --version'
  )
  .name('webhooks')
  .usage('<command> [options]')

program
  .command('start')
  .description('Start an webhooks server for auto deployment')
  .option('-p, --port [port]')
  .action((cmd) => {
      require('../lib/start.js')(cmd.port)
  })

program
  .command('restart')
  .description('Restart the webhooks server')
  .action(async () => {
    try {
      const { stdout, stderr } = await execCmd('pm2 restart webhooks')
      if (stdout) {
        console.log('Restart. Done')
      }
      console.error(stderr)
    } catch (error) {
      console.error(error)
    }
  })

program
  .command('stop')
  .description('Stop the webhooks server')
  .action(async () => {
    try {
      const { stdout, stderr } = await execCmd('pm2 delete webhooks')
      if (stdout) {
        console.log('Stop. Done.')
      }
      console.error(stderr)
    } catch (error) {
      console.error(error)
    }
  })

program
  .command('config [project-name]')
  .option('-l, --list', 'List configurations')
  .description(`Create or list a project's configuration`)
  .action((projectName, cmd) => {
    require('../lib/config.js')(projectName, cmd.list)
  })

enhanceErrorMessages()

program.parse(process.argv)
