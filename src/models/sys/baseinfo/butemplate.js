import {
  findButemplates,
  deleteButemplate,
  updateButempStatus,
} from '@/services/sys/baseinfo/butemplate';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'sysButemplate',

  state: {
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findButemplates, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    // 删除
    *delete({ payload }, { put, call }) {
      const { status, response } = yield call(deleteButemplate, payload.id);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: payload.queryParams });
      } else {
        createMessage({ type: 'error', description: response.reason });
      }
    },
    // 激活ACTIVE/不激活INACTIVE
    *active({ payload }, { put, call }) {
      const { statu, row, queryParams } = payload;

      const tmplNames =
        row && row.length
          ? row.filter(item => item.tmplStatus === statu).map(value => value.tmplName)
          : [];
      if (tmplNames.length > 0) {
        statu === 'ACTIVE'
          ? createMessage({
              type: 'error',
              description: tmplNames.join('、') + '模板已经是有效状态',
            })
          : createMessage({
              type: 'error',
              description: tmplNames.join('、') + '模板不是有效状态，不能设为无效状态',
            });
        return;
      }
      yield call(updateButempStatus, payload);
      yield put({ type: 'query', payload: queryParams });
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
