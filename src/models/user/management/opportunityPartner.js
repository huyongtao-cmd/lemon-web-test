import { findOppoPartners, saveOppoPartners } from '@/services/user/management/opportunity';
import createMessage from '@/components/core/AlertMessage';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'userOppsDetailpartner',

  state: {
    partnerList: [],
    partnerDels: [],
    partnerTotal: 0,
    partnerPageConfig: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findOppoPartners, payload);
      const list = Array.isArray(response.rows) ? response.rows : [];
      yield put({
        type: 'updateState',
        payload: {
          partnerList: list,
          partnerTotal: response.total,
          partnerDels: list.map(v => v.id),
        },
      });
    },
    // 保存
    *save({ payload }, { put, call, select }) {
      const { partnerDels, partnerList } = yield select(
        ({ userOppsDetailpartner }) => userOppsDetailpartner
      );
      // // 把原始数据里被删掉的id找出来
      const list = partnerList.filter(
        v =>
          !!v.partnerName ||
          !!v.partnerNo ||
          !!v.contactName ||
          !!v.contactEmail ||
          !!v.contactTel ||
          !!v.coopDesc ||
          !!v.profitShare
      );
      const ids = partnerDels.filter(
        d => !list.map(i => i.id).filter(v => v > 0 && d === v).length
      );

      const { status, response } = yield call(saveOppoPartners, { entityList: list, delIds: ids });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({ type: 'query', payload });
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
            partnerPageConfig: response.configInfo,
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
