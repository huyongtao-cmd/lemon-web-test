import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';
import api from '@/api';

const { system } = api.sys;
const {
  timedTaskList,
  timedTaskStart,
  timedTaskStop,
  timedTaskEdit,
  timedTaskDetail,
  timedTaskQuickStart,
  timedTaskNowStart,
} = system;

// 获取定时任务列表接口
export async function getTimedTaskList(params) {
  return request.get(toQs(timedTaskList, params));
}

// 启动任务
export async function timedTaskStartHandle(params) {
  return request.put(timedTaskStart.replace('{taskCode}', params));
}

// 停止任务
export async function timedTaskStopHandle(params) {
  return request.put(timedTaskStop.replace('{taskCode}', params));
}

//  更新任务
export async function timedTaskUpdate(params) {
  return request.post(timedTaskEdit, {
    body: params,
  });
}

// 任务详情
export async function getTimedTaskDetail(params) {
  return request.get(timedTaskDetail.replace('{code}', params));
}

// 立即生效
export async function timedTaskQuickStartHandle() {
  return request.put(timedTaskQuickStart);
}

// 立即执行
export async function timedTaskNowStartRq(params) {
  return request.put(toUrl(timedTaskNowStart, params));
}
