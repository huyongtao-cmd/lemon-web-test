# telework-web

[telework办公平台2期前端项目 - 开发指南](./doc/tech-stack.md)

## 开发环境

**首先在[GitLab](https://git.elitescloud.com/)上注册**，请PM添加至项目组，获取项目代码与需求规格书等。之后准备如下开发环境:
  
- [Node 8+](http://nodejs.cn/download/)、NPM (Yarn)

> Node 10 is recommended, Yarn is the real package manager in our project

- [Git](https://git-scm.com/downloads)(推荐外加使用一种用来查看流程的可视化工具)
- 代码编辑器 如[Visual Studio Code](https://code.visualstudio.com/) 或 [Idea/WebStorm](https://www.jetbrains.com/idea/)
- 命令行工具 如Git Bash for Windows 或 Terminal.app for macOS (Idea/WS自带)
- API测试工具 [Yapi](http://192.168.0.159/project/46/interface/api)
- 所使用的编辑器请优先配置JS语法环境到ES6+版本。同时建议具备以下插件或功能:

  - EditorConfig
  - Node.js
  - React & React JSX
  - Styled Component & less

**系统运行(命令行):**

```shell
  # make sure you have installed node && yarn
  yarn install # install package dependencies
  yarn start # start dev mode, open browsers at location http://localhost:3001
  # if you need a dist
  yarn build
```

---

## 运行环境

现代浏览器及 IE11。
推荐**Google Chrome**

1. 需要具有 debug console
1. 需要具备网速调控功能。
1. Chrome插件：Redux DevTools(推荐) 和 React Developer Tools(可选)
  
| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Opera | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/electron/electron_48x48.png" alt="Electron" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Electron |
| --------- | --------- | --------- | --------- | --------- | --------- |
| IE11, Edge| last 2 versions| last 2 versions| last 2 versions| last 2 versions| last 2 versions
  
更多信息请参考 [使用文档](http://pro.ant.design/docs/getting-started)。
  
**注意:**
  实际开发中，umi集成了热部署功能，通过websocket重绘页面，但是样式因为有预编译与缓存所以不会生效，修改样式依旧需要刷新页面查看。

---
## 技术栈

> 架构:

1.整体解决方案

- [Ant Design Pro](https://pro.ant.design/docs/getting-started-cn)
- [预览](http://preview.pro.ant.design)
- [首页](http://pro.ant.design/index-cn)
- [使用文档](http://pro.ant.design/docs/getting-started-cn)
- [更新日志](http://pro.ant.design/docs/changelog-cn)
- [常见问题](http://pro.ant.design/docs/faq-cn)
- [国内镜像](http://ant-design-pro.gitee.io)
  
2.动态样式

- [Less](http://less.bootcss.com/)
- [Styled Component](https://www.styled-components.com)

> antd 使用 Less 语法构建 CSS， styled Component 为备选方案，提供 Less 之外的选择

3.应用框架

- [React.js](https://reactjs.org/)
- [React-JSX](https://reactjs.org/docs/introducing-jsx.html)

4.状态管理

- [Dva.js](https://github.com/dvajs/dva)
- [Redux](https://redux.js.org/)
- [Redux-saga](https://redux-saga.js.org/docs/basics/)

> Dva 中对于 Redux 异步请求的封装使用该框架拓展

5.集成框架 

- [UmiJs](https://umijs.org/zh/guide/)

> umi = webpack 封装工具 + 路由 + HTML 生成 + 完善的插件机制，能在提升开发者效率方面发挥出更大的价值。

- [Webpack](http://webpack.github.io/)

> **watching !!!** 本项目基于 umi 早期版本构建，有需求请参考对应文档，避免受到 breakChange 的影响

6.测试框架

- 单元测试(ut): [Jest](https://jestjs.io/zh-Hans/)
- 端对端(e2e, 冒烟)测试 - [Puppeteer](https://www.npmjs.com/package/puppeteer)

> Jest 使用请参考编码规范 - [测试](https://jestjs.io/docs/zh-Hans/getting-started)  
> Puppeteer 第一次使用要安装一段时间！！这是很正常的，无需紧张。
>> 目前 Puppeteer 因为未知原因已被移除，以后可能还会加回来

###代码提交、发布流程：
####发布流程
1. 发布周期为一周发布一次，周三下班后发布到99验证环境，周五下班后发布到生产环境.
1. 开发人员新建以个人英文名命名的代码分支，在个人分支上进行开发、联调、自测，可以从dev分支上新建个人分支。
1. 开发完成功能自测后，先merge到dev分支，再从dev分支**增量**提交代码到beta分支，需求负责人进行验收。
1. 开发人员提供发布清单到telework-doc项目doc/dev/release/指定日期文件夹下，日期为本周的周三对应的日期。
1. 周三一天验收过本周需要需要上线的功能。下班后，发布人员会把beta(88测试环境)分支全量提交到到master(99验证环境)分支进行发布前验证。
1. 周四、周五会限制beta分支提交代码。
1. 99环境验证出问题后，需要提交代码修复bug时，开发人员通知发布人员（卢家龙）申请提交代码到beta分支，需求负责人重新测试验收。验收通过，发布人员会把代码再全量从beta分支提交到master分支。
1. 99验收没有问题稳定后，或周五发布后，重新开放beta分支，进行下一轮代码提交，测试

####特别强调：
1. dev提交到beta，只能增量提交自己的代码，不要把dev上的代码全部merge到beta分支。
1. 代码只有在周三下班前提交到beta分支（需要修复bug的另算）才会被发布到生产环境。
1. 已经发布到99环境，99验证出现问题，无法保证在周五发布前修复问题，请及时回滚自己提交的代码，增量提交到beta分支上验收。发布脚本放到下周提供。
1. 规范自己的提交记录。提交消息写清楚哪个需求号，什么功能点。一个需求尽量做到一次提交。增量提交代码到beta分支的时候，才能整理清楚哪些代码是需要提交的。
1. 发布清单放到指定文件夹下，不允许在doc项目上自己建文件夹放发布清单。


