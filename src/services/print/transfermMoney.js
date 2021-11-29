import { transferMoneyDetailRq } from '@/services/plat/transferMoney';

export async function getTransferMoneyDetailData(id) {
  const { status, response } = await transferMoneyDetailRq({ id });
  if (status === 200) {
    return response || {};
  }
  return {};
}
