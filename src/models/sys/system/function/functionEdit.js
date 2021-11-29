import createMessage from '@/components/core/AlertMessage';

import {
  systemFunctionCreate,
  systemFunctionModify,
  systemFunctionDetail,
} from '@/services/sys/system/function';

import { closeThenGoto } from '@/layouts/routerControl';
import { findNavsById } from '@/services/sys/iam/roles';
import { sortPropAscByNumber } from '@/utils/dataUtils';
import { plainToTree } from '@/components/common/TreeTransfer';

const defaultStructure = {
  id: 'code',
  pid: 'pcode',
  children: 'children',
  selected: 'checked',
};

export default {
  namespace: 'systemFunctionEdit',
  state: {
    formData: {},
    navTree: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(systemFunctionDetail, payload);
      if (status === 200) {
        let linkNav;
        if (response.linkNav) {
          linkNav = response.linkNav.split(',').filter(link => link && link.length > 0);
        }
        yield put({
          type: 'updateState',
          payload: {
            formData: { ...response, linkNav },
          },
        });
        yield put({ type: 'queryList', payload });
      }
    },

    *queryList({ payload }, { call, put }) {
      const { response } = yield call(findNavsById, 'BU_ALL_PIC');
      if (response) {
        const navList = Array.isArray(response) ? response : [];
        const navListSorted = sortPropAscByNumber('tcode')(navList);
        const navTree = plainToTree(navListSorted, defaultStructure).tree;
        yield put({
          type: 'updateState',
          payload: {
            navTree,
          },
        });
      }
    },

    *save({ payload }, { call, put }) {
      let response;
      if (payload.id) {
        response = yield call(systemFunctionModify, payload);
      } else {
        // 新增
        response = yield call(systemFunctionCreate, payload);
      }
      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        // 保存成功
        yield put({
          type: 'updateState',
          payload: {
            formData: {},
          },
        });
        closeThenGoto(`/sys/system/function`);
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
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
    clearForm(state, { payload }) {
      return {
        ...state,
        formData: {},
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
