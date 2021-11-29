import { querySystemMenu } from '@/services/gen/app';
import {
  navTenantListPaging,
  tenantListPaging,
  navTenantManage,
} from '@/services/sys/system/tenant';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

const toFlatMenus = (flatMenus, menus) => {
  menus.forEach(item => {
    // eslint-disable-next-line no-param-reassign
    flatMenus[item.code] = item;
    if (item.children && item.children.length > 0) {
      toFlatMenus(flatMenus, item.children);
    }
  });
};

export default {
  namespace: 'navTenantManage',
  state: {
    tree: [],
    tenants: [],
    navTenants: [],
    defaultSelectedKeys: [' '],
    checkedKeys: [],
    allCheckedKeys: [],
    flatMenus: {},
  },

  effects: {
    *getTree({ payload }, { call, put }) {
      const { status, response } = yield call(querySystemMenu, payload);
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
      const flatMenus = {};
      toFlatMenus(flatMenus, response || []);
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
            flatMenus,
          },
        });
      }
    },

    *getTenants({ payload }, { call, put }) {
      const { status, response } = yield call(tenantListPaging, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            tenants: response.rows || [],
          },
        });
      }
    },

    *onTenantChange({ payload }, { call, put }) {
      const { tenantId, flatMenus } = payload;
      yield put({
        type: 'updateState',
        payload: {
          tenantId,
        },
      });
      if (tenantId) {
        const { status, response } = yield call(navTenantListPaging, { tenantId, limit: 0 });

        if (status === 200) {
          // const flatMenus = [];
          // toFlatMenus(flatMenus,response.rows);
          // const checkedKeys = response.rows.map(item=>item.code);
          const checkedKeys = response.rows
            .filter(item => {
              const menu = flatMenus[item.code];
              return menu && (!menu.children || menu.children.length === 0);
            })
            .map(item => item.code);
          const allCheckedKeys = response.rows.map(item => item.code);
          yield put({
            type: 'updateState',
            payload: {
              navTenants: response.rows || [],
              checkedKeys: checkedKeys || [],
              allCheckedKeys,
            },
          });
        }
      } else {
        yield put({
          type: 'updateState',
          payload: {
            navTenants: [],
            checkedKeys: [],
            allCheckedKeys: [],
          },
        });
      }
    },

    *save({ payload }, { call, put, select }) {
      const { tenantId, allCheckedKeys, flatMenus } = payload;
      if (!tenantId) {
        createMessage({ type: 'warn', description: '请选择租户' });
        return;
      }
      const response = yield call(navTenantManage, payload);
      if (response.response && response.response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        // 保存成功
        yield put({
          type: 'getTree',
        });
        yield put({
          type: 'onTenantChange',
          payload: {
            tenantId,
            flatMenus,
          },
        });
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
