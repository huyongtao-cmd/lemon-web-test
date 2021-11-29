import createMessage from '@/components/core/AlertMessage';

// TODO: 这里的实现不好 以后要优化
// https://ant.design/components/table-cn/#header
// 致二期的朋友: 上面的链接是一个更好的实现，我接手这个模块的时候业务已经铺开了，不太好全局整，所以简单的搞了搞
// 希望接手的朋友了解一下，可以按照demo封装好组件。
export function reValidate(list, ...fields) {
  // every有一个坑，当list为空，every永远发回true 所以取反2次。
  return !fields
    .map(field => {
      const noValidationMap = list
        ? list
            .map(
              (item, index) =>
                //   (typeof field.check === 'function'
                //     ? field.check(field, item)
                //     : field.name && item[field.name]) || index + 1
                field.name && item[field.name] ? void 0 : index + 1
            )
            .filter(Boolean)
        : [];
      // 校验明细项
      // console.log('noValidationMap.length ->', noValidationMap.length);
      if (noValidationMap.length) {
        createMessage({
          type: 'error',
          description:
            field.message || `第${noValidationMap.join(',')}条记录没有维护${field.label || ''}。`,
        });
        return false;
      }
      return true;
    })
    .some(validationResult => !validationResult);
}
