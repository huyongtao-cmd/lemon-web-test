/* eslint-disable */
import pathToRegexp from 'path-to-regexp';
import { parse, stringify } from 'qs';
import { __, compose, curry, isNil, merge, zipObj } from 'ramda';

// ----------------------------------------------------------------
// 字符串工具类 - 负责提供非业务耦合的各种字符串操作。
// ----------------------------------------------------------------

/**
 * 获取一个不会重复，自定义带scope的随机字符串(有利于项目维护等)。
 * RFC4122 version 4 compliant unique id creator.
 * Added by https://github.com/tufanbarisyildirim/
 *
 * @param id
 * @returns {string}
 */
const getGuid = id =>
  (id && id + '-') +
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

/**
 * 字符串替换 %s
 * <p> 例: interpolate('一共有%s个%s和%s条%s，共%s条%s', 4, '人' 2, '狗', 16, '腿')
 * <p> === '一共有4个人和2条狗，共16条腿'
 * <p> 这里由两种模式，当传入%p的时候，则会尝试decodeURI，%s则当成普通字符串处理
 * 常规环境下请尽量使用ES6字符串替换语法，此处主要针对国际化翻译，具体使用方法请参考测试用例。
 * 注意! umi的formatMessage自带这个功能，请优先使用。
 *
 * @param strs 带解析字符串与相关替换参数
 * @returns {string}
 */
const interpolate = (...strs) => {
  if (!strs.length) return '';
  // eslint-disable-next-line
  let queue = strs;
  let flag = true;
  let i = 1; // 去除第一个参数
  // 替换字符串为指定变量
  // eslint-disable-next-line
  strs[0] = strs[0].replace(/%s|%p/g, exp => {
    const param = queue[i++];
    if (typeof param === 'undefined') {
      flag = false;
      return '';
    }
    return exp === '%p' ? window.encodeURIComponent(param) : param;
  });
  return flag ? strs[0] : '';
};

/**
 * 连字符转驼峰
 */
const kebabToCamel = str => str.replace(/-(\w)/g, (...args) => args[1].toUpperCase());

/**
 * 驼峰转连字符
 */
const camelToKebab = str => str.replace(/([A-Z])/g, '-$1').toLowerCase();

/**
 * 设置url上面参数 RESTful 无encode
 * 备注: 一般的默认行为是encode，但是
 * @returns {string} 成功设置后的路径
 */
const toUrl = curry((url, obj) => {
  if (!url) {
    // eslint-disable-next-line
    throw 'Ineligible url to put RESTFul parameters.';
  }
  return pathToRegexp.compile(url, { encode: value => value })(obj);
});

/**
 * 设置url上面参数 RESTful
 * @returns {string} 成功设置后的路径
 */
const toUrlenc = curry((url, obj) => {
  if (!url) {
    // eslint-disable-next-line
    throw 'Ineligible url to put RESTFul parameters.';
  }
  return pathToRegexp.compile(url)(obj);
});

/**
 * 获取url上面参数 RESTful
 * @param {string} url - 指定路径
 * @param {string} expression - 过滤参数的正则表达式
 * (详见https://github.com/pillarjs/path-to-regexp)
 * @returns {Object} - 参数数组，按顺序从前到后排
 */
const fromUrl = (url = window.location.href, expression) => {
  const keys = []; // 利用第二步操作对该数组对象进行填充
  const rules = pathToRegexp(expression, keys); // [{ name: 'first', ... }, { name: 'second', ...}]
  const pathArray = rules.exec(url) || []; // [url, str_1, str_2, ...]
  // 去除第一个解析项，默认为当前路径
  if (isNil(pathArray.shift())) {
    return {};
  }
  // = R.pipe(R.zip, R.fromPairs)
  return zipObj(
    keys.map(key => key.name),
    pathArray.map(param => window.decodeURIComponent(param))
  );
};

/**
 * 设置url上面参数 query string
 * @returns {string}
 * @param {string} url - 指定路径
 * @param {Object} obj - 待反序列化的对象
 * @returns {string}
 */
const toQs = curry((url, obj) => {
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
 * 获取url上面参数 query string
 * @param {string} url - 指定路径
 * @param {Object} queryObject - 需要回填数据的对象
 * 注意: 为了实际应用中方便，该变量中的数值类型为自动转换 如果不希望自动转换 则请使用fromQs自行处理!!
 * @returns {Object}
 */
const fromQsToObj = curry((url = window.location.href, queryObject) => {
  return compose(
    merge(queryObject, __)
    // R.mapObjIndexed(// 查询数字字符串自动转数字
    //   value => math.parseIfNumeric(value),
    //   R.__
    // )
  )(fromQs(url));
});

/**
 * 比较两个url是否相等
 * @param subject_path - 需要的url(正则)，参考: https://www.npmjs.com/package/path-to-regexp
 * @param current_loc - 当前url
 * @returns {boolean}
 */
const isUrlEq = curry(
  (current_loc, subject_path) => !!pathToRegexp(subject_path).exec(current_loc)
);

/* eslint no-useless-escape:0 */
const _reg_url = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

/**
 * 是否是合法的url路径
 * @param path - 待检查路径
 * @return {boolean}
 */
const isUrl = path => {
  return _reg_url.test(path);
};

/**
 * 从后台请求错误码 -> 国际化文件码
 * @param code - 错误返回码
 * @param scope - 作用领域
 * @return {string}
 */
const getErrCode = (code, scope) =>
  `${scope && scope + '.'}${code
    .split('_') // ^_^
    .map(item => item.toLowerCase())
    .join('.')}`;

const compareIgnoreCase = curry((str1, str2) => str1.toUpperCase() === str2.toUpperCase());

/**
 将RGB颜色转成16位色
 @param rgbString {string} - RGB颜色
 @returns {string} - 16位色
 */
const toHexColor = rgbString => {
  // rgb(0, 70, 255)
  const parts = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  // 颜色应该被拆分成 ["rgb(0, 70, 255", "0", "70", "255"]
  // delete (parts[0]);// 删除parts数组的rgb
  for (let i = 2; i <= 4; ++i) {
    parts[i] = parseInt(parts[i]).toString(16);
    if (parts[i].length === 2) parts[i] = '0' + parts[i];
  }
  return parts.join(''); // "0070ff"
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
 * 返回JSONP格式需要的字符串
 * @param cbNamespaceStr
 * @param rst
 * @returns {string}
 */
const parseJSONPStr = (cbNamespaceStr, rst) => {
  return cbNamespaceStr + '(' + JSON.stringify(rst) + ')';
};

/**
 * 字符串超过一定长度显示...
 * 不区分大小写
 * @param str
 * @param num
 * @returns {string}
 */
const ellipsisStr = (str, num) => {
  if (str.length > num) {
    return str.substr(0, num) + '...';
  }
  return str;
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

/**
 * 超长字符串做省略号处理
 * 区分中英文，中文两个字符，英文一个字符
 * @param str 字符串
 * @param len 截取长度
 * @param hasDot 是否添加省略号...
 * @returns {string}
 */
const fittingString = (str = '', len, hasDot = true) => {
  let newLength = 0;
  let newStr = '';
  let singleChar = '';
  const chineseRegex = /[^\x00-\xff]/g;
  const strLength = str.replace(chineseRegex, '**').length;
  for (var i = 0; i < strLength; i++) {
    singleChar = str.charAt(i).toString();
    if (singleChar.match(chineseRegex) != null) {
      newLength += 2;
    } else {
      newLength++;
    }
    if (newLength > len) {
      break;
    }
    newStr += singleChar;
  }
  if (hasDot && strLength > len) {
    newStr += '...';
  }
  return newStr;
};

const JSON2QueryString = obj => {
  const str = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const p in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(p) && obj[p]) {
      // eslint-disable-next-line prefer-template
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
};

// to developer: 函数Currify之后内部变量的依赖开发工具lint不了（应该与AST解析有关，有的如WP的一些插件加上自定义注释可以标记。）
// 虽然有一点恶心，暂时也没有很好的办法只能先将就一下了。
export {
  getGuid,
  interpolate,
  kebabToCamel,
  camelToKebab,
  toUrl,
  toUrlenc,
  fromUrl,
  toQs,
  fromQs,
  fromQsToObj,
  isUrl,
  isUrlEq,
  parseJSONPStr,
  getErrCode,
  toHexColor,
  getRandHexColor,
  ellipsisStr,
  randomString,
  fittingString,
  JSON2QueryString,
};
