import { queryTenantMenu } from '@/services/gen/app';
import {
  navTenantDetailByCode,
  navTenantModify,
  navTenantLogicalDelete,
} from '@/services/sys/system/tenant';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

const defaultSearchForm = {};

export default {
  namespace: 'tenantMenu',
  state: {
    tree: [],
    defaultSelectedKeys: [' '],
    formData: {
      edit: false,
      insert: false,
    },
  },

  effects: {
    *getTree({ payload }, { call, put }) {
      const { status, response } = yield call(queryTenantMenu, payload);
      const treeDataMap = tree =>
        tree.map(item => {
          if (item.children) {
            return {
              id: item.code,
              value: item.code,
              key: item.code,
              text: item.name,
              title: item.name,
              child: treeDataMap(item.children),
              children: treeDataMap(item.children),
            };
          }
          return {
            id: item.code,
            value: item.code,
            key: item.code,
            text: item.name,
            title: item.name,
            child: item.children,
            children: item.children,
          };
        });

      const tree = treeDataMap(response);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            tree: [
              {
                id: ' ',
                text: '系统菜单',
                child: tree,
                value: ' ',
                key: ' ',
                title: '系统菜单',
                children: tree,
              },
            ],
          },
        });
      }
    },

    *handleMenuSelectChange({ payload }, { call, put }) {
      const { code } = payload;
      if (code === ' ') {
        yield put({
          type: 'updateForm',
          payload: {
            edit: false,
            insert: false,
            code: ' ',
            name: '系统菜单',
            pcode: undefined,
            portalRoute: undefined,
            idon: undefined,
            tcode: undefined,
          },
        });
        return;
      }
      const { status, response } = yield call(navTenantDetailByCode, payload);

      if (status === 200) {
        yield put({
          type: 'updateForm',
          payload: {
            edit: false,
            insert: false,
            ...response,
            oldCode: response.code,
          },
        });
      }
    },

    *save({ payload }, { call, put, select }) {
      const response = yield call(navTenantModify, payload);
      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        // 保存成功
        yield put({
          type: 'getTree',
        });
        yield put({
          type: 'updateState',
          payload: {
            defaultSelectedKeys: [payload.code],
          },
        });
        yield put({
          type: 'handleMenuSelectChange',
          payload: {
            code: payload.code,
          },
        });
      } else {
        createMessage({ type: 'warn', description: response.response.reason || '保存失败' });
      }
    },

    *delete({ payload }, { call, put, select }) {
      const { response, status } = yield call(navTenantLogicalDelete, payload);
      if (status === 200) {
        createMessage({ type: 'success', description: '成功' });
        yield put({
          type: 'getTree',
        });
        yield put({
          type: 'updateState',
          payload: {
            defaultSelectedKeys: [payload.code],
          },
        });
        yield put({
          type: 'handleMenuSelectChange',
          payload: {
            code: payload.code,
          },
        });
      } else {
        createMessage({ type: 'warn', description: response.reason || '失败' });
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
