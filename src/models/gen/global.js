import {
  changeLang,
  fetchCsrf,
  queryAuthMenu,
  queryTenantAuthMenu,
  queryNotices,
  queryUdc,
  getELeaningLink,
  getReportChartLink,
  queryHomeConfig,
  queryLogoAndExtension,
  queryBuList,
} from '@/services/gen/app';
import { systemLocalePortal, systemRemindPortal } from '@/services/production/system';
import { selectUsersWithBu } from '@/services/gen/list';
import { getMeta } from '@/utils/envUtils';
import { keepParentBehavior, plainToTree, sortPropAscByNumber } from '@/utils/dataUtils';
import { markAsTab } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';

const structureTransfer = {
  id: 'code',
  pid: 'pcode',
  children: 'children',
  selected: 'checked',
};

/**
 * 系统单页框架核心控制模块
 */
export default {
  namespace: 'global',

  state: {
    collapsed: false,
    showHelp: false,
    notices: [],
    notifyCount: 0,
    tabData: [], // 选项卡路径  !! focus -> 首页要求常驻
    meta: void 0, // root path 在此处指定默认meta
    authRoutes: [], // requested auth-permission routes
    tenantAuthRoutes: [], // requested auth-permission routes
    homeConfigData: [], // 首页配置数据
    homepage: '/user/home', // 首页
    logoInfo: {}, // logo 数据
    extensionInfo: [], // 右上角扩展菜单数据
    buList: [], // 激活和已关闭BU全部数据
    panes: [],
    activePane: '',
    prevClosePane: '',
    prevCloseIndex: -1,
    userList: [], // 资源下拉
    locale: {}, // 前端国际化信息
    remind: {}, // 前端国际化信息
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
  },

  effects: {
    /**
     * 核心代码: 整个多Tab刷新机制控制的奥秘就在这
     * 不采用传统设计的原因一言难尽，我知道可能不太容易理解。因为注释不能写的太多，所以就高度压缩阐述一下。
     * 在深度的数据驱动体系下(Redux)，如果我们能完全用state中的数据驱动页面，那么在html中增加新页面dom片段与利用数据切换页面dom片段是图灵等价的。
     * 因为任意的dom事件对于系统的开销最差时间是O(n^3)的(两颗等价树比较叶子结点)，即使是React，对于传统dom的事件监听也会收到这个机制的限制。
     * 所以document树广度与深度的增加都会使系统交互性能变差，现代的系统越来越少的采用单页多Tab设计(特别是多平台应用)，而是利用浏览器自带的多页达到最佳。
     * 最后，从解决问题的角度来说，如果多Tab的刷新控制有问题，你可以在这里修改。嗯。。
     * TODO: 这里暂时有BUG！请勿参考，虽然有应对措施，不过要找一下router中的切入点，所以暂时预留一下后期开发。
     * @param payload
     * @param select
     * @param put
     * @return {IterableIterator<*>}
     */ *pushTab({ payload }, { select, put }) {
      const { tabData } = yield select(({ global }) => global);
      const { pathname } = payload;
      // console.log('tabData, pathname ->', tabData, pathname);
      // TODO: 优化点: 当url超过一定长度之后 使用hash后的摘要可能性能会更好。
      // js的字符串比较算法不太熟悉(底层转码异或的话速度还是很快的)，这块还是要研究一下。
      if (
        !tabData
          .map(path => {
            // 切换tab时，对存在于tab的模块打上标记不让刷新。(这个当前多Tab需求的默认行为)
            if (markAsTab(path) === pathname) {
              return pathname;
            }
            return path;
          })
          .some(path => path === pathname)
      ) {
        // TODO: 这里有待优化
        const result = tabData.filter(path => path.split('?')[0] !== pathname.split('?')[0]);
        result.push(pathname);
        yield put({
          type: 'updateState',
          payload: { tabData: result },
        });
      }
    },

    /**
     * 移除Tab
     * @param payload
     * @param select
     * @param put
     * @return {IterableIterator<*>}
     */ *removeTab({ payload }, { select, put }) {
      const { tabData } = yield select(({ global }) => global);
      const { pathname } = payload;
      // eslint-disable-next-line
      console.log(
        'tabData (for remove), pathname ->',
        tabData,
        pathname,
        tabData.filter(path => path !== pathname)
      );
      yield put({
        type: 'updateState',
        payload: { tabData: tabData.filter(path => path !== pathname) },
      });
    },

    *removePane({ payload }, { select, put }) {
      const { panes } = yield select(({ global }) => global);
      const { paneKey } = payload;
      const indexTemp = paneKey.indexOf('?');
      const key = indexTemp < 0 ? paneKey : paneKey.substring(0, indexTemp);
      const index = panes.findIndex(pane => pane.key === key);

      panes.splice(index, 1);

      yield put({
        type: 'updateState',
        payload: {
          panes: [...panes],
          activePane: undefined,
          prevClosePane: paneKey,
          prevCloseIndex: index,
        },
      });
    },

    /**
     * 获取csrf token
     * @param _
     * @param call
     * @param put
     * @return {IterableIterator<*>}
     */ *fetchCsrf(_, { call, put }) {
      const { code } = yield call(fetchCsrf);
      sessionStorage.setItem('token_xsrf', code);
    },

    /**
     * 切换多语言
     * @param payload
     * @param call
     * @return {IterableIterator<*>}
     */ *changeLang({ payload }, { call }) {
      const { code = '' } = yield call(changeLang, payload);
      return 'ok'.toUpperCase() === code.toUpperCase();
    },

    /**
     * 切换系统帮助信息
     * @param _
     * @param select
     * @param put
     * @return {IterableIterator<*>}
     */ *changeHelpDisplay(_, { select, put }) {
      const { showHelp } = yield select(({ global }) => global);
      showHelp
        ? console.log('[EL-HELP]: help mode deactivated') // eslint-disable-line
        : console.log('[EL-HELP]: help mode activated'); // eslint-disable-line
      yield put({
        type: 'updateState',
        payload: { showHelp: !showHelp },
      });
    },

    /**
     * 获取 E-Learning 链接
     * @param _
     * @param call
     */
    *getELearningLink({ payload }, { call }) {
      const { status, response } = yield call(getELeaningLink);
      if (status === 200) {
        response.ok === false &&
          !payload &&
          createMessage({ type: 'warn', description: response.datum });
        return response.ok ? response.datum || undefined : undefined;
      }
      return undefined;
    },

    /**
     * 获取 报表 链接
     * @param _
     * @param call
     */
    *getReportChartLink({ payload }, { call }) {
      const { status, response } = yield call(getReportChartLink);
      if (status === 200) {
        return response.ok ? response.datum.reportUrl || undefined : undefined;
      }
      return undefined;
    },

    /**
     * 获取系统消息
     * @param _
     * @param call
     * @param put
     * @return {IterableIterator<*>}
     */ *fetchNotices(_, { call, put }) {
      const { response } = yield call(queryNotices);
      // console.log('fetchNotices ->', response);
      yield put({
        type: 'saveNotices',
        payload: Array.isArray(response) ? response : [],
      });
      /* TODO: 不能直接用Array.length 因为拉出来的数据不一定是所有消息 */
      yield put({
        type: 'updateState',
        payload: {
          notifyCount: response.length,
        },
      });
    },

    /**
     * 清除消息
     * @param payload
     * @param put
     * @param select
     * @return {IterableIterator<*>}
     */ *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count = yield select(state => state.global.notices.length);
      yield put({
        type: 'user/updateState',
        payload: {
          notifyCount: count,
        },
      });
    },

    /**
     * 查询系统UDC
     * @param payload
     * @param call
     * @return {IterableIterator<*>}
     */ *queryUdc({ payload }, { call }) {
      const { response } = yield call(queryUdc, payload);
      return response;
    },

    /**
     * 查询当前用户角色允许的navs权限
     * @param { payload } _ there is no need for me to use payload
     * @param { call, put } Object
     */
    *queryTenantAuthMenus(_, { call, put }) {
      const { response, status } = yield call(queryTenantAuthMenu);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            tenantAuthRoutes: Array.isArray(response) ? response : [],
          },
        });
      }
    },

    /**
     * 查询当前用户角色允许的navs权限
     * @param { payload } _ there is no need for me to use payload
     * @param { call, put } Object
     */ *queryAuthMenus(_, { call, put }) {
      const { response, status } = yield call(queryAuthMenu);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            authRoutes: Array.isArray(response) ? response : [],
          },
        });
      }
    },

    /**
     * 查询首页配置（快捷菜单 个人首页）
     * @param { payload } _ there is no need for me to use payload
     * @param { call, put } Object
     */ *querySysHomeConfig(_, { call, put, select }) {
      const { tabData } = yield select(({ global }) => global);
      const { response, status } = yield call(queryHomeConfig);
      if (status === 200) {
        const { datum = [] } = response;
        const defaultHomePage = datum.find(item => item.wbStatus === 'YES');
        let homepage = '/user/home';
        const newTabData = Object.assign([], tabData);
        if (defaultHomePage) {
          homepage = defaultHomePage.wbLink;
          let haveWbLink = false;
          for (let i = 0; i < tabData.length; i += 1) {
            if (tabData[i].includes(defaultHomePage.wbLink)) {
              haveWbLink = true;
            }
          }
          if (!haveWbLink) {
            newTabData.unshift(defaultHomePage.wbLink);
          }
        }

        yield put({
          type: 'updateState',
          payload: {
            homeConfigData: Array.isArray(datum) ? datum : [],
            tabData: newTabData,
            homepage,
          },
        });
      }
    },

    /**
     * 查询 Logo 和 右上角辅助菜单配置
     * @param { payload } _ there is no need for me to use payload
     * @param { call, put } Object
     */ *querySysLogoAndExtension(_, { call, put, select }) {
      const { tabData } = yield select(({ global }) => global);
      const { response, status } = yield call(queryLogoAndExtension);
      if (status === 200) {
        const { datum = {} } = response;
        const logoInfo = datum.logWorkView || {};
        const extensionInfo = datum.workMenuViewList || [];
        yield put({
          type: 'updateState',
          payload: {
            logoInfo,
            extensionInfo,
          },
        });
      }
    },

    /**
     * 查询一些共用数据 很多页面都会用到的数据
     * @param { payload }
     * @param { call, put } Object
     */ *queryCommonData(_, { call, put, select }) {
      const { response = [], status } = yield call(queryBuList);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            buList: response || [],
          },
        });
      }
      const { response: res, status: sts } = yield call(selectUsersWithBu);
      if (sts === 200) {
        yield put({
          type: 'updateState',
          payload: {
            userList: Array.isArray(res) ? res : [],
          },
        });
      }
    },

    *getPortalLocale(_, { call, put, select }) {
      // console.log('获取国际化信息...');
      const { response } = yield call(systemLocalePortal);
      yield put({
        type: 'updateState',
        payload: {
          locale: response.data,
        },
      });
    },

    *getPortalRemind(_, { call, put, select }) {
      const { response } = yield call(systemRemindPortal);
      const list = response.data;
      const remind = {};
      list.forEach(item => {
        remind[`${item.remindCode}`] = item.remindContent;
      });
      yield put({
        type: 'updateState',
        payload: {
          remind,
        },
      });
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        // google analytics - 如果使用GA单页应用需要主动更新路径告知GA用户使用情况
        // 这句代码先留着，因为以后用腾讯的那个破玩意也是这种套路，反正对当前功能没什么影响
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }

        const metaNameSpace = getMeta(pathname); // 字符串总是从跟路径开始的，所以找紧挨着的一个
        // eslint-disable-next-line
        // console.log(
        //   '[EL-MENU]: meta path ->',
        //   metaNameSpace || 'not found.',
        //   'history ->',
        //   history
        // );

        // TODO: 这个地方实际上是为了解决系统加载时的一个BUG，以后可以优化。
        // TODO: 上来直接访问的刷新应该在这里把 _refresh 去掉。
        if (metaNameSpace) {
          dispatch({
            type: 'updateState',
            payload: { meta: metaNameSpace },
          });

          // 多Tab数据启动 - 初始页
          dispatch({
            type: 'pushTab',
            payload: { pathname: pathname + search },
          });
        }
      });
    },
  },
};
