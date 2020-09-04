# webhooks-server
一个基于 Github webhooks 和 nodejs 的前端项目自动部署工具

## Installation
确保服务器上已经安装好 **node** 和 **git**，并配置好环境变量。

该工具使用 **pm2** 来管理 hooks 进程，需要全局安装 **pm2** （如果已安装可以忽略这一步）:
```sh
# npm
npm install -g pm2
# yarn
yarn global add pm2
```
全局安装 webhooks-server ：
```sh
# npm
npm install -g @yangss/webhooks-server
# yarn
yarn global add @yangss/webhooks-server
```
## Usage

```sh
webhooks config my-project
webhooks start -p 5000
```
>注意：在启动 webhooks-server 之前，请确保需要进行自动打包部署的项目已克隆到服务器本地，并安装好项目依赖。同时需要配置好 git 凭据，保证可以免密与 git 远程仓库通信。

服务启动之后，就可以将 `http://[ip]:5000/webhooks`（ip 为你的服务器的公网 ip） 添加到 my-project 项目仓库的 webhooks 配置中。
### Command line Interface
#### `webhooks config [project-name]`
添加项目构建和部署的配置

"project-name" 是你需要进行自动构建部署的项目名，应该与项目的 git 仓库名相同。
项目名称可以直接跟在 `config` 命令后面，如果不提供，则会在后续的 prompt 中进行询问：
```sh
webhooks config my-project
? project path: /apps/my-project    # 项目在服务器上的源码路径
? deploy path: /usr/www/my-project  # 项目要部署的路径
? build branch: master              # 项目构建打包的分支，默认为 master 分支
? build command: npm run build      # 项目构建打包的命令，默认为 npm run build
```
>这些配置信息会保存到用户目录的 `$HOME/.webhooksrc.json` 配置文件中，你也可以手动编辑这个文件来进行项目配置。
#### `webhooks config -l[--list] [project-name]`
查看项目配置。

如果提供 `project-name` 参数，会列出该项目的配置，不提供则列出所有配置：
```sh
webhooks config -l my-project
{
  projectPath: '/apps/my-project',
  deployPath: '/usr/www/my-project',
  buildBranch: 'master',
  buildCmd: 'npm run build'
}
```
#### `webhooks start`
启动 hooks 服务。

该命令会在后台启动一个 node 服务，默认监听 33333 端口。也可以通过 `-p, --port` 选项来指定端口号：`webhooks start -p 5000`。
#### `webhooks restart`
重启 hooks 服务

#### `webhooks stop`
终止 hooks 服务