import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  messageList,
  saveMessage,
  getMessage,
  updateMessage,
  seedMessage,
  delMessage,
  myMessageList,
  messageRead,
  recallMessage,
  timingMessageList,
} = api.plat.message;

// 获取消息列表
export async function getMessageList(params) {
  return request.get(toQs(messageList, params));
}
// 获取定时消息模版列表
export async function getTimingMessageList(params) {
  return request.get(toQs(timingMessageList, params));
}
// 获取我的消息列表
export async function getMyMessageList(params) {
  return request.get(toQs(myMessageList, params));
}

// 保存或发布消息
export async function saveMessageHandle(params) {
  return request.post(saveMessage, {
    body: params,
  });
}

// 获取消息详情
export async function getMessageInfo(id) {
  return request.get(toUrl(getMessage, { id }));
}

// 更新消息状态
export async function messageReadFn(id) {
  return request.patch(toUrl(messageRead, { id }));
}

// 更新保存或发布消息
export async function updateMessageHandle(params) {
  return request.post(updateMessage, {
    body: params,
  });
}

// 直接发送信息
export async function seedMessageHandle(id) {
  return request.post(toUrl(seedMessage, { id }));
}

// 删除信息
export async function deleteMessageHandle(ids) {
  return request.patch(toUrl(delMessage, { ids }));
}

// 撤回信息
export async function recallHandle(ids) {
  return request.patch(toUrl(recallMessage, { ids }));
}

// // export async function cancelProc(id) {
// //   return request.delete(toUrl(procCancel, { id }));
// // }

// // 获取问题反馈信息
// export async function getFeedbackInfo(id) {
//   return request.get(toUrl(feedbackInfo, { id }));
// }

// // 更新问题反馈
// export async function updateFeedbackInfoHandle(params) {
//   return request.patch(feedbackUpdate, {
//     body: params,
//   });
// }

// // 提交问题反馈
// export async function saveFeedbackInfoHandle(params) {
//   return request.post(saveFeedbackInfo, {
//     body: params,
//   });
// }

// // 关闭问题反馈
// export async function closeFeedbackHandle(params) {
//   return request.patch(feedbackClose, {
//     body: params,
//   });
// }

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
