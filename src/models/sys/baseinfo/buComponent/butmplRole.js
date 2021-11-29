import {
  findRoles,
  saveRoles,
  // ,
  findBuTmplResSelect,
} from '@/services/sys/baseinfo/butemplate';
import { findRoles as findBuTmplRoleSelect } from '@/services/sys/iam/roles';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'sysButemprole',

  state: {
    roleList: [],
    roleDelIds: [],
    roleSelectList: [],
    resSelectList: [],
  },

  effects: {
    // 查询bu模板角色下拉
    *queryBuTmplRoleSelect({ payload }, { call, put, select }) {
      const response = yield call(findBuTmplRoleSelect, { limit: 0 });
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            roleSelectList: Array.isArray(response.response.rows) ? response.response.rows : [],
          },
        });
      }
    },
    // 查询bu模板资源下拉
    *queryBuTmplResSelect({ payload }, { call, put, select }) {
      const response = yield call(findBuTmplResSelect);
      if (response) {
        yield put({
          type: 'updateState',
          payload: { resSelectList: Array.isArray(response.response) ? response.response : [] },
        });
      }
    },
    // 查询角色信息
    *queryRoleList({ payload }, { call, put }) {
      const { response } = yield call(findRoles, payload);
      if (response) {
        const data = Array.isArray(response.rows) ? response.rows : [];
        const roleDelIds = data.map(item => item.id);
        yield put({
          type: 'updateState',
          payload: { roleList: data, roleDelIds },
        });
      }
    },
    // 保存
    *save({ payload }, { put, call, select }) {
      const { roleDelIds, roleList } = yield select(({ sysButemprole }) => sysButemprole);
      // 把原始数据里被删掉的id找出来
      const list = roleList.filter(v => !!v.roleCode);
      const ids = roleDelIds.filter(d => !list.map(i => i.id).filter(v => v > 0 && v === d).length);
      // 保存接口
      const { status, response } = yield call(saveRoles, { roleList: list, roleDelIds: ids });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({ type: 'queryRoleList', payload });
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
};
