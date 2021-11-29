// 获取url的参数
export function getParam(url, paramKey) {
  // 获取要取得的get参数位置
  const get = url.indexOf(paramKey + '=');
  if (get === -1) {
    return '';
  }
  // 截取字符串
  let getParamStr = url.slice(paramKey.length + get + 1);
  // 判断截取后的字符串是否还有其他get参数
  const nextparam = getParamStr.indexOf('&');
  if (nextparam !== -1) {
    getParamStr = getParamStr.slice(0, nextparam);
  }
  return decodeURIComponent(getParamStr);
}

export function editParam(url, paramKey, paramVal) {
  const reg = eval(`/(${paramKey}=)([^&]*)/gi`);
  const nUrl = url.replace(reg, paramKey + '=' + paramVal);
  return nUrl;
}

// 添加url参数
export function addParam(url, paramKey, paramVal) {
  let andStr = '?';
  const beforeparam = url.indexOf('?');
  if (beforeparam !== -1) {
    andStr = '&';
  }
  return url + andStr + paramKey + '=' + encodeURIComponent(paramVal);
}

// 删除url参数
export function delParam(url, paramKey) {
  const reg = new RegExp('([&?]?)' + paramKey + '=[^&]+(&?)', 'g');
  var newUrl = url.replace(reg, function(a, b, c) {
    if (c.length == 0) {
      return '';
    } else {
      return b;
    }
  });
  return newUrl;
}
