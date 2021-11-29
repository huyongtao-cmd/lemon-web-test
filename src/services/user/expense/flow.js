import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { reimSubmit } = api.bpmFlow.reim;
const { doTask } = api.bpm;

// 在列表中推动节点
export async function complete(id) {
  return request.post(toUrl(reimSubmit, { id }));
}

// 审批通过
export async function doApprove(params) {
  const { taskId, remark } = params;
  return request.post(toUrl(doTask, { id: taskId }), {
    body: {
      remark,
      result: 'APPROVED',
      branch: 'APPROVED',
    },
  });
}

// 审批拒绝
export async function doReject(params) {
  const { taskId, remark, branch } = params;
  return request.post(toUrl(doTask, { id: taskId }), {
    body: {
      remark,
      result: 'REJECTED',
      branch,
    },
  });
}

// 专项报销审批通过
export async function doApproveSpec(params) {
  const { taskId, remark } = params;
  return request.post(toUrl(doTask, { id: taskId }), {
    body: {
      remark,
      result: 'APPROVED',
      branch: 'APPROVED',
    },
  });
}
