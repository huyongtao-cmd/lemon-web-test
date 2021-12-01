/* eslint-disable no-undef */
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

// HTTP header中存在的请求交互码
const HEADER_CODE = {
  RST: 'el-result-code',
  XSRF: 'el-xsrf',
};

function parseResponse(response) {
  // eslint-disable-next-line
  // console.log('[RES]:', response);
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
 * 返回结果集
 */
const resultMaker = (response, content = {}) => ({
  status: response.status || 200,
  code: response.headers ? response.headers.get(HEADER_CODE.RST) : 0,
  response: content,
});

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
  // console.log(CROSS_URL, 'CROSS_URL');
  return (
    new Promise((resolve, reject) => {
      const fetchPromise = fetch(`${CROSS_URL}${url}`, options)
        // const fetchPromise = fetch(`http://localhost:3001/tw${url}`, options)
        .then(response => parseResponse(response).then(rst => resultMaker(response, rst)))
        .catch(e => {
          // 过滤后端错误返回信息
          const { response = {} } = e;
          const { status } = response;
          // eslint-disable-next-line
          // console.log('[EL-AJAX]: Failed to respond, reason ->', e);
          // createNotify.error({ title: 'misc.hint', content: '网络请求无响应。'});
          // 与过滤器一致
          return resultMaker({ headers: void 0, status: status || 400 }, response);
        })
        .then(resolve);
      // console.log(fetchPromise, 'fetchPromise');
      // fetchPromise.abort = abortPromise;
      // fetchPromise.reject = abortPromise; // 兼容一下
      return fetchPromise;
    })
      // 这个 catch 接受的就是 abortResultMaker 的 信息返回，即上面的 Promise.reject 之后的捕获，
      // 包装成和过滤器一致的结果返回即可
      .catch(e => e)
  );
}

// 真正使用的request 以后文件上传可能会分离开方便开发者调用
// (实际在 options 里面调整一下参数就 OK 了，但是PM要求不要大家自己写，所以就预留一下。)
const crossRequest = (url, options = {}) => httpRequest(url, options);

ALLOWED_ACCESS.forEach((method, index) => {
  crossRequest[method.toLowerCase()] = (url, options) =>
    httpRequest(url, {
      ...options,
      method,
    });
});

export { crossRequest };
