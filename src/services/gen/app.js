import { stringify } from 'qs';
import { isNil } from 'ramda';
import api from '@/api';
import { toQs, toUrl, JSON2QueryString } from '@/utils/stringUtils';
import {
  request,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  serverUrl,
} from '@/utils/networkUtils';

/* 基础接口 - 不做代码检查(其他接口应当尽量避免log) */
/* eslint-disable */

// -------- real stuff --------

export async function fetchCsrf() {
  console.log('[EL-ARCH]: f -> xsrf');
  return request(api.basic.xsrf, {
    method: 'HEAD',
  });
}

export async function fetchCaptcha() {
  console.log('[EL-LOGIN]: f -> captcha');
  return request(api.basic.captcha, {
    method: 'GET',
  });
}

export async function getEncryptPsw() {
  return request.get(api.basic.encryptPsw);
}

export async function accountLogin(params) {
  console.log('[EL-LOGIN]: f -> account login ::', params);
  return request(toQs(api.basic.login, params), {
    method: 'POST',
    // body: params,
    // headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  });
}

export async function accountLoginToken() {
  return request.get(api.basic.loginToken);
}

// 根据用户resid查询头像
export async function getAvatar(id) {
  const dataKey = id;
  const { response } = await request.get(
    toQs('/api/production/sys/userPhoto/sfs/token', { dataKey })
  );
  const tokenInfo = response;
  const newResponse = await request.get(toQs(api.sfs.list, { dataKey, ...tokenInfo }));
  const newList = newResponse.response;
  if (newList.length) {
    const a = newList.map(f => {
      const url = `${serverUrl}${api.sfs.download}?${JSON2QueryString({
        hash: f.itemHash,
        dataKey,
        ...tokenInfo,
        'el-xsrf': localStorage.getItem('csrfToken'),
        _t: new Date().getTime() / 1000,
      })}`;

      return {
        uid: f.itemName,
        name: f.itemName,
        link: url,
        status: 'done',
        ...f,
      };
    });
    return a[a.length - 1].link;
  }
  return false;
}

/**
 * 这个项目很迷，loading.effects抽了:)
 * 把一系列数据串行出来,维持binding。。。
 * 不需要log，因为不成功就打登录页并且刷新浏览器了，log也记录不下来
 */
export async function authCheckingChain() {
  const { response: res } = await request.get(api.basic.principal, { force: true });
  // console.warn(res);
  if (!isNil(res.user)) return res;
  const recordToken = getAuthToken();
  // console.warn('token -> ', recordToken, isNil(recordToken));
  if (isNil(recordToken)) return undefined;
  const params = {
    app_login_token: recordToken,
    app_login_type: 'PC',
  };
  const { status, response, code } = await request(toQs(api.basic.login, params), {
    method: 'POST',
    force: true,
  });
  // console.warn('token to login -> ', response, code);
  if (status === 200 && code === 'OK') {
    const tokenResponse = await request.get(api.basic.loginToken);
    if (tokenResponse.status === 200) {
      // 拿token成功的话，就更新token
      const token = tokenResponse.code;
      // 这里不用再判断是否点了自动登录，因为已经拿token鉴权成功了，说明需要自动登录，就自动记录新token了
      setAuthToken(token);
    }
    const isLogin = window.location.pathname === '/auth/login';
    if (isLogin) {
      // 鉴权成功之后，判断是不是在登录页，如果在登录页还能成功，说明没点退出就来登录了，打回到首页
      router.replace('/user/home');
    }
    return true;
  }
  // 拿token失效的话，就清除
  clearAuthToken();
  return undefined;
}

export async function accountlogout() {
  console.log('[EL-LOGIN]: f -> account logout ::');
  return request(api.basic.logout, {
    method: 'POST',
    // body: params,
  });
}

export async function changeLang() {
  // console.log('[EL-I18N]: f -> change i18n ::');
  return request(api.basic.lang, {
    method: 'POST',
    // body: params,
  });
}

/**
 * 前端公共用户编码查询接口
 * @param code - UDC码
 * @param expirys - 前端缓存保持时间(登录/切换语言都会导致缓存清空)
 * @return {Promise<*>}
 */
export async function queryUdc(code, expirys = 600) {
  // console.log('[EL-I18N]: f -> udc ::', code);
  // 注意！ UDC请求有10分钟缓存
  // return request.get(toUrl(api.common.udc, { code }), { expirys });
  // TODO: 后端缓存还有点问题。。。先注释掉，上线前再开起来。
  return request.get(toUrl(api.common.udc, { code }));
}

export async function queryBuList() {
  return request.get(api.common.getBuList);
}

// 级联udc接口
export async function queryCascaderUdc(code) {
  // console.log('[EL-I18N]: f -> queryCascaderUdc ::', code);
  return request.get(toQs(api.common.cascaderUdc, code));
}

// 获取导航信息(菜单、页面、视图)
export async function queryAuthMenu() {
  // console.log('[EL-AuthMenu]: f -> auth menu ::');
  return request.get(api.sys.iam.auth.menu);
}

// 获取导航信息(菜单、页面、视图)
export async function queryTenantAuthMenu() {
  return request.get(api.sys.iam.auth.tenantMenu);
}

// 获取导航信息(菜单、页面、视图)
export async function queryTenantMenu(param) {
  return request.get(toQs(api.sys.iam.auth.allTenantMenu, param));
}

// 获取全部菜单
export async function querySystemMenu() {
  return request.get(api.sys.iam.auth.systemMenu);
}

// 通过编码获取菜单
export async function querySystemMenuByCode(param) {
  return request.get(toUrl(api.sys.iam.auth.systemMenuByCode, param));
}

// 修改菜单
export async function updateSystemMenu(param) {
  return request.put(api.sys.iam.auth.updateNavigation, { body: param });
}
// 新增菜单
export async function insertSystemMenu(param) {
  return request.post(api.sys.iam.auth.insertNavigation, { body: param });
}

// 获取首页信息(菜单、页面、视图)
export async function queryHomeConfig() {
  return request.get(api.sys.homeConfig.homePageConfigInfo);
}

// 获取首页 Logo 及右上角辅助菜单配置
export async function queryLogoAndExtension() {
  return request.get(api.sys.homeConfig.logoAndExtensionInfo);
}

// 获取 E-Learning 链接
export async function getELeaningLink() {
  return request(api.basic.elarning);
}

// 获取 报表 链接
export async function getReportChartLink() {
  return request(api.basic.reportChart);
}

// -------- fake data for demo --------

export async function queryProjectNotice() {
  return request(api.demo.notice, { mock: 1 });
}

export async function queryActivities() {
  return request(api.demo.activities, { mock: 1 });
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`, { mock: 1 });
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    mock: 1,
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    mock: 1,
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function updateRule(params) {
  return request('/api/rule', {
    method: 'POST',
    mock: 1,
    body: {
      ...params,
      method: 'update',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    mock: 1,
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data', { mock: 1 });
}

export async function queryTags() {
  return request('/api/tags', { mock: 1 });
}

export async function queryBasicProfile() {
  return request('/api/profile/basic', { mock: 1 });
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced', { mock: 1 });
}

export async function fakeAccountLogin(params) {
  return request('/api/login/account', {
    method: 'POST',
    mock: 1,
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    mock: 1,
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices', { mock: 1 });
}

export async function getFakeCaptcha(mobile) {
  return request(`/api/captcha?mobile=${mobile}`, { mock: 1 });
}
// 获取CMS配置数据
export async function getCmsInfo(code) {
  return request.get(api.basic.cms.replace('{code}', code));
}
