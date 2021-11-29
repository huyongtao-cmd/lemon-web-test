import {
  findMyAccList,
  findAbAccList,
  abAccByResCreate,
  abAccByResUpdate,
  deleteAbAccs,
} from '@/services/sys/baseinfo/abacc';
import { submitRes } from '@/services/plat/res/resprofile';
import { createNotify } from '@/components/core/Notify';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

export default {
  namespace: 'platResProfileFinance',

  state: {
    abAccDataSource: [],
    abAccTotal: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findAbAccList, payload);

      yield put({
        type: 'updateState',
        payload: {
          abAccDataSource: Array.isArray(response.rows) ? response.rows : [],
          abAccTotal: response.total,
        },
      });
    },
    *queryInfo({ payload }, { call, put }) {
      const { response } = yield call(findMyAccList);

      yield put({
        type: 'updateState',
        payload: {
          abAccDataSource: Array.isArray(response.rows) ? response.rows : [],
          abAccTotal: response.total,
        },
      });
    },
    *delete({ payload }, { put, call }) {
      yield call(deleteAbAccs, payload.id);
      yield put({ type: 'query', payload: payload.queryParams });
    },
    *abAccSave({ payload }, { call, select }) {
      const { abAccFormData } = payload;
      let flag = true;
      if (abAccFormData.id) {
        // 编辑的保存方法
        const { status, response } = yield call(abAccByResUpdate, abAccFormData);
        if (status === 100) {
          // 主动取消请求
          return false;
        }
        if (response.ok) {
          if (response.datum.errorCode) {
            createMessage({ type: 'error', description: response.datum.errorCode });
            flag = false; // 标识 默认账号已存在提示
          } else {
            createMessage({ type: 'success', description: '保存成功' });
          }
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      } else {
        // 新增的保存方法
        const { status, response } = yield call(abAccByResCreate, abAccFormData);
        if (status === 100) {
          // 主动取消请求
          return false;
        }
        if (response.ok) {
          if (response.datum.errorCode) {
            createMessage({ type: 'error', description: response.datum.errorCode });
            flag = false; // 标识 默认账号已存在提示
          } else {
            createMessage({ type: 'success', description: '保存成功' });
          }
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      }
      return flag;
    },
    // 提交按钮事件
    *submit({ payload }, { call, select }) {
      const { status, response } = yield call(submitRes, { resId: payload.resId });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto('/hr/res/profile/list');
      } else {
        createMessage({ type: 'error', description: '保存失败' });
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
