import { request } from '@/utils/networkUtils';
import api from '@/api';
import { toQs, toUrl } from '@/utils/stringUtils';

const { changePwd } = api.user.center;

// 修改密码
export async function pwdChange(params) {
  return request.patch(toQs(changePwd, params));
}
