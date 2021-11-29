import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const { taskEvents } = api.user.task;

export async function queryTaskEvents(params) {
  return request.get(toQs(taskEvents, params));
}
