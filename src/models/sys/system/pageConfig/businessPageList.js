import { omit, clone } from 'ramda';
import {
  businessPageListPaging,
  businessPageLogicalDelete,
} from '@/services/sys/system/pageConfig';
import { handleEmptyProps } from '@/utils/objectUtils';

import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {};

const defaultStructure = {
  id: 'code',
  pid: 'pcode',
  children: 'children',
  selected: 'checked',
};

export default {
  namespace: 'businessPageList',
  state: {
    searchForm: defaultSearchForm,
    dataSource: [],
    total: undefined,
    businessPageMainModalVisible: false,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const param = handleEmptyProps(payload);
      const { response, status } = yield call(businessPageListPaging, param);

      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: clone(Array.isArray(response.rows) ? response.rows : []),
            total: response.total,
          },
        });
      }
    },

    *notLoadingQuery({ payload }, { call, put }) {
      const param = handleEmptyProps(payload);
      const { response, status } = yield call(businessPageListPaging, param);

      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: clone(Array.isArray(response.rows) ? response.rows : []),
            total: response.total,
            searchForm: { ...defaultSearchForm, selectedRowKeys: [] }, // 重新查询的时候，记录一下搜索条件，清空一下选中项
          },
        });
      }
    },

    *delete({ payload }, { call, put, select }) {
      const { response, status } = yield call(businessPageLogicalDelete, payload);
      if (status === 200) {
        createMessage({ type: 'success', description: '成功' });
        const { searchForm } = yield select(({ projectReportList }) => projectReportList);
        yield put({ type: 'query', payload: searchForm });
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
          selectedRowKeys: [], // 清空选中项，因为searchForm里面记录了这个东西
        },
      };
    },
  },
};
