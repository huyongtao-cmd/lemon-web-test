import { request } from '@/utils/networkUtils';
import api from '@/api';

const { setting } = api.sys;
const { clearCache } = setting;

// 清除下拉缓存
export async function clearCacheHandle() {
  return request.get(clearCache);
}
