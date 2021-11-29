import {
  queryEvalPointId,
  queryEvalPointList,
  saveEvalPoint,
  changeStatus,
} from '@/services/sys/baseinfo/eval';
import createMessage from '@/components/core/AlertMessage';

const defaultFormData = {
  id: null,
  evalPoint: '',
  evalStatus: 'ACTIVE',
  evalScore: [],
  scoreFrom: '',
  scoreTo: '',
  standardDesc: '',
};

export default {
  namespace: 'sysEvalPoint',

  state: {
    dataSource: [],
    searchForm: {},
    total: null,
    formData: defaultFormData,
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryEvalPointList, payload);
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
      const { formData, searchForm } = yield select(({ sysEvalPoint }) => sysEvalPoint);
      const parm = {
        ...formData,
        scoreFrom: formData.evalScore[0],
        scoreTo: formData.evalScore[1],
      };
      delete parm.evalScore;
      const { status, response } = yield call(saveEvalPoint, parm);
      if (status === 100) return false;
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({
          type: 'query',
          payload: searchForm,
        });
        return true;
      }
      createMessage({ type: 'error', description: '评价点不可重复' });
      return false;
    },
    // 单条详情
    *infoById({ payload }, { call, put }) {
      const { status, response } = yield call(queryEvalPointId, payload);
      if (status === 100) return;
      if (response.ok) {
        const data = response.datum || {};
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...data,
              evalScore: [data.scoreFrom, data.scoreTo],
            },
          },
        });
      } else {
        createMessage({ type: 'error', description: '查询失败' });
      }
    },
    *status({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ sysEvalPoint }) => sysEvalPoint);
      const { status, response } = yield call(changeStatus, payload);
      if (status === 100) return;
      if (response.ok) {
        createMessage({ type: 'success', description: '状态修改成功' });
        yield put({
          type: 'query',
          payload: searchForm,
        });
      } else {
        createMessage({ type: 'error', description: '状态修改失败' });
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
