import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';
import { request } from '@/utils/networkUtils';

const {
  user: { task },
} = api;
const {
  taskSplit,
  taskSplitActivity,
  taskSplitOther,
  taskSplitAdd,
  taskSplitById,
  taskSplitEdit,
  taskSplitSettle,
  capasetLevelById,
} = task;

export async function querySplitPackInfo({ id }) {
  return request.get(toUrl(taskSplit, { id }));
}

export async function querySplitPackActivityInfo({ id }) {
  return request.get(toUrl(taskSplitActivity, { id }));
}

export async function querySplitPackOtherInfo(params) {
  return request.get(toQs(taskSplitOther, params));
}

export async function addSplitPack(params) {
  return request.post(taskSplitAdd, { body: params });
}

export async function querySplitPackId({ id }) {
  return request.get(toUrl(taskSplitById, { id }));
}

export async function querySplitPackEditInfo(params) {
  return request.get(toQs(taskSplitEdit, params));
}

export async function queryBuSettleInfo(params) {
  return request.get(toQs(taskSplitSettle, params));
}

export async function selectCapasetLevelByResIdUri({ resId }) {
  return request.get(toUrl(capasetLevelById, { resId }));
}
