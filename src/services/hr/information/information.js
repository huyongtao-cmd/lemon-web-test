import { request } from '@/utils/networkUtils';
import { crossRequest } from '@/utils/networkCrossUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const {
  information: { personExpand, getByResId, getResInfoByResId },
} = api.hr;

// 员工录入新增
export async function personAdd(params) {
  return crossRequest(personExpand, {
    // body:params
    body: JSON.stringify(params),
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    },
    method: 'POST',
  });
}

export async function getPersonInfo(id) {
  return crossRequest.get(`${getByResId}?resId=${id}`);
}

export async function getPersonBaseInfo(id) {
  return crossRequest.get(`${getResInfoByResId}?resId=${id}`);
}

export async function getProvince() {
  return crossRequest.get(`/eds/api/cds/udcsfront/vals?defIdArg=COM:PROVINCE`);
}

export async function getEducation() {
  return crossRequest.get(`/eds/api/cds/udcsfront/vals?defIdArg=COM:EDUCATION`);
}

export async function getCity(params) {
  return crossRequest.get(
    `/api/common/v1/udc/items/front?defId=COM:CITY&parentDefId=COM:PROVINCE&parentVal=${params}`
  );
}
