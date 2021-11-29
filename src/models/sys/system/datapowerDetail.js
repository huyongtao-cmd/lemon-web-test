import {
  findDatapowers,
  findDataList,
  save,
  updateDatapowerStatus,
  updateRoleDataStrategy,
  deleteDatapower,
} from '@/services/sys/system/datapower';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {
  sourceKeyWord: undefined,
};

export default {
  namespace: 'sysSystemDatapowerDetail',

  state: {
    dataSource: [],
    total: 0,
    searchForm: defaultSearchForm,
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
    // 行编辑保存 更新权限规则
    *updateStrategy({ payload }, { call, put }) {
      const { id, strategy } = payload;
      if (!id || !strategy) {
        createMessage({ type: 'error', description: '权限配置不能为空' });
        return;
      }
      const { status, response } = yield call(updateRoleDataStrategy, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    // 停用
    *updateStatus({ payload }, { call, put }) {
      const { id, docStatus } = payload;
      const { status, response } = yield call(updateDatapowerStatus, { id, docStatus });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({ type: 'query', payload: payload.queryParams });
      } else {
        createMessage({ type: 'error', description: response.reason || '操作失败' });
      }
    },
    // 删除
    *delete({ payload }, { put, call }) {
      const { status, response } = yield call(deleteDatapower, payload.ids);
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
    // 新增的保存方法
    *datapowerCreate({ payload }, { call, select, put }) {
      const { datapowerFormData } = payload;
      let flag = true;
      const { status, response } = yield call(save, datapowerFormData);
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
        flag = false;
      }

      return flag;
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: defaultSearchForm,
      };
    },
  },
};
