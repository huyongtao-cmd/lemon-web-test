import { getPageScene, deletePageScene } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {
  sceneKey: null,
  sceneName: null,
};
const defaultFilters = {
  offset: 0,
  limit: 10,
  sceneKey: null,
  sceneName: null,
};

export default {
  namespace: 'businessSceneManage',
  state: {
    searchForm: defaultSearchForm,
    dataSource: [],
    filters: defaultFilters,
    total: null,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(getPageScene, payload);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
    },
    *delete({ payload }, { call, put }) {
      const { status, response } = yield call(deletePageScene, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
      } else {
        createMessage({ type: 'error', description: response.reason || '删除失败' });
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: defaultSearchForm,
      };
    },
    cleanFilters(state, action) {
      return {
        ...state,
        filters: defaultFilters,
      };
    },
  },
};
