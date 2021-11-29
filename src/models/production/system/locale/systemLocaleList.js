import {
  systemLocaleListPaging,
  systemSelectionDetail,
  systemSelectionCreate,
  systemSelectionModify,
  systemSelectionLogicalDelete,
} from '@/services/production/system';
import { querySystemMenuByCode } from '@/services/gen/app';
import { isEmpty } from 'ramda';
import createMessage from '@/components/core/AlertMessage';
import { saveUserTask } from '@/services/user/task/task';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'systemLocaleList',

  state: {
    dataSource: [],
    searchForm: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(systemLocaleListPaging, { ...payload, limit: 0 });
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.data.rows,
          },
        });
      }
    },

    *delete({ payload }, { call, put, select }) {
      const { response } = yield call(systemSelectionLogicalDelete, payload);

      if (response.ok) {
        yield put({
          type: 'query',
          payload: {},
        });
        return;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
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
  },
};
