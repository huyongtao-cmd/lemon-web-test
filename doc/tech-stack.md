<h1 align="center">REP 办公平台 前端技术栈</h1>
<div align="center"><small>基于Ant Design Pro<small></div>
<br>

# - Empty Topic -

## 基础知识

- 了解Web BS架构原理
- 了解Http协议及RESTful规范
- 了解HTML/CSS与DOM原理
- 了解JavaScript语法
- 了解Dom-Diff页面更新算法原理
- 了解数据驱动视图(MV-VM)与响应式编程
- 了解前端状态管理设计模式
- 了解浏览器客户端调试方法
- 了解Git版本管理工具与基本linux命令

**[参考资料 - 技术文档](http://devdocs.io/)**
  
---

## 开发环境

** 首先在[GitLab](https://git.elitescloud.com/)上注册 **，请PM添加至项目组，获取项目代码与需求规格书等。之后准备如下开发环境:
  
- [Node 10+](http://nodejs.cn/download/)、NPM或[CNPM](https://npm.taobao.org/)
- [Git](https://git-scm.com/downloads)(推荐外加使用一种用来查看流程的可视化工具)
- 代码编辑器 如[Visual Studio Code](https://code.visualstudio.com/) 或 [Idea/WebStorm](https://www.jetbrains.com/idea/)
- 命令行工具 如Git Bash for Windows 或 Terminal.app for macOS (Idea/WS自带)
- API测试工具 [Yapi](http://192.168.0.159/project/46/interface/api)
- 所使用的编辑器请优先配置JS语法环境到ES6+版本。同时建议具备以下插件或功能:
  0. EditorConfig
  1. Node.js
  2. React & React JSX
  3. Styled Component & less

---

## 运行环境

  现代浏览器及 IE11。推荐Google Chrome
  
  1. 需要具有debug console
  1. 需要具备网速调控功能。
  1. Chrome插件：Redux DevTools(推荐) 和 React Developer Tools(可选)
  
  | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Opera |
  | --------- | --------- | --------- | --------- | --------- |
  | IE11, Edge| last 2 versions| last 2 versions| last 2 versions| last 2 versions
  
  更多信息请参考 [使用文档](http://pro.ant.design/docs/getting-started)。
  
** 环境设置与运行(命令行): **

```shell

  yarn # 安装
  yarn start # 启动

  npm config set registry http://elpdtmvn:8081/repository/npm-public/
  npm install --registry=http://elpdtmvn:8081/repository/npm-public/   # 通过公司npm仓库进行安装
  npm start  # 启动调试， 打开浏览器，访问：http://localhost:PORT 其中 PORT位于package.json中启动项配置
  
  npm run build  # 打包
  serve dist/    # 本地测试打包发布，访问：http://localhost:5000

```
  
** 注意: **
  1. 实际开发中，umi集成了热部署功能，通过websocket重绘页面，但是样式因为有预编译与缓存所以不会生效，修改样式依旧需要刷新页面查看。
  1. 使用yarn启动时，万一出现cache error，删除lock文件重新启动即可。
  1. 注意! windows用户在热部署95%过程中如果less报错可能会没有日志会 而且后面程序会看起来处于卡死状态。
     - 解决方案: 首先检查编译工具。执行build脚本，找到日志中关于less的错误并修复。

---

## 技术栈

> 架构:

  1. 整体解决方案 - [Ant Design Pro](https://pro.ant.design/docs/getting-started-cn)
  
    - [预览](http://preview.pro.ant.design)
    - [首页](http://pro.ant.design/index-cn)
    - [使用文档](http://pro.ant.design/docs/getting-started-cn)
    - [更新日志](http://pro.ant.design/docs/changelog-cn)
    - [常见问题](http://pro.ant.design/docs/faq-cn)
    - [国内镜像](http://ant-design-pro.gitee.io)
  
  2. 动态样式 - [Less](http://less.bootcss.com/) 备注: antd使用该语法构建CSS
  
    * Styled Component
  
  3. 应用框架 - [React.js](https://reactjs.org/)
  
    * React JSX - [React-JSX](https://reactjs.org/docs/introducing-jsx.html)

  4. 状态管理 
  
    - [Dva.js](https://github.com/dvajs/dva)
    * Redux - [Redux](https://redux.js.org/)
              [Redux-saga](https://redux-saga.js.org/docs/basics/) - Dva中对于Redux异步请求的封装使用该框架拓展
  
  5. 集成框架 - [UmiJs](https://umijs.org/zh/guide/)
  
    * Webpack - [Webpack](http://webpack.github.io/)
    * umi = webpack 封装工具 + 路由 + HTML 生成 + 完善的插件机制，能在提升开发者效率方面发挥出更大的价值。
    * 注意: umi整合了create react app单页入口页生成逻辑，仅需要在配置中配置即可。
  
  6. 测试框架
  
    - 单元测试(ut): [Jest](https://jestjs.io/zh-Hans/) 备注: 使用参考编码规范 - 测试。
    - 端对端(e2e, 冒烟)测试 - [Puppeteer](https://www.npmjs.com/package/puppeteer) 
      备注: 第一次使用要安装一段时间！！这是很正常的，无需紧张。
      [中文文档](https://zhaoqize.github.io/puppeteer-api-zh_CN/#/)

> 组件|库:
  
  1. 图标库 - [IconFont](http://www.iconfont.cn/collections/detail?cid=9402)
  
  2. 动画库 - [Animate](https://daneden.github.io/animate.css/)
  
  3. 算法工具 - [Ramda](http://ramdajs.com/docs/) * 这个请重点研究
    ([Pointfree](http://www.ruanyifeng.com/blog/2017/03/pointfree.html))
  
  4. 时间处理 - [Moment](http://momentjs.cn/) ps: 解决js的第1个巨坑
  
  5. 数学工具 - [Mathjs](http://mathjs.org/) ps: 解决js的第2个巨坑
  
  6. 字符串处理 - [qs](https://www.npmjs.com/package/qs)
  
  7. 缓存技术 - [memoizeOne](https://github.com/alexreardon/memoize-one)
  
  8. 可视化图表 - [AntV](https://antv.alipay.com/zh-cn/g2/3.x/demo/line/basic.html)
  
  (TODO:项目时间紧张，后期有待补充)

> 附录 - 框架原理介绍:

  1. [React-dom-diff](https://calendar.perfplanet.com/2013/diff/) -- React的整页刷新diff算法介绍
  1. [React-why-no-DOM-manipulate](https://zhuanlan.zhihu.com/p/20346379) -- 为何不要在React中进行DOM操作
  1. [Flux](https://github.com/facebook/flux) -- Redux将Flux中分散的store管理成一个
  1. [Redux-simple-tutorial](https://github.com/kenberkeley/redux-simple-tutorial) -- 前端MVC之为何要使用Redux
  1. [Redux-advanced-tutorial](https://github.com/kenberkeley/redux-simple-tutorial/blob/master/redux-advanced-tutorial.md) -- Redux源码解析

---

## 项目结构

```text
/root/
  ├── config                   # umi 配置，包含路由，构建等配置
  ├── mock                     # 本地模拟数据
  ├── public
  │   └── favicon.png          # Favicon
  ├── src
  │   ├── assets               # 本地静态资源
  │   ├── components           # 业务通用组件
  │   ├── e2e                  # 冒烟测试用例
  │   ├── layouts              # 通用布局
  │   ├── models               # 全局 dva model
  │   ├── pages                # 业务页面入口和常用模板
  │   ├── services             # 后台接口服务
  │   ├── utils                # 工具库
  │   ├── locales              # 国际化资源
  │   ├── global.less          # 全局样式
  │   └── global.js            # 全局 JS
  ├── tests                    # 测试工具
  ├── README.md
  └── package.json
```

** 注意事项: 描述中带*的文件请重点注意，至少全部阅读一遍。 **

  1. 暂无。

** 业务开发流程: **

  0. 检查位于`config/router.config.js`中的后端链接配置。
  1. 在`config/router.config.js`中配置对应的路由/页面组件映射。
  2. 在`src/services`中注册页面将会使用的所有api, 注意引用位于`src/api.js`。
  3. 在`src/models`中注册redux声明命名空间，配置相关状态控制。
  4. 在`src/pages`中注册空白页面，使用Connect组件关联redux一级状态节点。
  5. 在上一步注册的组件中添加页面组件模版(位于`src/pages/demo/Case/Blank.jsx`)并去除不需要部分。
  6. 完成页面组件开发，注意组件生命周期(默认模版为PureComponent，一般够用)各阶段。
  7. 在`src/locales/zh-CN`中对涉及到的相关字符串进行国际化配置。　

** 测试流程: **

  ut: 未完待续
  e2e: 未完待续

** 集成: **

  ci: 未完待续
  pd: 未完待续

** 样式与主题: **

  antd设计规范: 未添加
  公司UI设计规范: 未添加

---

## 开发规范

### [整体规范](https://github.com/wearehive/project-guidelines/blob/master/README-zh.md)
  
  在开发完成后，应当检查下面5方面，注意代码质量:

- 编码标准：(lint)
  1. 注意类命名、包命名、代码风格 符合该规范中的描述。
  2. 领域名词统一查询设计文档，不要自行命名。
  3. 注意lint工具的提示，注意分辨拼写提示。

- 代码重复：
  1. 对大量的重复代码，考虑将重复的代码提取出来，比如配置项或者工具方法。
  2. 相同功能的模块应当提成组件。
  3. **特别注意: 不要想象自己的代码能封装任何操作！！(以往的项目很常见)**
  - 从自然的角度来说，人体有不同的器官，各自发挥自己的作用，如果有一个出现问题，不会影响其它功能。
  - 代码也是这样的，所以应当尽量避免把整个完整的业务封装在工具型组件之中，应当尽量使用回调函数，或者自己做私有组件。
  - 如果你不确定自己的代码是否有可能复用，优先应当考虑使用TODO提醒，封装零散代码永远比修改聚合代码来的更加方便。
  
- 代码覆盖：
  1. 工具代码是否通过jest测试。（基本上需要全部覆盖）
  2. 业务代码是否通过e2e测试。（基本上需要全部覆盖）
  3. 功能完成的基础上需思考代码是否稳定，是否有足够的日志信息判断错误来源。
  4. 对于测试人员，测试的集成用例是否包用户使用场景，以及是否考虑极端因素(超时，非法输入等)。

- 依赖项分析：**高内聚 低耦合**
  1. 减少不同模块，特别是组件间的代码过度耦合
  2. 避免循环依赖(常见于工具类)

- 复杂度分析：(Metric)
  1. 减少过多循环(for)/分支(if-else)项，使用Ramda工具简化复杂逻辑。
  2. 开发完成后应阅读代码换位思考，查看自己的代码是否易懂。
  3. 实在做不到上一点，**请 写 更 多 注 释** (参考第2项最后1条)。

### [API设计规范](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html)

**在restful api规范中，应当围绕领域名词，采用不同的动作类型对相关领域所对应的数据做不同处理:**

- GET: 查询 例: GET api/users | GET api/user/13
- HEAD: 获取token验证等，无返回体 例: HEAD /token/csrf
- POST: 新增 例: POST api/user
- PUT: 编辑，**一般用于表单新增/修改或行编辑新增/修改** 例: PUT api/user/13
- PATCH: 更新字段数据，**一般用于表单二合一新增修改/行编辑状态修改/逻辑删除** 
  例: PATCH api/user/13/x | PATCH api/user/13/country/china
  [更多介绍](http://restcookbook.com/HTTP%20Methods/patch/#sthash.gYGM7j3Q.dpuf)
- DELETE: 物理删除 例: DELETE api/user/13 
  - 注意！DELETE虽然是幂等操作，但是只有一次。第二次访问应当返回404
  - 作为逻辑删除的PATCH方法则应当返回200或204
  
**注意:**

- 定义: 幂等(idempotent)操作 = 相同的Request多次执行的结果一致。该特性会影响是否可以重试(Retry)。
- 同义词: 变更
- 根据HTTP规范，GET / HEAD / PUT / DELETE 是幂等操作, 对应相同资源的操作与所请求操作的内容应当保持一致。
- POST / PATCH 都不是幂等操作，
  1. POST 再执行会继续新增一条资料 多次重试 = 多条记录
  1. PATCH 不保证幂等操作的可能性（大多数情况是幂等的）
    - 例如: 如果传递值为空，对于PUT，则应该清空字段数据。对于PATCH，则应该不执行操作。

### [GIT提交规范](http://www.ruanyifeng.com/blog/2016/01/commit_message_change_log.html)

1、不同的要分别分次提交，（这里不同指 如：不同的修改类型//优化还是新增etc.//，不同的模块，不同的功能等）；
2、提交的信息要进行一定程度的格式化。

- 具体规范:

头: `<type>(<scope>): <subject>`

- 类型: (**必须是以下几种之一**)
  1. feat(feature) - 功能(新开发模块，架构升级等)
  1. fix - 修复BUG等
  1. refactor - 重构，比如重命名方法，对象
  1. docs - 注释, 开发文档说明等
  1. style - 格式（不影响代码运行的变动, 如格式化）
  1. test - 测试(ut, e2e)
  1. chore - 杂项(构建过程或辅助工具修改)，比如改变日志显示颜色
- 范围: 如遇到全局修改，或者改了多个模块可以用`*`, **一般为当前开发的业务领域名词模块**, 架构级别的改动常会有其他。
- 标题: 以某个动词（行为）开始，比如修复/开发/重构, 50字符以内

中间: (不是必须)不要写太多，一般一行(<72字符)

- 如果需要，说明的回答包含以下内容:
  1. 为什么必须要提交这次修改
  1. 它如何解决了问题
  1. 有没有坑
  
注脚: (不是必须)

- 对应issue号
- 不兼容的时候，在这里要注明

** 简单例子: **

```text
  feat(user/login): 开发了用户登录功能
```

```text
  refactor(user/pwd): 重构密码校验逻辑
```

```text
  fix(user/settings): 修复用户设置表单无法正确提交的BUG
  本来用户信息是缓存在session storage里面的，现在用cookie
  Closes #15532
```

```text
  feat(util): 增加字符串处理工具类
```

- 特殊情况:
  1. revert: 如果当前 commit 用于撤销以前的 commit，则必须以 revert 开头，后面跟着被撤销 Commit 的 Header + 一些描述。
  1. merge: 如果当前 commit 用于合并代码后提交，则必须以 merge 开头，后面跟着需要合并 Commit 的 Header + 一些描述。

### DOM操作 - HTML/CSS/LESS:

- HTML/JSX: [标准](http://www.w3school.com.cn/html5/index.asp)
  基础语法：遵循HTML5语法规范，class属性写在最前面(ClassName -> JSX/TSX)
  DOM层级: 减少不必要的代码嵌套，提升性能。
  * 传统体系中(如开发插件等)，JS操作DOM对应的class应使用js-,is-,has-作为名称开头。

- CSS/LESS: [规范](http://codeguide.bootcss.com/)
  基础语法：遵循OOCSS命名规则。禁止ID选择器。
  1. 在UI层，如果可以使用css|class操作样式(无状态)，优先通过css而不是js来控制。
  1. 如果有多个分离的块元素在业务上拥有共同的一个的盒模型属性且数值相等，优先在公用样式中寻找，或采用变量提取。

- 类命名(OOCSS):
  `[领域名词]-[模块类型]-(元素) <修饰>`
    例如: 当前模块为订单支付(Pay)

```text
  └── pay-wrapper
    └── pay-list
      ├── pay-list-item
      ├── pay-list-item
      └── pay-list-item active
```

```html
  <a class="btn order-btn js-order-control">any link</a>
```

- Styled Component
  将有依赖关系的样式数值变量提取出来做成常量，图片路径和背景同理。
  ** 注意: **
    1. 各个组件的UI应当在各自范围内定义，整合子组件布局的UI应当在父组件内定义，子组件的样式应该避免与父组件耦合。
    2. 一些状态控制，如显示隐藏等推荐no-class编程方式通过props实现。布局与颜色可以在theme中找到，通过包导入尽量复用。
    3. 复杂建议尽量将复杂页面拆解成多个子组件，依次定义样式。不用担心冲突，因为SC会添加scope来约束。
    4. 获取Page组件最外层被Styled-Component做成带样式的元素应当在render方法之外，否则数据驱动会导致该方法多次执行，而页面布局基本上是固定的。
      **页面布局需要通过属性控制例外。如果出现通过属性控制组件状态的情况，应当从页面拆分当前组件样式，原因见第1,2条。**

### JS/React JSX/Redux

- [ES6规范](https://github.com/airbnb/javascript)
  
- 复杂的组件应当使用typescript index.d或者React propTypes定义入参类型。(暂无强制性要求，仅推荐)
  业务层: [超过3层的复杂组件与子组件调用应当Context API](https://techblog.toutiao.com/2018/10/22/untitled-54/)

- 函数命名规范: (TODO:项目时间紧张，后期有待补充)

- 文件/目录命名规范:

  - 与**类/组件**直接相关的**资源/领域**名称应该大写
  (js中index.js为目录的默认路由，因此如果目录对应的资源可以通过路由/引用访问，也应该大写)
  - 作为路由连接或分包用的目录名称应当小写，返回值当成函数使用的文件名称也应当小写。

- React && Redux:
  
  - 三种组件:
    1. StatelessComponent => 纯数据渲染或者布局用，本身无内部状态，或状态通过别的组件控制。
      (如:页面组件。使用Function初始化，返回ReactElement/JSX)
      注意！如果有dom操作(ref)，在这个组件是无效的，因为它没状态。
    2. PureComponent => 组件内的状态为浅层比较，默认update全部props且无复杂结构。
      有简单的声明周期。内部可能含有简单状态比如记录勾选或者区域显示。
      (查询列表数据，单复选，行编辑等。render返回ReactElement/JSX)
    3. Component => 组件内的状态复杂，不一定update全部props，内部包含一些状态，同时又对外部传入的属性有筛选。
      (模态窗，搜索等。render返回ReactElement/JSX) 推荐实现shouldUpdateComponent(nextprop, nextstate)来正确处理数据渲染
    ** 在有可能的情况下，尽量选择最简单的组件实现你的业务。 **
    ** 如果子组件需要更新父组件数据，推荐优先使用事件监听+调用action dispatch来处理。 **
  
  - Dom-Diff:
    浏览器的dom操作实际上是两颗不同的树叶子节点完全比较，除按树深度循环(1次循环)左树同层每一个dom需要根右树同层每一个dom比较(2次循环)最后更新。最差情况下算法为3次for循环，时间复杂度O(n^3)，
    React通过同层映射虚拟dom对象，将属性提取放置HashMap + 设置唯一key的策略 + 对修改的属性进行标记，每次渲染前遍历整个HashMap即可知道哪些dom被修改，最后仅更新变化真实浏览器dom对象变化的属性。最差情况下需要1次for循环，时间复杂度O(n^1)。
    根据上面的说明，为方便react建立映射关系，同层相同组件在list中需要指定key，不然编译会报错。
    在组件开发中尽量减少dom在树深度纵向移动，减少使用ref操作，保持稳定的DOM结构深度有助于性能的提升。
  
  - state层级尽量减少，因为redux每次检查的时候都会遍历一遍。太深级的树会影响性能，所以单个组件内的state尽量扁平化。
    注意原生js的解构是浅拷贝，深拷贝应当使用Ramda的clone函数(R.clone)。
  
  - 同理，每次redux的state发生变化的时候，都会调用react触发页面render，**因此尽量把复杂逻辑写在model层而非页面的render中**，事件监听应当使用变量引用。
    由于采用数据驱动 + 整页Diff渲染，因此JSX/TSX中禁止混合进行dom操作，**除了操作滚动条**。

### JSON/YML

- [规范](http://jsonapi.org.cn/format/)
  1. 空JSON需要内容为{}

---

## 测试规范

### 单元测试: TODO

### 集成测试: TODO

### 测试覆盖率: TODO

### 压力测试估算: TODO

---

## 备注

- 带星号(*)的选项为重要技术概念，需要重点掌握。
- NodeJs|Webpack等于项目构建相关技术开发这里不做详细讲解，大家如果不了解，有兴趣请自学。
- The End.
