import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const { originatedTasks } = api.user.task;

export async function queryOriginatedTasks(params) {
  return request.get(toQs(originatedTasks, params));
}
