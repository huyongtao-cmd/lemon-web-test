import { findExpenseById } from '@/services/user/expense/expense';

export async function getExpenseTicketData(id) {
  const { status, response } = await findExpenseById(id);
  if (status === 200) {
    return response.datum || {};
  }
  return {};
}
