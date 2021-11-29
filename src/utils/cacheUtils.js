/* eslint-disable */
// ----------------------------------------------------------------
// 前端存储工具类 - 负责处理前端session,local与indexDB交互。
// ----------------------------------------------------------------
// import * as R from 'ramda'

/**
 * getSessionData
 * @param key - 数据的键
 * @returns {Object}
 */
const getSessionData = key => {
  // EL.CTXT.pageData[key];
  try {
    return key
      ? window.JSON.parse(window.sessionStorage.getItem(key) || 'null')
      : window.sessionStorage;
  } catch (e) {
    return {};
  }
};

/**
 * setSessionData
 * @param key - 数据的键
 * @param map - 需要储存的数据
 * @returns {Object}
 */
const setSessionData = (key, map) => {
  /*if(window.sessionStorage.getItem(key)){
   window.sessionStorage.clear(key);
   }*/
  window.sessionStorage.setItem(key, window.JSON.stringify(map));
  return map;
};

/**
 * delSessionData
 * @param key - 数据的键
 * @returns {void}
 */
const delSessionData = key => {
  if (key) {
    window.sessionStorage.removeItem(key);
  } else {
    window.sessionStorage.clear();
  }
};

/**
 * getLocalData
 * @param key - 数据的键
 * @returns {Object}
 */
const getLocalData = key => {
  // EL.CTXT.pageData[key];
  try {
    return key ? window.JSON.parse(window.localStorage.getItem(key) || '{}') : window.localStorage;
  } catch (e) {
    return {};
  }
};

/**
 * setLocalData
 * @param key - 数据的键
 * @param map - 需要储存的数据
 * @returns {Object}
 */
const setLocalData = (key, map) => {
  /*if(window.sessionStorage.getItem(key)){
   window.sessionStorage.clear(key);
   }*/
  window.localStorage.setItem(key, window.JSON.stringify(map));
  return map;
};

/**
 * delLocalData
 * @param key - 数据的键
 * @returns {void}
 */
const delLocalData = key => {
  if (key) {
    window.sessionStorage.removeItem(key);
  } else {
    window.localStorage.clear();
  }
};

export default {
  getSessionData,
  setSessionData,
  delSessionData,
  getLocalData,
  setLocalData,
  delLocalData,
};
