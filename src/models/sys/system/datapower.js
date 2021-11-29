import {
  findDatapowers,
  save,
  cleanDatapower,
  deleteRoleDatapower,
  createRoleDatapower,
} from '@/services/sys/system/datapower';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'sysSystemDatapower',

  state: {
    searchForm: {
      roleKeyWord: null, // 角色
      sourceKeyWord: null, // 功能
    },
    dataSource: [],
    total: 0,
    formData: {
      roleCode: null, // 角色编号
      roleName: null, // 角色名称
      remark: null, // 备注
    },
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findDatapowers, payload);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    // 清除权限缓存
    *cleanDatapower({ payload }, { put, call }) {
      const { status, response } = yield call(cleanDatapower);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '清除成功' });
        yield put({ type: 'query', payload: payload.queryParams });
      } else {
        createMessage({ type: 'error', description: response.reason || '清除失败' });
      }
    },
    // 新增某个角色数据权限
    *add({ payload }, { put, call }) {
      const { status, response } = yield call(createRoleDatapower, payload.formData); // roleCode,strategy
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({ type: 'query', payload: payload.queryParams });
      } else {
        createMessage({ type: 'error', description: response.reason || '失败失败' });
      }
    },
    // 删除某个角色所有数据权限
    *delete({ payload }, { put, call }) {
      const { status, response } = yield call(deleteRoleDatapower, payload.roleCode);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        yield put({ type: 'query', payload: payload.queryParams });
      } else {
        createMessage({ type: 'error', description: response.reason || '删除失败' });
      }
    },
    // 在刷新页面之前将form表单里的数据置为空
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: { finPeriodData: [], jobType2Data: [] },
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

    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
  },
};
