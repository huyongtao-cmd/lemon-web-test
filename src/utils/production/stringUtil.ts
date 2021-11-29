// @ts-ignore
import { parse, stringify } from 'qs';
import { __, compose, curry, isNil, merge, zipObj } from 'ramda';




/**
 * 设置url上面参数 query string
 * @returns {string}
 * @param {string} url - 指定路径
 * @param {Object} obj - 待反序列化的对象
 * @returns {string}
 */
const toQs = curry((url:string, obj) => {
  if (typeof url !== typeof '') {
    // eslint-disable-next-line
    throw 'Ineligible url to combine query string. Check your service call method.';
  }
  // TODO: 这里的处理可能会导致URL以问号结尾出现问题
  return [url, stringify(obj)].join(url.indexOf('?') !== -1 ? '&' : '?');
});

/**
 * 获取url上面参数 query string
 * @param {string} url - 指定路径
 * @returns {Object} 这个函数参数只有1个，不做柯理化
 */
const fromQs = (url = window.location.href) => {
  return parse(url.split('?')[1]);
};


/**
 * 生成随机16位颜色码
 * @returns {string}
 */
const getRandHexColor = () => {
  let s = [];
  let hexDigits = '0123456789abcdef';
  for (let i = 0; i < 6; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  return s.join('');
};


/**
 * 生成一串长度自定义的随机数字字母字符串
 * 包含大小写
 * @param len
 * @returns {string}
 */
const randomString = (len = 8) => {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const maxPos = chars.length;
  let pwd = '';
  for (let i = 0; i < len; i += 1) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
};

// to developer: 函数Currify之后内部变量的依赖开发工具lint不了（应该与AST解析有关，有的如WP的一些插件加上自定义注释可以标记。）
// 虽然有一点恶心，暂时也没有很好的办法只能先将就一下了。
export {
  toQs,
  fromQs,
  getRandHexColor,
  randomString,
};
