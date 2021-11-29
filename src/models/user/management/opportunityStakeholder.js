import { findOppoShs, saveOppoShs } from '@/services/user/management/opportunity';
import createMessage from '@/components/core/AlertMessage';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'userOppsDetailstakeholder',

  state: {
    shsList: [],
    shsDels: [],
    shsTotal: 0,
    stakePageConfig: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findOppoShs, payload);
      const list = Array.isArray(response.rows) ? response.rows : [];
      yield put({
        type: 'updateState',
        payload: {
          shsList: list,
          shsTotal: response.total,
          shsDels: list.map(v => v.id),
        },
      });
    },
    // 保存
    *save({ payload }, { put, call, select }) {
      const { shsDels, shsList } = yield select(
        ({ userOppsDetailstakeholder }) => userOppsDetailstakeholder
      );
      // // 把原始数据里被删掉的id找出来
      const list = shsList.filter(
        v =>
          !!v.roleType ||
          !!v.position ||
          !!v.contactName ||
          !!v.contactTel ||
          !!v.imAcc ||
          !!v.standpoint ||
          !!v.remark
      );
      const ids = shsDels.filter(d => !list.map(i => i.id).filter(v => v > 0 && d === v).length);

      const { status, response } = yield call(saveOppoShs, { entityList: list, delIds: ids });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({ type: 'query', payload: { sourceId: payload.oppoId, shClass: '1' } });
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            stakePageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
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
