import { queryInvPrint } from '@/services/plat/recv/InvBatch';

export async function getPrintInvData(id) {
  const { status, response } = await queryInvPrint(id);
  if (status === 200) {
    return response.datum || {};
  }
  return {};
}
