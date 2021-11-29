/* eslint-disable */
// ----------------------------------------------------------------
// 前端环境工具类 - 解决兼容性问题
// ----------------------------------------------------------------
// import * as R from 'ramda'

// 检查浏览器
const checkBrowser = () => {
  if (!+[1]) {
    // 世界上最短的判断ie8及以下浏览器代码
    // alert('火狐好，请使用火狐。'); - just kidding.
    return 'ie8';
  } else {
    var explorer = window.navigator.userAgent;
    return (
      (explorer.indexOf('Trident') > 0 && 'ie11') ||
      (explorer.indexOf('Firefox') > 0 && 'Firefox') ||
      (explorer.indexOf('Chrome') > 0 && 'Chrome') ||
      (explorer.indexOf('Opera') > 0 && 'Opera') ||
      (explorer.indexOf('Safari') > 0 && 'Safari') ||
      ''
    );
  }
};

// 检查浏览器是否支持本地Local缓存。
const hasLocalStorageSupport = () => {
  return 'localStorage' in window && window['localStorage'] !== null;
};

// 检查浏览器是否支持本地Session缓存。
const hasSessionStorageSupport = () => {
  return 'sessionStorage' in window && window['sessionStorage'] !== null;
};

const getMeta = pathname => {
  if (typeof pathname === 'undefined') {
    throw new Error('pathname is required');
  }

  // 字符串总是从跟路径开始的，所以找紧挨着的一个
  const metaNameSpace = pathname.split('/')[1];
  // eslint-disable-next-line
  // console.log('[EL-MENU]: Meta namespace check on layout loading. metaNameSpace ->', metaNameSpace);

  // TODO: 还没有完成路由，先临时解决一下。Auth是需要被过滤掉的
  // PS: 感觉可以修改一下，但不知道怎么改。。。但是还是好烦啊 好烦啊 啊啊啊啊啊啊啊啊啊！
  if (metaNameSpace && metaNameSpace !== 'auth') {
    return metaNameSpace;
  }
};

export { checkBrowser, hasLocalStorageSupport, hasSessionStorageSupport, getMeta };
