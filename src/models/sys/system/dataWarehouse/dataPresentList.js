import { omit, clone } from 'ramda';
import {
  dataPresentListPaging,
  dataPresentLogicalDelete,
  dataExtractDetail,
} from '@/services/sys/system/dataWarehouse';
import { handleEmptyProps } from '@/utils/objectUtils';
import { fromQs } from '@/utils/stringUtils';

import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {};

export default {
  namespace: 'dataPresentList',
  state: {
    dataPresentEditModalVisible: false,
    currentDataPresent: {},
    searchForm: defaultSearchForm,
    dataSource: [],
    total: undefined,
    extractInfo: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      const param = handleEmptyProps(payload);
      const { response, status } = yield call(dataPresentListPaging, param);

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

    *handleDataColumn({ payload }, { call, put }) {
      const { response, status } = yield call(dataExtractDetail, payload);

      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            extractInfo: response,
          },
        });
      }
    },

    *delete({ payload }, { call, put, select }) {
      const { response, status } = yield call(dataPresentLogicalDelete, payload);
      if (status === 200) {
        const { presentNo } = fromQs();
        createMessage({ type: 'success', description: '成功' });
        const { searchForm } = yield select(({ projectReportList }) => projectReportList);
        yield put({ type: 'query', payload: { ...searchForm, presentNo } });
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
