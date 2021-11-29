import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  saveFeedbackInfo,
  feedbackList,
  feedbackDelete,
  feedbackUpdate,
  feedbackInfo,
  feedbackClose,
  getMyList,
  closeMyFeedback,
  getMyFeedState,
  updateMyFeed,
  saveRemark,
  saveResult,
  getRemarkAndResult,
} = api.plat.feedback;

// 获取问题反馈列表
export async function getFeedbackList(params) {
  return request.get(toQs(feedbackList, params));
}

// 删除问题反馈
export async function deleteFeedbackInfoHandle(ids) {
  return request.delete(toUrl(feedbackDelete, { ids }));
}

// export async function cancelProc(id) {
//   return request.delete(toUrl(procCancel, { id }));
// }

// 获取问题反馈信息
export async function getFeedbackInfo(id) {
  return request.get(toUrl(feedbackInfo, { id }));
}

// 更新问题反馈
export async function updateFeedbackInfoHandle(params) {
  return request.patch(feedbackUpdate, {
    body: params,
  });
}

// 提交问题反馈
export async function saveFeedbackInfoHandle(params) {
  return request.post(saveFeedbackInfo, {
    body: params,
  });
}

// 关闭问题反馈
export async function closeFeedbackHandle(params) {
  return request.patch(feedbackClose, {
    body: params,
  });
}

// 获取我的反馈列表
export async function getMyListHandle(params) {
  return request.get(toQs(getMyList, params));
}

// 关闭我的反馈
export async function closeMyFeedbackHandle(params) {
  return request.patch(closeMyFeedback, {
    body: params,
  });
}

// 获取反馈红点状态
export async function getMyFeedStateHandle() {
  return request.get(getMyFeedState);
}

// 点进我的反馈后更新红点状态
export async function updateMyFeedHandle(params) {
  return request.patch(updateMyFeed);
}

// export async function closeFeedbackHandle(params) {
//   const {ids,content}= params;
//   console.error(ids,content);
//   return request.patch(
//     toUrl(feedbackClose, {
//       ids,
//       content,
//     })
//   );
// }

// 添加备注
export async function saveRemarkHandle(params) {
  return request.post(saveRemark, {
    body: params,
  });
}

// 添加处理结果
export async function saveResultHandle(params) {
  return request.post(saveResult, {
    body: params,
  });
}

// 获取备注和处理结果
export async function getRemarkAndResultHandle(id) {
  return request.get(toUrl(getRemarkAndResult, { id }));
}
