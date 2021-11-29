import createMessage from '@/components/core/AlertMessage';
import { getResInfo, getEqvaRatioList, saveEqvaRatio } from '@/services/org/bu/eqvaRatio/eqvaRatio';
import { fromQs } from '@/utils/stringUtils';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'orgEqvaRatio',
  state: {
    pageConfig: {},
    formData: {
      resId: null,
      resName: null,
      curEqvaRatio: null,
      dateFrom: null,
      dateTo: null,
      buPeriods: null,
    },
    ratio: {
      dataList: [],
      delIds: [],
    },
    eqva: {
      dataList: [],
      delIds: [],
    },
  },
  effects: {
    *getResInfo({ payload }, { call, put }) {
      const { response, status } = yield call(getResInfo, payload);
      if (status === 100) {
        return;
      }
      if (!!response && response.ok) {
        yield put({
          type: 'orgEqvaRatio/updateState',
          payload: {
            formData: response.datum,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason });
      }
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
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
