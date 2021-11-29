import createMessage from '@/components/core/AlertMessage';

import {
  budgetAppropriationCreate,
  budgetAppropriationModify,
  budgetAppropriationDetail,
  findProjectByIdSimple,
  findFeeBudgetById,
} from '@/services/user/project/project';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'budgetAppropriationEdit',
  state: {
    formData: {},
    projectView: {},
    feebudget: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      let response = {};
      if (payload.id) {
        response = yield call(budgetAppropriationDetail, payload);
      }

      const param = fromQs();
      const budgetId = param.budgetId || response.budgetId;
      const feebudgetResponse = yield call(findFeeBudgetById, { id: budgetId });
      const { feebudget } = feebudgetResponse.response.datum;

      const { response: projectView } = yield call(findProjectByIdSimple, feebudget.projId);
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...response },
          projectView,
          feebudget,
        },
      });
    },

    *save({ payload }, { call, put }) {
      let response;
      if (payload.id) {
        response = yield call(budgetAppropriationModify, payload);
      } else {
        // 新增
        response = yield call(budgetAppropriationCreate, payload);
      }
      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        // 保存成功
        yield put({
          type: 'updateState',
          payload: {
            formData: {},
          },
        });
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
    clearForm(state, { payload }) {
      return {
        ...state,
        formData: {},
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
