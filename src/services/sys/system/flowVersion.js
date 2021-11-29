import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { flowVersionList, versionItemByVersionTag, saveExplain } = api.sys.flow;
// 流程的版本列表
export async function getFlowVersionList(params) {
  const { key } = params;
  return request.get(toQs(toUrl(flowVersionList, { key }), { ...params }));
}
// 根据流程key和版本号 获取流程说明信息
export async function getVersionItemByVersionTag({ procKey, versionTag }) {
  return request.get(toQs(toUrl(versionItemByVersionTag, { procKey }), { versionTag }));
}

// // 根据流程实例id 获取流程说明信息
// export async function getVersionItemByProcId(procId) {
//   return request.get(toUrl(versionItemByProcId, { procId }));
// }

// 保存流程说明信息
export async function putSaveExplain(params) {
  return request.put(saveExplain, {
    body: params,
  });
}
