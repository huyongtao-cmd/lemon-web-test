import { findLevelById, querylevels, saveLevel } from '@/services/plat/capa/level';

const emptyFormData = {
  id: null,
  levelNo: '',
  levelName: '',
  levelStatus: 'ACTIVE',
  defFlag: 0,
};

export default {
  namespace: 'platCapaLevel',

  state: {
    // 查询系列
    searchForm: {},
    dataSource: [],
    total: 0,
    // 编辑系列
    formData: {
      ...emptyFormData,
      leveldEntities: [],
    },
  },

  effects: {
    *query({ payload }, { call, put }) {
      const {
        response: { rows, total },
      } = yield call(querylevels, payload);
      // console.log('query rows ->', rows);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total,
        },
      });
    },
    *save({ payload }, { call, put }) {
      // 这都直接传出去了，还走 saga 干嘛啊……直接 view 层面 request 不就完事了嘛 ：）
      const { status, response } = yield call(saveLevel, payload);
      return { status, response };
    },
    // 修改form表单字段内容，将数据保存到state
    *updateForm({ payload }, { put, select }) {
      const { key, value } = payload;
      const { formData } = yield select(({ platCapaLevel }) => platCapaLevel);
      const newFormData = Object.assign({}, formData);
      newFormData[key] = value;
      yield put({
        type: 'updateState',
        payload: { formData: newFormData },
      });
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...emptyFormData,
            leveldEntities: [],
          },
        },
      });
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
      history.listen(location => {});
    },
  },
};
