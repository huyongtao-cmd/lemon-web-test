/* eslint-disable no-nested-ternary */
import moment from 'moment';
import {
  createCalendarDetail,
  getRegularFeedBackById,
  doRegularFeedBack,
} from '@/services/cservice/regularCare';

export default {
  namespace: 'feedBackRegular',
  state: {
    formData: {},
  },

  effects: {
    *queryDetail({ payload }, { call, put, select }) {
      const { id } = payload;
      const { status, response } = yield call(getRegularFeedBackById, id);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum,
          },
        });
      }
      return {};
    },
    // 保存
    *save({ payload }, { call, put, select }) {
      const { values } = payload;
      const { status, response } = yield call(doRegularFeedBack, { ...values });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
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
