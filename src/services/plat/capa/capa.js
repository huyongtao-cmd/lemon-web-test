import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  capas,
  capa,
  capaSave,
  capaLevels,
  capaLevelSave,
  capaLevelDel,
  capaAbilities,
  capaLevelSel,
  capaLevelDetSel,
  capaAbilitiesAdd,
  capaAbilitiesDel,
  capaAbilityStat,
  capaLevelSelNew,
  capaLevelDetSelNew,
  capaStatus,
  capaTree,
  capaTreeDetail,
  capaTreeDetailWithText,
  capaSetStatus,
  choseCourseTree,
  choseCourseList,
  getCourseDetail,
  getDoubleCheckDetail,
  saveDoubleCheck,
  getCapaSetDoubleCheck,
  saveCapsSetDoubleCheck,
  getRenewCapa,
  getRenewCapaDetail,
  cancelRenewCapa,
  getRenewCapaRes,
} = api.user.ability;

export async function queryCapas(params) {
  return request.get(toQs(capas, params));
}

export async function findCapaById({ id }) {
  return request.get(toUrl(capa, { id }));
}

export async function saveCapa(params) {
  return request.put(capaSave, { body: params });
}

export async function queryCapaLevelsById({ id }) {
  return request.get(toUrl(capaLevels, { id }));
}

export async function saveCapaLevel(params) {
  return request.put(capaLevelSave, {
    body: params,
  });
}

export async function deleteCapaLevelsByIds({ ids }) {
  return request.patch(toUrl(capaLevelDel, { ids }));
}

export async function queryCapaAbilityByLevelId({ id }) {
  return request.get(toUrl(capaAbilities, { id }));
}

export async function queryCapaLevelSel() {
  return request.get(capaLevelSel);
}

export async function queryCapaTree() {
  return request.get(capaTree);
}

export async function queryCapaTreeDetail(params) {
  return request.get(toQs(capaTreeDetail, params));
}

export async function queryCapaTreeDetailWithText(params) {
  return request.get(toQs(capaTreeDetailWithText, params));
}

export async function queryCapaLevelDetSel({ id }) {
  return request.get(toUrl(capaLevelDetSel, { id }));
}

export async function queryCapaLevelSelNew() {
  return request.get(capaLevelSelNew);
}

export async function queryCapaLevelDetSelNew({ id }) {
  return request.get(toUrl(capaLevelDetSelNew, { id }));
}

export async function changeCapeStatus(params) {
  return request.put(toUrl(capaStatus, { id: params.id, capaStatus: params.capaStatus }));
}

export async function changeCapeSetStatus(params) {
  return request.put(toUrl(capaSetStatus, { id: params.id, capasetStatus: params.capasetStatus }));
}

// 批量操作
export async function addCapaAbilities(payload) {
  return request.post(capaAbilitiesAdd, { body: payload });
}

export async function changeCapaAbility(payload) {
  return request.patch(capaAbilityStat, { body: payload });
}

export async function deleteCapaAbilities({ ids }) {
  return request.patch(toUrl(capaAbilitiesDel, { ids: ids.join(',') }));
}

export async function queryCourseTree() {
  return request.get(choseCourseTree);
}

export async function queryCourseTreeDetail(params) {
  return request.get(toQs(choseCourseList, params));
}

export async function findCourseDetailById({ id }) {
  return request.get(toUrl(getCourseDetail, { id }));
}

export async function getDoubleCheckById({ id }) {
  return request.get(toUrl(getDoubleCheckDetail, { id }));
}

export async function saveDoubleCheckFn(payload) {
  return request.post(saveDoubleCheck, { body: payload });
}

export async function getCapaSetDoubleCheckFn({ id }) {
  return request.get(toUrl(getCapaSetDoubleCheck, { id }));
}

export async function saveCapsSetDoubleCheckFn(payload) {
  return request.post(saveCapsSetDoubleCheck, { body: payload });
}

// 复核列表查询
export async function queryRenewCapa(params) {
  return request.get(toQs(getRenewCapa, params));
}

// 获取复核详情
export async function getRenewCapaDetailFn({ id }) {
  return request.get(toUrl(getRenewCapaDetail, { id }));
}

// 取消复核
export async function cancelRenewCapaFn({ ids }) {
  return request.delete(toUrl(cancelRenewCapa, { ids }));
}
// 获取复核资源列表
export async function getRenewCapaResFn(params) {
  const { id } = params;
  const newParams = Object.assign({}, params);
  delete newParams.id;
  return request.get(toQs(toUrl(getRenewCapaRes, { id }), newParams));
}
