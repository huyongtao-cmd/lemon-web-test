import { queryEvalMainId, queryEvalMainList, saveEvalMain } from '@/services/sys/baseinfo/eval';
import createMessage from '@/components/core/AlertMessage';

const defaultFormData = {
  id: null,
  evalClass: '',
  evalType: '',
  evalDesc: '',
  pointIds: [],
  itemList: [],
};

export default {
  namespace: 'sysEvalMain',

  state: {
    dataSource: [],
    searchForm: {},
    total: null,
    formData: defaultFormData,
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryEvalMainList, payload);
      if (status === 100) return;
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
          },
        });
      }
    },
    *clean({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
        },
      });
    },
    *submit({ payload }, { call, put, select }) {
      const { formData, searchForm } = yield select(({ sysEvalMain }) => sysEvalMain);
      const { status, response } = yield call(saveEvalMain, formData);
      if (status === 100) return false;
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({
          type: 'query',
          payload: searchForm,
        });
        return true;
      }
      createMessage({ type: 'error', description: '[评价类别，评价类型]组合不能重复' });
      return false;
    },
    // 单条详情
    *infoById({ payload }, { call, put }) {
      const { status, response } = yield call(queryEvalMainId, payload);
      if (status === 100) return;
      if (response.ok) {
        const data = response.datum || {};
        const itemList = data.itemList || [];
        const pointIds = [];
        itemList.forEach(v => pointIds.push(v.id + ''));
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...data,
              pointIds,
            },
          },
        });
      } else {
        createMessage({ type: 'error', description: '查询失败' });
      }
    },
  },

  reducers: {
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
  },
};
