import { saveFeedbackInfoHandle } from '@/services/plat/feedback';
import { getCmsInfo } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import router from 'umi/router';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'issueFeedback',

  state: {
    formData: { problemTitle: null, problemType: null },
    btnCanUse: true,
    cmsInfo: '',
  },

  effects: {
    *query({ payload }, { call, put }) {
      const response = yield call(getCmsInfo, 'BACK_HELP');
      const responseCms = response.response;
      if (responseCms && responseCms.ok) {
        yield put({
          type: 'updateState',
          payload: {
            cmsInfo: responseCms.datum ? responseCms.datum.contents : '',
          },
        });
      }
    },
    *save({ payload }, { call, put }) {
      const { response } = yield call(saveFeedbackInfoHandle, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '反馈成功' });
        yield put({
          type: 'updateState',
          payload: { btnCanUse: true },
        });
        closeThenGoto(payload.problemUrl);
      } else {
        yield put({
          type: 'updateState',
          payload: { btnCanUse: true },
        });
        createMessage({ type: 'error', description: '反馈失败' });
      }
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: { problemTitle: null, problemType: null },
        },
      });
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
