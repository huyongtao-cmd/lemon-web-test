import createMessage from '@/components/core/AlertMessage';

import {
  findFreezeList,
  createUnfreeze,
  modifyUnfreeze,
} from '@/services/user/equivalent/equivalent';
import { closeThenGoto } from '@/layouts/routerControl';
import { clone } from 'ramda';

export default {
  namespace: 'unfreeze',
  state: {
    formData: {},
    dataSource: [],
    total: undefined,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(findFreezeList, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: clone(Array.isArray(response.rows) ? response.rows : []),
            total: response.total,
          },
        });
      }
    },

    *submit({ payload }, { call, put }) {
      let response;
      if (payload.entity.id) {
        response = yield call(modifyUnfreeze, payload);
      } else {
        // 新增
        response = yield call(createUnfreeze, payload);
      }
      if (response.response && response.response.ok) {
        // 保存成功
        closeThenGoto(`/user/flow/process`);
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
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
