import { queryUserPrincipal } from '@/services/gen/user';
import { queryReportApi, queryReportAjax } from '@/services/user/project/project';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'reportAuth',
  state: {
    reportUrl: '',
  },
  effects: {
    *query({ payload }, { call, put }) {
      // 获取插件路径
      const { response: resp } = yield call(queryReportAjax);
      if (resp.ok) {
        const { reportUrl = '' } = resp.datum || {};
        yield put({
          type: 'updateState',
          payload: { reportUrl },
        });
      } else {
        createMessage({ type: 'error', description: '对不起,您没有权限访问 (错误码: -100)' });
      }
      // 获取登录api
      const { response: res } = yield call(queryReportApi);
      if (res.ok) {
        const { reportUrl: ajaxUrl } = res.datum;
        yield put({
          type: 'updateState',
          payload: { ajaxUrl },
        });
      } else {
        createMessage({ type: 'error', description: '对不起,您没有权限访问 (错误码: -200)' });
      }
      // 获取用户名 密码
      const { response, status } = yield call(queryUserPrincipal);
      if (status === 200) {
        const {
          info: { email },
          secretKey,
        } = response;
        yield put({
          type: 'updateState',
          payload: { login: email, secretKey },
        });
      } else {
        createMessage({ type: 'error', description: '获取个人信息失败' });
      }
      return (resp.datum || {}).reportUrl;
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
