import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  fitCheck: {
    fitCheckList,
    fitCheckListCancel,
    fitCheckDel,
    abilityList,
    getUserTrainingProgList,
    getcapaSetListByRes,
    checkSave,
    cancelCheck,
    getTrainingList,
    updateCheckStatus,
  },
} = api.hr;

// ================适岗考核列表==================
// 资源培训情况列表
export async function fitCheckListRq(params) {
  return request.get(toQs(fitCheckList, params));
}

// 资源培训情况列表关闭
export async function fitCheckListCancelRq(params) {
  return request.patch(toUrl(fitCheckListCancel, params));
}

// 资源培训情况列表删除
export async function fitCheckDelRq(params) {
  return request.patch(toUrl(fitCheckDel, params));
}
// 适岗考核能力列表
export async function abilityListRq(params) {
  return request.get(toQs(abilityList, params));
}
// 新增弹窗获取适岗培训项目
export async function userTrainingProgListRq(params) {
  return request.get(toQs(getUserTrainingProgList, params));
}
// 新增弹窗根据资源id获取适岗培训项目
export async function getcapaSetListByResUri(params) {
  return request.get(toUrl(getcapaSetListByRes, params));
}
// 新增弹窗保存
export async function checkSaveUri(params) {
  return request.post(checkSave, {
    body: params,
  });
}
// 取消考核
export async function cancelCheckUri(params) {
  return request.put(toUrl(cancelCheck, params));
}

// 列表页行 点击 试岗培训  获取 试岗培训列表
export async function getTrainingListUri(params) {
  return request.get(toUrl(getTrainingList, params));
}

// 更新考核状态
export async function updateCheckStatusUri(parmars) {
  return request.put(toUrl(updateCheckStatus, parmars));
}
