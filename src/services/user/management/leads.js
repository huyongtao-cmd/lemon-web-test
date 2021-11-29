import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { userMultiColSelect, buMultiColSelect, management } = api.user;
const { leads, lead, leadClose, leadAdmin, leadFinish } = management;
const { leadsSubmit } = api.bpmFlow.lead;
const { doTask } = api.bpm;
const { launchFlow } = api.flowHandle;
// 查询列表
export async function findLeads(params) {
  return request.get(toQs(leads, params));
}

// 查询单条信息
export async function findLeadById(id) {
  return request.get(toUrl(lead, { id }));
}

// 新增
export async function create(params) {
  return request.post(leads, {
    body: params,
  });
}

// 编辑
export async function update(params) {
  return request.put(toUrl(lead, { id: params.id }), {
    body: params,
  });
}

// 关闭线索及原因
export async function closeLead(params) {
  return request.patch(leadClose, {
    body: params,
  });
}

// 人员数据 下拉
export async function selectUsers() {
  return request.get(userMultiColSelect);
}

// bu数据 下拉
export async function selectBus() {
  return request.get(buMultiColSelect);
}

// 提交线索
export async function submitLeads(id) {
  return request.post(toUrl(leadsSubmit, { id }));
}

// 发起工作流(新版本流程)
export async function flowSubmit(params) {
  return request.post(toUrl(launchFlow, { processDefinitionKey: params.defkey }), {
    body: params.value,
  });
}
// 点击领奖结束流程 finsh
export async function finsh(params) {
  return request.post(toUrl(leadFinish, { id: params.id }), {
    body: params,
  });
}
