import { findExpenseById } from '@/services/user/expense/expense';

export async function getExpenseeFeeAppleData(id) {
  const { status, response } = await findExpenseById(id);
  if (status === 200) {
    return response.datum || {};
  }
  return {};
}
