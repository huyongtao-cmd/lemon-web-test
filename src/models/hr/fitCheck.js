import { capaAbilityRq } from '@/services/user/center/myAbility';
import {
  fitCheckListRq,
  fitCheckListCancelRq,
  fitCheckDelRq,
} from '@/services/hr/fitCheck/fitCheck';
import createMessage from '@/components/core/AlertMessage';
import { queryCascaderUdc } from '@/services/gen/app';

export default {
  namespace: 'fitCheck',

  state: {
    formData: {
      visible: false,
    },
    // 查询系列
    searchForm: {
      requiredFlag: '',
    },
    dataSource: [],
    total: 0,
    type2: [],
  },

  effects: {
    *capaAbility({ payload }, { call, put }) {
      const { response } = yield call(capaAbilityRq, payload);
      if (response.ok) {
        const { twAbilityView = [] } = response.datum;
        yield put({
          type: 'updateForm',
          payload: {
            ...response.datum,
            twAbilityView,
          },
        });
        return response;
      }
      createMessage({
        type: 'error',
        description: response.reason || '获取适岗考核能力考核点失败',
      });
      return {};
    },
    *query({ payload }, { call, put }) {
      const { date, trnCurProg, resType, ...params } = payload;
      const newParams = {
        ...params,
        startDate: Array.isArray(date) ? date[0] : '',
        endDate: Array.isArray(date) ? date[2] : '',
        resType1: Array.isArray(resType) ? resType[0] : '',
        resType2: Array.isArray(resType) ? resType[1] : '',
      };

      const { response } = yield call(fitCheckListRq, newParams);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    *cancel({ payload }, { call, put, select }) {
      const { response } = yield call(fitCheckListCancelRq, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '取消成功' });
        const { searchForm } = yield select(({ fitCheck }) => fitCheck);
        yield put({
          type: 'query',
          payload: searchForm,
        });
      } else {
        createMessage({ type: 'warn', description: response.reason || '取消失败' });
      }
    },
    *delete({ payload }, { call, put, select }) {
      const { response } = yield call(fitCheckDelRq, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        const { searchForm } = yield select(({ fitCheck }) => fitCheck);
        yield put({
          type: 'query',
          payload: searchForm,
        });
      } else {
        createMessage({ type: 'warn', description: response.reason || '删除失败' });
      }
    },
    // 分类一关联分类二
    *typeChange({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:RES_TYPE2',
        parentDefId: 'RES:RES_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { type2: Array.isArray(response) ? response : [] },
        });
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
