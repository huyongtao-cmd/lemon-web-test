import { findResProExp, saveResProExp, deleteResProExp } from '@/services/plat/res/resprofile';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';

export default {
  namespace: 'platResProfileProjectExperience',

  state: {
    total: 0,
    dataSource: [],
    proExpSofarFlag: false,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findResProExp, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },

    *save({ payload }, { call, put, select }) {
      const { proExpSofarFlag } = yield select(
        ({ platResProfileProjectExperience }) => platResProfileProjectExperience
      );
      const { formData } = payload;
      if (formData.date && typeof formData.date[0] !== 'string') {
        formData.dateFrom = formData.date[0].format('YYYY-MM-DD HH:mm:ss');
      }
      if (formData.date && typeof formData.date[1] !== 'string') {
        formData.dateTo = formData.date[1].format('YYYY-MM-DD HH:mm:ss');
      }
      if (proExpSofarFlag) {
        formData.dateTo = null;
      }

      const { status, response } = yield call(saveResProExp, formData);

      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        const { id } = fromQs();
        yield put({
          type: 'query',
          payload: { resId: id },
        });
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },

    *delete({ payload }, { call, put }) {
      const { status, response } = yield call(deleteResProExp, payload);

      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        const { id } = fromQs();
        yield put({
          type: 'query',
          payload: { resId: id },
        });
      } else {
        createMessage({ type: 'error', description: '删除失败' });
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
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
