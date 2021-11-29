import { getPrePayDetail } from '@/services/user/center/prePay';

export async function getAdPayData(id) {
  const { status, response } = await getPrePayDetail(id);
  if (status === 200) {
    return response.datum || {};
  }
  return {};
}
