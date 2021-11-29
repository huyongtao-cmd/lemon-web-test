import {
  messageShieldingListUriRq,
  messageShieldingDeleteUriRq,
  messageShieldingInsertUriRq,
  queryRelaeseSourceUriRq,
} from '@/services/sys/system/messageConfiguration';
import { selectIamUsers } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

const defaultFormData = {};
const defaultSearchForm = {};
export default {
  namespace: 'messageConfigShielding',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    formData: defaultFormData,
    resDataSource: [],
    releaseSourceData: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(messageShieldingListUriRq, payload);
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
    // 用户
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectIamUsers);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resDataSource: list,
        },
      });
    },
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(messageShieldingDeleteUriRq, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        const { searchForm } = yield select(({ messageConfigShielding }) => messageConfigShielding);
        yield put({
          type: 'query',
          payload: {
            ...searchForm,
            personalFlag: false,
          },
        });
      } else if (status === 100) {
        // 主动取消请求，不做操作
      } else {
        createMessage({ type: 'error', description: '删除失败' });
      }
    },
    *queryReleaseSource({ payload }, { call, put }) {
      const { response } = yield call(queryRelaeseSourceUriRq);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          releaseSourceData: list,
        },
      });
    },
    *save({ payload }, { call, put, select }) {
      const { formData, searchForm } = yield select(
        ({ messageConfigShielding }) => messageConfigShielding
      );
      const { userIds } = formData;
      formData.userIds = Array.isArray(userIds) ? userIds.join(',') : userIds;
      const { status, response } = yield call(messageShieldingInsertUriRq, formData);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto(`/sys/system/MessageConfig/shielding`);
          yield put({
            type: 'query',
            payload: {
              ...searchForm,
              personalFlag: false,
            },
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
