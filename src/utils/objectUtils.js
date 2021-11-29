/* eslint-disable */
// 处理空属性,可以处理list,{},字符串
const handleEmptyProps = param => {
  if (param === undefined || param === null) {
    return undefined;
  }
  if (typeof param === 'object') {
    let newObject;
    if (Array.isArray(param)) {
      newObject = Object.assign([], param);
      for (let index = 0; index < newObject.length; index += 1) {
        const val = param[index];
        if (val === undefined || val === null) {
          newObject.splice(index, 1);
        }
        if (typeof val === 'string') {
          if (val.trim().length > 0) {
            newObject[index] = val.trim();
          } else {
            newObject.splice(index, 1);
          }
        }
      }
    } else {
      // 是一个对象
      newObject = Object.assign({}, param);
      Object.keys(newObject).forEach(key => {
        const val = param[key];
        if (val === undefined || val === null) {
          delete newObject[key];
          return;
        }
        if (typeof val === 'string') {
          if (val.trim().length > 0) {
            newObject[key] = val.trim();
          } else {
            delete newObject[key];
          }
        }
      });
    }
    return newObject;
  }
  if (typeof param === 'string') {
    return param.trim();
  }
  return param;
};

export { handleEmptyProps };
