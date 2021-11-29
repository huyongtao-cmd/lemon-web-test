import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';
import api from '@/api';

const { launchFlow, pushFlow, passAndReturn, reSubmissionRequest } = api.flowHandle;

// 发起工作流
export async function launchFlowFn(params) {
  return request.post(toUrl(launchFlow, { processDefinitionKey: params.defkey }), {
    body: params.value,
  });
}

// 推流程
export async function pushFlowFn(params) {
  return request.post(toUrl(pushFlow, { taskId: params.taskId, result: params.result }));
}

// 流程通过或退回
export async function passAndReturnFlowFn(params) {
  return request.post(toUrl(passAndReturn, { id: params.id }), {
    body: params.value,
  });
}

export async function reSubmission(params) {
  return request.post(toUrl(reSubmissionRequest, { taskId: params.taskId }), {
    body: params,
  });
}
