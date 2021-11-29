import {
  activeRes,
  createBuResInfo,
  editBuResInfo,
  queryBuResList,
  queryBuResRoleInfo,
  saveResRole,
} from '@/services/org/bu/component/buResInfo';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';
// import { convertCode } from '@/components/core/I18n/convert';
import { fromQs } from '@/utils/stringUtils';

export default {
  namespace: 'buResInfoLinmon',

  state: {
    formData: {},
    searchForm: {},
    listTableData: [],
    roleTableData: [],
    pageConfig: {},
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      const { formData } = yield select(({ buResInfoLinmon }) => buResInfoLinmon);
      const { response } = yield call(queryBuResList, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            listTableData: Array.isArray(response.datum) ? response.datum : [],
            formData: {
              ...formData,
              buId: payload.buId,
            },
          },
        });
      }
    },

    *updateBasic({ payload }, { call, put, select }) {
      const { key, value } = payload;
      const { formData } = yield select(({ buResInfoLinmon }) => buResInfoLinmon);
      const newFormData = Object.assign({}, formData);
      newFormData[key] = value;

      yield put({
        type: 'updateState',
        payload: { formData: newFormData },
      });
    },

    *createResInfo({ payload }, { call, put, select }) {
      const { formData } = yield select(({ buResInfoLinmon }) => buResInfoLinmon);
      const { buId } = formData;
      formData.dateFrom = formData.dateFrom ? formData.dateFrom.format('YYYY-MM-DD') : null;
      formData.dateTo = formData.dateTo ? formData.dateTo.format('YYYY-MM-DD') : null;
      const { response, status } = yield call(createBuResInfo, buId, formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({
          type: 'query',
          payload: { buId },
        });
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },

    *editBuResInfo({ payload }, { call, put, select }) {
      const { formData } = yield select(({ buResInfoLinmon }) => buResInfoLinmon);
      const { buId } = formData;

      if (formData.dateFrom && typeof formData.dateFrom !== 'string') {
        formData.dateFrom = formData.dateFrom.format('YYYY-MM-DD');
      }

      if (formData.dateTo && typeof formData.dateTo !== 'string') {
        formData.dateTo = formData.dateTo.format('YYYY-MM-DD');
      }

      const { response, status } = yield call(editBuResInfo, formData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({
          type: 'query',
          payload: { buId },
        });
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },

    *queryBuResRoleInfo({ payload }, { call, put, select }) {
      const { response } = yield call(queryBuResRoleInfo, payload);
      // eslint-disable-next-line
      yield put({
        type: 'updateState',
        payload: { roleTableData: Array.isArray(response.datum) ? response.datum : [] },
      });
    },
    *saveResRole({ payload }, { call, put }) {
      const { buId, buResId, roleTableData, delroleTableData } = payload;

      const { response, status } = yield call(saveResRole, buId, buResId, {
        roleTableData,
        delroleTableData,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({
          type: 'query',
          payload: {
            buId: fromQs().buId,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason });
      }
    },
    // 批量激活资源
    *activeRes({ payload }, { put, call }) {
      const { response, status } = yield call(activeRes, { ids: payload.ids });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '激活成功' });
        yield put({ type: 'query', payload: { buId: payload.buId } });
      } else {
        createMessage({ type: 'error', description: response.reason || '激活失败' });
      }
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
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
  },
};
