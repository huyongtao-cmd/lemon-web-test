import { sendMessageByNo } from '@/services/sys/system/messageConfiguration';

/**
 * 调用系统发邮件
 * @param messageNo 消息编码
 * @param docId 单据id
 */
const callMessageSend = (messageNo, docId) => {
  const response = sendMessageByNo({ messageNo });
  console.log(response);
  console.log(response);
};

const elGlobal = {
  callMessageSend,
};
export { elGlobal as default };
