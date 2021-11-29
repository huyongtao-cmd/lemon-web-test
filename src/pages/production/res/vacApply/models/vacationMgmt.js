import {
  vacationList,
  vacationDeleteRq,
  vacationUploadRq,
  queryTemporaryTime,
  saveTemporaryTime,
  batchSaveTemporaryTime,
} from '@/services/production/res/vacation';
import createMessage from '@/components/core/AlertMessage';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';

const defaultSearchForm = {};

export default {
  namespace: 'vacationMgmtNew',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    baseBuDataSource: [],
    formData: {},
    selectedKeys: [],
  },

  effects: {
    *upload({ payload }, { call, put, select }) {
      const { status, response } = yield call(vacationUploadRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (!response.ok) {
          return response;
        }
        createMessage({ type: 'success', description: '上传成功' });
        return response;
      }
      return {};
    },
    *baseBU({ payload }, { call, put, select }) {
      const { status, response } = yield call(selectBuMultiCol);
      yield put({
        type: 'updateState',
        payload: {
          baseBuData: Array.isArray(response) ? response : [],
          baseBuDataSource: Array.isArray(response) ? response : [],
        },
      });
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {},
        },
      });
      return {};
    },
    *queryTemporaryTime({ payload }, { call, put }) {
      const { response } = yield call(queryTemporaryTime);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum,
          },
        });
      }
      return {};
    },
    // 参数配置弹窗保存
    *paramConfigSave({ payload }, { call, put, select }) {
      const { formData } = yield select(({ vacationMgmtNew }) => vacationMgmtNew);
      const { status, response } = yield call(saveTemporaryTime, formData);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    // 有效期批量修改
    *batchSave({ payload }, { call, put, select }) {
      const { formData, selectedKeys } = yield select(({ vacationMgmtNew }) => vacationMgmtNew);
      const { status, response } = yield call(batchSaveTemporaryTime, {
        ...formData,
        ids: selectedKeys,
      });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
          selectedRowKeys: [],
        },
        list: [],
        total: 0,
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
