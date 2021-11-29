/**
 *
 * @param buVersionAndBuParamsArray Bu 版本 ID 和 BU ID 组成的数组  BU 版本选择组件会返回一个数组
 * @param buKey  bu 的查询字段
 * @param buVersionKey bu 版本的查询字段
 * 返回一个由 Bu 版本 ID 和 BU ID 组成的对象
 */
export const getBuVersionAndBuParams = (buVersionAndBuParamsArray, buKey, buVersionKey) => {
  const newBuVersionAndBuParamsArray = Object.assign([], buVersionAndBuParamsArray);
  const buVersionAndBuParams = {};
  if (newBuVersionAndBuParamsArray && newBuVersionAndBuParamsArray.length > 1) {
    [
      buVersionAndBuParams[buVersionKey],
      buVersionAndBuParams[buKey],
    ] = newBuVersionAndBuParamsArray;
  }
  if (newBuVersionAndBuParamsArray && newBuVersionAndBuParamsArray.length === 1) {
    [buVersionAndBuParams[buKey]] = newBuVersionAndBuParamsArray;
  }
  return buVersionAndBuParams;
};
