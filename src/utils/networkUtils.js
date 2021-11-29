import React from 'react';
import fetch from 'dva/fetch';
import { Icon, notification } from 'antd';
import hash from 'hash.js';
import { formatMessage } from 'umi/locale';
import { equals, isNil, append, dropWhile, map, type } from 'ramda';

import { createConfirm, createAlert } from '@/components/core/Confirm';
import { createNotify } from '@/components/core/Notify';
import { toQs } from '@/utils/stringUtils';
// import * as R from 'Ramda';
import api from '@/api';
import ErrorHandler from './ErrorHandler';

// ----------------------------------------------------------------
// T0D0: 该工具类应该移入components中或需要解绑，因为内部工具方法包含强上下文依赖关系。
// ----------------------------------------------------------------

/* eslint-disable no-underscore-dangle */

// @HACK 01
// 服务器地址 = 从配置文件利用WP plugin当成全局变量注入
// <strong text="red">注意！！！前方高能预警！！！</strong>
// to developer: 巨坑来了。对于热部署, 这个变量有缓存。
// 在HMR环境中，当你修改配置环境设置的时候，必须要对这个文件进行修改(比如随便加一个空格保存，之后删掉)，
// 等热部署生效，该api才能切换。
/* global SERVER_URL */
// eslint-disable-next-line
let serverUrl;
const clientUrl = 'http://' + window.location.host;
try {
  serverUrl = SERVER_URL;
} catch (error) {
  serverUrl = clientUrl;
}
// console.log('serverUrl', serverUrl);
// @HACK 02 - 一般情况下请勿使用该操作
// 这个地方也有巨坑。以前鹏驰项目用dva也遇到过这个问题。如果你想要dispatch什么东西，又不在页面组件的路由体系的，你可以这么玩。
// 其它的dispatch也是调用的这个，但是dva的react-router-redux体系架构封装了。其实这仅仅只是一个代码质量问题，但是这里的实现太粗暴了。
// 这个文件因为是工具类，所以这算是无奈之举。不过唯一可能出BUG的情况是当前项目有两套redux，还都得用dva默认配置，或者被恶意破坏。
// 不管怎么说，开发请connect后在自己的page组件之中从store中解构获取dispatch
// （从某种角度，是可以优化的，不过暂时没有时间深入研究，所以先这样了。）
/* eslint-disable no-underscore-dangle */
const dangerousDispatch = settings => window.g_app._store.dispatch(settings);

const dangerousGetState = () => window.g_app._store.getState();

// @HACK 03 - ultimate hack to shutdown the entire framework.
// WARNING: 不要在任何情况调用这个方法！除非你需要切换单页应用体系的Layout视图。
let _dialogCount = 0;
const checkIfDisableDialog = () => {
  if (_dialogCount > 0) {
    // @SuppressWarnings
    throw new Error('Unauthorized network connection.');
    // window.g_app._store = void 0;
  } else {
    _dialogCount || (_dialogCount += 1);
  }
};

// HTTP 允许的请求
const ALLOWED_ACCESS = ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const XSRF_TOKEN = 'token_xsrf';

// HTTP header中存在的请求交互码
const HEADER_CODE = {
  RST: 'el-result-code',
  XSRF: 'el-xsrf',
};

// HTTP 请求返回响应码 TODO: 国际化。
const HTTP_CODE = {
  0: '网络连接无响应，请联系管理员。',
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '状态操作成功。',
  400: '[400]请求参数错误，请检查表单必填项。',
  401: '[401]用户没有权限（令牌、用户名、密码错误）。',
  403: '[403]用户得到授权但禁止访问, 请联系管理员。',
  404: '[404]所请求的资源不存在。',
  406: '[406]请求的资源格式不合法, 禁止访问。',
  410: '[410]请求的资源被永久删除, 请联系管理员。',
  413: '[413]上传的文件不能超过指定大小',
  422: '[422]创建请求对象时发生验证错误。',
  500: '[500]服务器发生错误，请联系管理员。',
  502: '[502]网关错误, 请检查网络代理。',
  503: '[503]服务不可用，服务器暂时过载或维护。',
  504: '[504]网关超时。',
};

// @deprecated
// 过滤穿透表单体JSON转化封装的请求路径
// https://tools.ietf.org/html/rfc2616#section-10.2.5
const filteredApiList = [
  api.basic.xsrf,
  api.basic.captcha,
  api.basic.login,
  api.basic.logout,
  api.basic.sfsX,
];

// 设置是否处于 permission 严重的状态，如果处于验证状态，则不增加后续弹窗，取消正在发送的请求，阻断后续新发起的请求
let hasDialog;
/**
 * 用来存放正在请求的对象
 *
 * 工作模式：
 *
 * 1. 请求的时候， 添加到列表
 * 2-1. 返回数据的时候，从列表去除
 * 2-2. 401 无权限 -> 通过列表来控制请求的取消
 */
let RequestList = [];
const cancelAllRequestInProc = () => {
  map(({ abort }) => abort(), RequestList);
  RequestList = [];
};
const clearRequestListByConfig = config => {
  const { url, method } = config;
  RequestList = dropWhile(token => equals(token.identifier, `${url}-${method}`), RequestList);
};
const appendToRequestList = (config, abort) => {
  const { url, method } = config;
  RequestList = append({ abort, identifier: `${url}-${method}` }, RequestList);
};
// 存储 用户记住密码后的 口令，用于静默登录已经验证后端是否 session 失效
const getAuthToken = () => {
  const token = localStorage.getItem('token_auth');
  if (type(token) === 'String') return token;
  return undefined;
};
const setAuthToken = token => localStorage.setItem('token_auth', token);
const clearAuthToken = () => localStorage.removeItem('token_auth');

// 401 确定之后，统一的返回封装
const permissionError = (errorText, response = {}) => {
  const error = new Error(errorText);
  error.response = response;
  throw error;
};

// 获取anti-CSRF令牌
const getCsrfToken = () => sessionStorage.getItem(XSRF_TOKEN);

// http返回码状态检查 - 400以上错误在这里拦截
// eslint-disable-next-line
const checkStatus = (response, requestCfg, newOptions) => {
  clearRequestListByConfig(requestCfg);
  if (response.status >= 200 && response.status < 300) {
    // eslint-disable-next-line
    // console.log('[EL-AJAX]: response success!');
    return response;
  }
  // eslint-disable-next-line
  console.log('[EL-AJAX]: response failed!');
  const errorText = HTTP_CODE[response.status] || response.statusText;
  if (response.status === 401 && isNil(hasDialog)) {
    // 需要 checkPermission 的时候，说明已经有至少一个 401 存在了，要取消其他正在执行的请求（此时他们都属于无效请求了）
    cancelAllRequestInProc();
    const authToken = getAuthToken();
    hasDialog = true;
    // 为鉴权开的后门，鉴权的调用不会直接打回到登录页，页面内的401，就直接踢回去了
    if (!requestCfg.forceContinue) {
      setTimeout(() => {
        hasDialog = undefined;
        dangerousDispatch({
          type: 'login/relogin', // 确定 = 登录
        });
      }, 0);
    }
    permissionError(errorText, response);
  } else if (response.status === 403) {
    createConfirm({
      i18n: 'app.alert.error.403',
      content: '您没有权限访问该内容',
      iconType: 'close-circle',
      onOk: () =>
        dangerousDispatch({
          type: 'login/logout', // 注意哦 这里不太一样哦～ 没权限可能意味着需要用另一个用户登录，所以当前用户必须注销。
        }),
    });
    permissionError(errorText, response);
  } else if (response.status === 400) {
    // 剩下的提示走过滤器
    // 这里的改动是为了塞进去icon，UI设计要求这里改图标，包括上面的createConfirm好像也可以搞一搞，只有iconType不够用。。。
    response
      .json()
      .then(data => {
        // stackTrace
        notification.warning({
          message: '检查失败',
          // duration: null,
          description: React.createElement(ErrorHandler, {
            stackTrace: data.stackTrace,
            msg: data.msg,
            type: 'warning',
          }),
        });
      })
      .catch(data => {
        // stackTrace
        notification.warning({
          message: '系统出错',
        });
      });
  }
  // 剩下的提示走过滤器
  else if (response.status === 500) {
    response.json().then(data => {
      // stackTrace
      notification.error({
        message: '系统出错',
        // duration: null,
        description: React.createElement(ErrorHandler, {
          stackTrace: data.stackTrace,
          msg: data.msg,
          type: 'error',
        }),
      });

      // router.push('/err/404');
      // permissionError(errorText, response);
    });
  } else if (response.status >= 404 && response.status <= 504) {
    // 这里的改动是为了塞进去icon，UI设计要求这里改图标，包括上面的createConfirm好像也可以搞一搞，只有iconType不够用。。。
    createNotify.error({
      content: formatMessage(
        {
          id: 'app.alert.error.generic',
          defaultMessage: 'Prompt:',
        },
        { reason: `${response.status}: ${response.url}` }
      ),
      description: errorText,
      icon: React.createElement('Icon', {
        type: 'close-circle',
        theme: 'filled',
        className: 'text-error',
      }),
    });
    // router.push('/err/404');
    permissionError(errorText, response);
  } else permissionError(errorText, response);
};

// http请求缓存
// WARN: 实验功能，节约网络开销用，后期可以通过url参数开关控制切换
const storeCache = (response, hashcode) => {
  /**
   * Clone a response data and store it in sessionStorage
   * Does not support data other than json, Cache only json
   * 文件上传请不要使用cache
   */
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.match(/application\/json/i)) {
    // All data is saved as text
    response
      .clone()
      .text()
      .then(content => {
        sessionStorage.setItem(hashcode, content);
        sessionStorage.setItem(`${hashcode}:timestamp`, Date.now().toString());
      });
  }
  return response;
};

/**
 * 返回结果集
 */
const resultMaker = (response, content = {}) => ({
  status: response.status || 200,
  code: response.headers ? response.headers.get(HEADER_CODE.RST) : 0,
  response: content,
});

const abortResultMaker = () => {
  // 取消 可以理解为正常请求返回结果为空的情况。
  // 即：每个人的业务代码足够健壮的话，status === 100 (Continue) 可以让他们走常规逻辑，其结果还是初始化的状态
  // 100 状态码 代表 Continue ， 说明请求可以继续，因为这是 401， 这边主动取消的
  // eg.
  // initial state: { reduxList: [] }
  // generator resp -> update state -> reduxList = Array.isArray((resp || {}).datum) ? (resp || {}).datum : [];
  const status = 100;
  // 手动设置 code: 'cancel' -> 项目代码大部分被 returnModel 包裹，但是也有非包裹的情况，此时可结合 header -> code 来决定对 response 的取舍
  return resultMaker({ headers: { get: () => 'cancel' }, status });
};

/**
 * 用新的指纹生成摘要，便于缓存比较(url参数可能相同)
 */
const hashMaker = (url, content) => {
  const fingerprint = url + (content ? JSON.stringify(content) : '');
  return hash
    .sha256()
    .update(fingerprint)
    .digest('hex');
};

/**
 * fetch请求头部构造器
 */
const makeRequestHeaderOpts = options => {
  // xsrf
  const TOKEN_XSRF = getCsrfToken();
  // eslint-disable-next-line
  // console.log('[EL-AJAX]: Preparing for a request. xsrf token ->', TOKEN_XSRF);

  const defaultOptions = {
    credentials: 'include', // 'same-origin' // 同源策略。注意！！这个跟着后端配置走。
    // credentials: 'same-origin', // 同源策略。注意！！这个跟着后端配置走。
  };

  // 合并控制项
  const newOptions = {
    ...defaultOptions,
    method: 'GET',
    headers: Object.create(null),
    ...options,
  };

  TOKEN_XSRF &&
    (newOptions.headers = {
      [HEADER_CODE.XSRF]: TOKEN_XSRF,
      ...newOptions.headers,
    });

  // methods using json as default request body
  // (暂时没有预留其他情况的设置)
  if (['POST', 'PUT', 'PATCH', 'DELETE'].some(method => method === newOptions.method)) {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
      newOptions.body = JSON.stringify(newOptions.body);
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
      };
    }
  } else if (newOptions.method === 'HEAD') {
    // nothing to do...
  }

  return newOptions;
};

// 缓存控制 - 如果有设置缓存，就跳过后端直接拉缓存
// 注意！response 的 code 暂无缓存 文件上传下载一定不要缓存!!
// (大多数情况该缓存仅用来缓存udc类数据，因此无复杂逻辑，数据结构复杂会带来存储不方便所以没做code缓存)
const retrieveCache = (expirys, hashcode) => {
  const cached = sessionStorage.getItem(hashcode);
  const whenCached = sessionStorage.getItem(`${hashcode}:timestamp`);
  if (cached !== null && whenCached !== null) {
    const age = (Date.now() - whenCached) / 1000;
    if (expirys === -1 || age < expirys) {
      const response = new Response(new Blob([cached]));
      // 返回值系列
      return parseResponse(response).then(rst => resultMaker(response, rst)); // eslint-disable-line
    }
    sessionStorage.removeItem(hashcode);
    sessionStorage.removeItem(`${hashcode}:timestamp`);
  }
  return void 0;
};

function parseResponse(response) {
  // eslint-disable-next-line
  console.log('[RES]:', response);
  const contentType = response.headers.get('content-type') || '';

  let respType = 'text';
  if (
    // Improved by Neo's advice.
    contentType.startsWith('application/json') &&
    // filteredApiList.some(item => item === url.split('?')[0])
    response.status !== 204
  ) {
    respType = 'json';
  }
  // TODO: else -> 文件下载
  // response.blob()
  return response[respType]();
}

/**
 * Requests a URL, returning a promise.
 * 超级无敌综合http请求整合方法。
 * (额，其实antd pro的人跟我想的也差不多。虽然根现在的个人编程观念感觉有点不符合，
 * 但是接受之后，感觉对业务开发来说，倒真的是挺方便，所以暂时就不改了。)
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
function httpRequest(
  url,
  options = {
    mock: 0, // 模拟数据可用(true = 开, false = 关)
    expirys: 0, // 请求缓存控制(true = 开, false = 关, 数字 = 缓存时间)
  }
) {
  const forceContinue = !!options.force;
  if (!isNil(hasDialog) && !forceContinue) return Promise.resolve(abortResultMaker());
  // 构造请求头数据
  const newOptions = makeRequestHeaderOpts(options);

  // 真香警告: 实验性缓存控制 - 不请求就是最好的缓存(hmmmm)
  // 这个操作的潜在瓶颈是sha256算法生成摘要的执行速度，据我所知，对于url这种短长度的字符串还是挺快的。。
  let hashcode = '';
  // when options.expirys !== false, return the cache,
  const { expirys } = options; // || 60;
  if (expirys) {
    // eslint-disable-next-line
    console.log('[EL-AJAX]: Expirys detected, dur =', expirys, '. Caching procedure activated.');
    hashcode = hashMaker(url, options.body);
    const cache = retrieveCache(expirys, hashcode);
    if (cache) {
      // time to return cached data.
      return Promise.resolve(cache);
    }
  }
  // initiation - fetch api does NOT process incomplete url
  // (dva actually resolved this, but here we practice it as original)
  const requestUrl = [options.mock ? clientUrl : serverUrl, url].join('');
  // eslint-disable-next-line
  console.log(`[REQ]${options.mock ? '[mock]' : ''}[${newOptions.method}]: ${url}`);
  const requestCfg = {
    url: requestUrl,
    method: newOptions.method,
    forceContinue: !!options.force,
  };

  // Isomorphic fetch to es6 fetch api
  // 原生的 fetch 首先需要 new 一个 Request 对象，填写信息之后放置于第一个参数。
  // 这里dva封装了上一步+URL不需要全路径，本质上除此之外完全相同。

  /**
   * 这里用 promise 包了一层，是为了给 fetch 增加一个可以撤销的操作
   */
  return (
    new Promise((resolve, reject) => {
      const abortPromise = () => reject(abortResultMaker());
      appendToRequestList(requestCfg, abortPromise);
      const fetchPromise = fetch(requestUrl, newOptions)
        .then(response => checkStatus(response, requestCfg, newOptions))
        .then(response => (expirys ? storeCache(response, hashcode) : response))
        // Technically, we call this flat-mapping.
        .then(response => parseResponse(response).then(rst => resultMaker(response, rst)))
        .catch(e => {
          // 过滤后端错误返回信息
          const { response = {} } = e;
          const { status } = response;
          // eslint-disable-next-line
          console.log('[EL-AJAX]: Failed to respond, reason ->', e);
          // createNotify.error({ title: 'misc.hint', content: '网络请求无响应。'});
          // 与过滤器一致
          return resultMaker({ headers: void 0, status: status || 400 }, response);
        })
        .then(resolve);
      fetchPromise.abort = abortPromise;
      fetchPromise.reject = abortPromise; // 兼容一下
      return fetchPromise;
    })
      // 这个 catch 接受的就是 abortResultMaker 的 信息返回，即上面的 Promise.reject 之后的捕获，
      // 包装成和过滤器一致的结果返回即可
      .catch(e => e)
  );
}

// 真正使用的request 以后文件上传可能会分离开方便开发者调用
// (实际在 options 里面调整一下参数就 OK 了，但是PM要求不要大家自己写，所以就预留一下。)
const request = (url, options) => httpRequest(url, options);

ALLOWED_ACCESS.forEach((method, index) => {
  request[method.toLowerCase()] = (url, options) =>
    httpRequest(url, {
      ...options,
      method,
    });
});

export {
  serverUrl,
  clientUrl,
  getCsrfToken,
  dangerousDispatch,
  dangerousGetState,
  request,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
};
