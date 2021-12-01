// https://umijs.org/config/
import os from 'os';
import env from './env.config';
import webpackplugin from './plugin.config';
import pageRoutes from './router.config';
import theme from './theme.config';
// layout
import defaultSettings from '../src/defaultSettings';

// 系统工程配置文件(umi -> webpack) - 执行启动命令umi会读取此文件的配置进行工程构件。
export default {
  hash: true,
  // add for transfer to umi
  plugins: [
    [
      'umi-plugin-react',
      {
        antd: true, // umi对antd的依赖项有一些特殊处理，不用的话可以去掉。
        dva: {
          hmr: true, // 热部署
        },
        locale: {
          enable: true, // default false
          default: 'zh-CN', // default zh-CN
          baseNavigator: false, // default true, when it is true, will use `navigator.language` overwrite default
        },
        dynamicImport: {
          // 这个会与dva的路由整合 不用dva的话也可以去掉
          loadingComponent: './components/core/PageLoading/index',
        },
        // polyfills: ['ie11'], // es6兼容 @deprecated
        ...(!process.env.TEST && os.platform() === 'darwin'
          ? {
              // webpack运行时的一些系统兼容性问题处理
              dll: {
                include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
                exclude: ['@babel/runtime'],
              },
              hardSource: false,
            }
          : {}),
      },
    ],
  ],
  devServer: {
    proxy: {
      '/tw': {
        target: env.proxyTargetHost,
        changeOrigin: true,
        // pathRewrite: { "^/tw" : "/tw" }
      },
    },
    port: 3003,
  },
  define: {
    // 工程内部全局变量 - 请勿随意自行添加
    APP_TYPE: process.env.APP_TYPE || '',
    SERVER_URL: env.serverHost,
    CROSS_URL: env.crossUrl,
  },
  // polyfill - BRAND SPANKING NEW
  targets: {
    chrome: 49,
    firefox: 45,
    safari: 10,
    edge: 13,
    ie: 11,
  },
  // 路由配置 - dva使用部分的配置与菜单组件共享(目前是这样的，愿意的话分出来也是可以的)
  // 当使用dva的时候 umi会自动生产dva的router文件，并托管启动生命周期（虽然我脚的这块设计的有点重，不过方便是挺方便的，anyway）
  // 如果你不使用dva(比如rematch之类的)，这里可以不用配，其他框架的配置使用umi提供的webpack配置切入实现。
  routes: pageRoutes,
  // 默认覆盖antd的主题变量 - 不使用antd也可以去掉。
  theme: {
    // @deprecated 新版的antd默认本地图标已经不需要设置这个属性了。
    'icon-url': defaultSettings.iconUrl,
    ...theme,
  },
  externals: {
    // 数据可视化 - 暂时去除，有报表需求再开放（ejs里面也要改）
    '@antv/data-set': 'DataSet',
  },
  alias: {
    // 'handlebars': 'handlebars/dist/handlebars.min.js',
    'handlebars/runtime': 'handlebars/dist/handlebars.runtime.min.js',
  },
  // Umi对momentJs的处理(一大堆引用的包占很大体积，这里去掉)
  // antd对moment是强依赖的，有的组件缺失moment会导致无法使用。使用antd就一定要引入moment.js(package.json)。
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    // less-to-js
    javascriptEnabled: true,
  },
  // css模块名称scope处理
  // 注意，windows环境本地开发服务因为路径符号问题会导致显示不了预期效果，暂时没有做修复判断
  // 虽然不影响程序运行，但是最好尽量在linux/OSX环境打包。
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (context, localIdentName, localName) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }
      const match = context.resourcePath.match(/src(.*)/);
      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = antdProPath
          .split('/')
          .map(a => a.replace(/([A-Z])/g, '-$1'))
          .map(a => a.toLowerCase());
        return `${env.nameSpace}${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }
      return localName;
    },
  },
  cssnano: {
    mergeRules: false,
  },
  urlLoaderExcludes: [/\.hbs$/],
  // 其他umi没有覆盖的webpack插件
  chainWebpack: webpackplugin,
  // PWA - future plan
  manifest: {
    name: 'telework',
    background_color: '#FFF',
    description: 'telework - 埃林哲旗下管理平台',
    display: 'standalone',
    start_url: '/index.html',
    icons: [
      {
        src: '/favicon.png',
        sizes: '48x48',
        type: 'image/png',
      },
    ],
  },
};
