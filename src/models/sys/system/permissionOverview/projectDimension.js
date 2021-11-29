import {
  findRoleById,
  update,
  findNavsById,
  updateRoleNavs,
  updateRoleRaabs,
} from '@/services/sys/iam/roles';
import { relateUsersListUriRq } from '@/services/sys/system/permissionOverview';
import { sortPropAscByNumber } from '@/utils/dataUtils';
import { plainToTree } from '@/components/common/TreeTransfer';

const defaultSearchForm = {};
const defaultStructure = {
  id: 'code',
  pid: 'pcode',
  children: 'children',
  selected: 'checked',
};

export default {
  namespace: 'projectDimension',
  state: {
    searchForm: defaultSearchForm,
    dataSource: [],
    total: 0,
    navTree: [],
  },
  effects: {
    // 功能维度树形菜单
    *findNavsById({ payload }, { call, put }) {
      const { response } = yield call(findNavsById, 'SYS_ADMIN');
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
    // 对应角色及用户
    *query({ payload }, { call, put, select }) {
      const { response } = yield call(relateUsersListUriRq, payload);
      if (response) {
        const { rows, total } = response;
        if (Array.isArray(rows)) {
          rows.forEach((item, index) => {
            // eslint-disable-next-line no-param-reassign
            item.key = index;
          });
        }
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
    },
    *notLoadingQuery({ payload }, { call, put }) {
      const { response } = yield call(relateUsersListUriRq, payload);
      const { rows, total } = response;
      if (Array.isArray(rows)) {
        rows.forEach((item, index) => {
          // eslint-disable-next-line no-param-reassign
          item.key = index;
        });
      }
      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(rows) ? rows : [],
          total,
        },
      });
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          dataSource: [],
          total: 0,
          searchForm: {},
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
        searchForm: {
          ...defaultSearchForm,
        },
      };
    },
  },
};
