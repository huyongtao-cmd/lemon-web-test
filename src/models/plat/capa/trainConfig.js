import {
  queryCourseTree,
  exchangeSortNoHandle,
  addAndUpdateHandle,
  updateStateHandle,
  deleteClassHandle,
} from '@/services/plat/capa/train';
import createMessage from '@/components/core/AlertMessage';

const defaultTreeData = [
  {
    title: '全部',
    key: -1,
    id: -1,
    sort: 1,
    children: [],
  },
];

export default {
  namespace: 'platTrainConfig',
  state: {
    treeData: defaultTreeData,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryCourseTree, { entryClass: 'TRAINING' });
      if (response) {
        const cleanTreeData = data => {
          const newData = data.map(item => {
            const newItem = Object.assign({}, item);
            newItem.title = item.className;
            newItem.key = item.id;
            newItem.sort = item.sortNo;
            newItem.disabled = item.classStatus === 'NOT_USED';
            newItem.children = item.child;
            if (item.child && item.child.length > 0) {
              newItem.children = cleanTreeData(item.child);
            }
            return newItem;
          });
          return newData;
        };
        const treeData = [
          {
            title: '全部',
            key: -1,
            id: -1,
            sort: 1,
            children: cleanTreeData(response),
          },
        ];
        yield put({
          type: 'updateState',
          payload: {
            treeData,
          },
        });
      }
    },

    *addAndupdateFn({ payload }, { call, put }) {
      const { id } = payload;
      const params = {
        className: payload.title,
        classStatus: payload.classStatus || 'IN_USE',
      };
      if (payload.id > 0) {
        params.id = id;
      }
      if (payload.id < 0 && payload.id !== -1) {
        params.pid = payload.pid;
      }
      if (payload.id === -1) {
        params.pid = -1;
      }
      const { response } = yield call(addAndUpdateHandle, params);
      const { ok } = response;
      if (!ok) {
        createMessage({ type: 'error', description: response.datum });
      }
      yield put({
        type: 'query',
      });
    },

    *changeSort({ payload }, { call, put }) {
      const { response } = yield call(exchangeSortNoHandle, payload);
      const { ok } = response;
      if (!ok) {
        createMessage({ type: 'error', description: response.datum });
      }
      yield put({
        type: 'query',
      });
    },

    *stopAndStart({ payload }, { call, put }) {
      const { response } = yield call(updateStateHandle, payload);
      const { ok } = response;
      if (!ok) {
        createMessage({ type: 'error', description: response.datum });
      }
      yield put({
        type: 'query',
      });
    },

    *deleteClassFn({ payload }, { call, put }) {
      const { response } = yield call(deleteClassHandle, payload);
      const { ok } = response;
      if (!ok) {
        createMessage({ type: 'error', description: response.datum });
      }
      yield put({
        type: 'query',
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
      return history.listen(({ pathname, search }) => {});
    },
  },
};
