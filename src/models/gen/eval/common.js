/* eslint-disable no-unneeded-ternary */
import { queryEvalInfo, submitEval } from '@/services/gen/eval';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';

/**
 * 系统用户信息状态
 */
export default {
  namespace: 'evalCommonModal',

  state: {
    formData: {
      itemList: [],
      evalDEntities: [],
    },
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(queryEvalInfo, payload);
      const { sourceId } = payload;
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        const data = response.datum || {};
        const evalDEntities = [];
        data.itemList.forEach((v, i) => {
          evalDEntities.push({
            evalItemId: v.id,
            evalScore: v.defaultScore,
            evalComment: null,
          });
        });
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...data,
              evalDEntities,
              sourceId,
            },
          },
        });
      }
    },
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ evalCommonModal }) => evalCommonModal);
      formData.evalDEntities.forEach((v, i) => {
        formData.evalDEntities[i].evalComment = formData['evalComment' + i];
        formData.evalDEntities[i].evalScore =
          formData['evalScore' + i] || +formData.itemList[i].defaultScore;
        formData.evalDEntities[i].inapplicable = formData['inapplicable' + i] ? true : false;
      });

      const parm = {
        evalDEntities: formData.evalDEntities,
        evalMasId: formData.evalMasId,
        sourceId: formData.sourceId,
        evalerResId: formData.evalerResId,
        evaledResId: formData.evaledResId,
        evalComment: formData.evalComment,
        evalClass: formData.evalClass,
        evalStatus: payload ? 'EVALUATED' : 'IGNORE',
        projId: formData.projId,
        taskId: formData.taskId,
        activityId: formData.activityId,
      };
      const { status, response } = yield call(submitEval, parm);

      if (status === 100) return false;
      if (response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        return true;
      }
      createMessage({ type: 'error', description: response.reason || '提交失败' });
      return false;
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
