import { isEmpty, isNil } from 'ramda';
import { getFlowInfoByTaskInfo } from '@/services/gen/flow';
import { toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';
import api from '@/api';

const { logs } = api.bpmn;

const fetchLogs = async prcId => {
  const data = await request.get(toUrl(logs, { id: prcId }));
  let logEvents = Array.isArray(data.response) ? data.response : [];
  if (logEvents.length && !isEmpty(logEvents.filter(log => log.logTime === null))) {
    const tail = logEvents.slice(logEvents.length - 1);
    const head = logEvents.slice(0, logEvents.length - 1);
    logEvents = tail.concat(head);
  }
  return logEvents;
};

export const getLogs = async ({ scope, id, prcId }) => {
  // 本来这里设计是没有prcId的时候才去拉流程信息的，但是现在又需要NO,docName，所以无论是审批页还是其他入口，都拉取数据即可
  // if (!isNil(prcId)) {
  //   return fetchLogs(prcId) || [];
  // }
  const { status, response } = await getFlowInfoByTaskInfo({ docId: id, procDefKey: scope });
  if (status === 200 && !isEmpty(response)) {
    const { id: prcIdRes, NO, docName } = response || {};
    const logList = (await fetchLogs(prcIdRes)) || [];
    return {
      docNo: NO,
      docName,
      logList,
    };
  }
  return {
    logList: [],
  };
};
