import {
  messageTagListUriRq,
  messageTagDeleteUriRq,
  messageTagInsertUriRq,
} from '@/services/sys/system/messageConfiguration';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

const defaultSearchForm = {};
const defaultFormData = {};

export default {
  namespace: 'messageConfigTag',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    formData: defaultFormData,
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ messageConfigTag }) => messageConfigTag);
      const { status, response } = yield call(messageTagListUriRq, {
        ...payload,
        tagName: searchForm.messageTagName,
      });
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(messageTagDeleteUriRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          const { searchForm } = yield select(({ messageConfigTag }) => messageConfigTag);
          yield put({
            type: 'query',
            payload: searchForm,
          });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '删除失败' });
      }
    },
    *save({ payload }, { call, put, select }) {
      const { formData, searchForm } = yield select(({ messageConfigTag }) => messageConfigTag);
      const { status, response } = yield call(messageTagInsertUriRq, {
        ...formData,
        tagName: formData.messageTagName,
      });
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto(`/sys/system/MessageConfig/tagManage`);
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
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
          selectedRowKeys: [],
        },
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
    cleanFormData(state, action) {
      return {
        ...state,
        formData: {
          ...defaultFormData,
        },
      };
    },
  },
};
