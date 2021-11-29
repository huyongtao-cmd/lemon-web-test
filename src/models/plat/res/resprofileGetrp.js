import {
  findResGetrpList,
  getrpCreate,
  getrpUpdate,
  deleteGetrps,
} from '@/services/plat/res/resprofile';
import { createNotify } from '@/components/core/Notify';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'platResProfileGetrp',

  state: {
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findResGetrpList, payload);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },

    *delete({ payload }, { put, call }) {
      yield call(deleteGetrps, payload.id);
      yield put({ type: 'query', payload: payload.queryParams });
    },
    *getrpSave({ payload }, { call, select }) {
      const { getrpFormData } = payload;
      if (getrpFormData.obtainTime && typeof getrpFormData.obtainTime !== 'string') {
        getrpFormData.obtainTime = getrpFormData.obtainTime.format('YYYY-MM-DD');
      }
      if (getrpFormData.expireDate && typeof getrpFormData.expireDate !== 'string') {
        getrpFormData.expireDate = getrpFormData.expireDate.format('YYYY-MM-DD');
      }
      if (getrpFormData.id) {
        // 编辑的保存方法
        const { status, response } = yield call(getrpUpdate, getrpFormData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      } else {
        // 新增的保存方法
        const { status, response } = yield call(getrpCreate, getrpFormData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
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
