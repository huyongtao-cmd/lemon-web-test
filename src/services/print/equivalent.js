import { getInfo, getSingleTable } from '@/services/user/equivalent/equivalent';

export async function getSingleEquivalentData(id) {
  const [formRes, tableRes] = await Promise.all([getInfo({ id }), getSingleTable({ id })]);
  if (formRes.status === 200 && tableRes.status === 200) {
    const formData = formRes.response.datum || {};
    const list = Array.isArray(tableRes.response.datum) ? tableRes.response.datum : [];
    return {
      ...formData,
      list,
    };
  }
  return {};
}
