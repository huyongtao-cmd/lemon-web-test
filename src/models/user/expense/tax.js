import {
  taxListRq,
  reimNameListRq,
  updateCostRq,
  costrushUploadRq,
} from '@/services/user/expense/expense';
import { queryUserPrincipal } from '@/services/gen/user';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {};

export default {
  namespace: 'taxList',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    resDataSource: [],
    cityList: [],
    formData: {},
    reimNameData: [],
    faileList: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { reimAccountTime, ...params } = payload;
      const { dedDate } = params;
      if (dedDate && typeof dedDate !== 'string') {
        params.dedDate = dedDate.format('YYYY-MM-DD');
      }

      if (
        reimAccountTime &&
        reimAccountTime[0] !== null &&
        typeof reimAccountTime[0] !== 'string'
      ) {
        params.reimAccountTimeStart = reimAccountTime[0].format('YYYY-MM-DD');
      }
      if (
        reimAccountTime &&
        reimAccountTime[1] !== null &&
        typeof reimAccountTime[1] !== 'string'
      ) {
        params.reimAccountTimeEnd = reimAccountTime[1].format('YYYY-MM-DD');
      }

      const { status, response } = yield call(taxListRq, params);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *reimName({ payload }, { call, put }) {
      const { response } = yield call(reimNameListRq);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          reimNameData: list,
        },
      });
    },
    *updateCost({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      const { resId } = response.extInfo || {};
      const params = { dedResId: resId, ...payload };
      const { status: sts, response: resp } = yield call(updateCostRq, params);
      if (sts === 200) {
        if (resp.ok) {
          yield put({
            type: 'updateSearchForm',
            payload: {
              selectedRowKeys: [],
            },
          });
          const { searchForm } = yield select(({ taxList }) => taxList);
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '抵扣失败' });
        }
      }
    },
    *costrushUpload({ payload }, { call, put, select }) {
      const { status, response } = yield call(costrushUploadRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (!response.ok) {
          createMessage({ type: 'error', description: response.reason || '抵扣失败' });
          return response;
        }
        createMessage({ type: 'success', description: '自动抵扣成功' });
        return response;
      }
      return {};
    },
  },

  reducers: {
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
      };
    },
  },
};
