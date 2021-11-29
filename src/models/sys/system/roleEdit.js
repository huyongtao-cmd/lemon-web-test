import { pick } from 'ramda';
import {
  findRoleById,
  update,
  findNavsById,
  updateRoleNavs,
  updateRoleRaabs,
} from '@/services/sys/iam/roles';
import { plainToTree } from '@/components/common/TreeTransfer';
import createMessage from '@/components/core/AlertMessage';
import { sortPropAscByNumber } from '@/utils/dataUtils';
import { queryTenantMenu } from '@/services/gen/app';

const defaultStructure = {
  id: 'code',
  pid: 'pcode',
  children: 'children',
  selected: 'checked',
};

export default {
  namespace: 'sysroleEdit',

  state: {
    navTree: [],
    tree: [],
    navChekcedKeys: [],
    raabCodes: [],
    formData: {
      builtIn: undefined,
      code: undefined,
      disabled: undefined,
      name: undefined,
      navs: undefined,
      pcode: undefined,
      raabs: undefined,
      remark: undefined,
    },
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const { response } = yield call(findRoleById, payload.id);
      if (response) {
        yield put({ type: 'queryList', payload });
        yield put({
          type: 'updateState',
          payload: {
            formData: response || {},
            raabCodes: Array.isArray(response.raabs) ? response.raabs.map(r => r.code) : [],
          },
        });
      }
    },
    *queryList({ payload }, { call, put }) {
      const { response } = yield call(findNavsById, payload.id);
      if (response) {
        const navList = Array.isArray(response) ? response : [];
        const navListSorted = sortPropAscByNumber('tcode')(navList);
        const navChekcedKeys = navListSorted.filter(nav => nav.checked).map(nav => nav.code);
        const navTree = plainToTree(navListSorted, defaultStructure).tree;
        yield put({
          type: 'updateState',
          payload: {
            navTree,
            navChekcedKeys,
          },
        });
      }
    },
    *save({ payload }, { call, put, select }) {
      const realPayload = pick(['name', 'remark'], payload);
      // 编辑的保存方法
      const data = yield call(update, payload.code, realPayload);
      if (data.status === 200) {
        createMessage({ type: 'success', description: '提交成功' });
      } else if (data.status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '提交失败' });
      }
    },
    *saveNavs({ payload }, { call, put }) {
      const { id, navCodes } = payload;
      const data = yield call(updateRoleNavs, id, navCodes);
      if (data.status === 200) {
        createMessage({ type: 'success', description: '提交成功' });
      } else if (data.status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '提交失败' });
      }
    },
    *saveRaabs({ payload }, { call, put }) {
      const { id, raabCodes } = payload;
      const data = yield call(updateRoleRaabs, id, raabCodes);
      if (data.status === 200) {
        createMessage({ type: 'success', description: '提交成功' });
      } else if (data.status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '提交失败' });
      }
    },
    // 在刷新页面之前将form表单里的数据置为空
    *clean({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          navTree: [],
          navChekcedKeys: [],
          raabCodes: [],
          formData: {
            builtIn: undefined,
            code: undefined,
            disabled: undefined,
            name: undefined,
            navs: undefined,
            pcode: undefined,
            raabs: undefined,
            remark: undefined,
          },
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
