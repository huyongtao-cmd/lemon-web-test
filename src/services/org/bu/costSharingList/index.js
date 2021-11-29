/* eslint-disable no-redeclare */
import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { costSharing, examCostSharingTask } = api.org;
// 查询分摊列表的主表信息
export async function queryCostSharing(params) {
  const temp = {};
  Object.keys(params).forEach(key => {
    if (params[key]) {
      temp[key] = params[key];
    }
  });
  return request.get(toQs(costSharing, temp));
}

// bu相关的操作人
export async function postExamCostSharingTask(data) {
  return request.post(examCostSharingTask, { body: { payload: data } });
}
