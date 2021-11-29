import {
  customerListRq,
  changeDistRq,
  customerDetailsRq,
  customerFuzzyListRq,
  signInvalidRq,
  customerUploadRq,
} from '@/services/user/management/customer';
import router from 'umi/router';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { queryCascaderUdc } from '@/services/gen/app';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

const defaultSearchForm = {};

export default {
  namespace: 'customer',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    searchFuzzyForm: defaultSearchForm,
    resDataSource: [],
    cityList: [],
    formData: {},
    fuzzyList: [],
    fuzzyTotal: 0,
    pageConfig: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { category, custStatus } = payload;
      const parmars = {
        ...payload,
        custRegIon: category ? category[0] : '',
        provInce: category ? category[1] : '',
        city: category ? category[2] : '',
        isstats: custStatus ? custStatus[0] : '',
        custStatus: custStatus ? custStatus[1] : '',
      };
      const { status, response } = yield call(customerListRq, parmars);
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
        const message = response.reason || '查询失败';
        createMessage({ type: 'error', description: message });
      }
    },
    *fuzzyQuery({ payload }, { call, put }) {
      const { status, response } = yield call(customerFuzzyListRq, payload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            fuzzyList: Array.isArray(rows) ? rows : [],
            fuzzyTotal: total,
          },
        });
      } else {
        const message = response.reason || '查询失败';
        createMessage({ type: 'error', description: message });
      }
    },
    *signInvalid({ payload }, { call, put, select }) {
      const { status, response } = yield call(signInvalidRq, payload);
      if (status === 200) {
        createMessage({ type: 'success', description: '标记成功' });
        yield put({
          type: 'updateSearchForm',
          payload: {
            selectedRowKeys: [],
          },
        });
        const { searchFuzzyForm } = yield select(({ customer }) => customer);
        yield put({
          type: 'fuzzyQuery',
          payload: searchFuzzyForm,
        });
      } else {
        const message = response.reason || '查询失败';
        createMessage({ type: 'error', description: message });
      }
    },
    *changeDist({ payload }, { call, put, select }) {
      const { status, response } = yield call(changeDistRq, payload);
      if (status === 200) {
        createMessage({ type: 'success', description: response.reason || '更改成功' });
        yield put({
          type: 'updateSearchForm',
          payload: {
            selectedRowKeys: [],
          },
        });
        const { searchForm } = yield select(({ customer }) => customer);
        yield put({
          type: 'query',
          payload: searchForm,
        });
      } else {
        const message = response.reason || '查询失败';
        createMessage({ type: 'error', description: message });
      }
    },
    *customerDetails({ payload }, { call, put }) {
      const { status, response } = yield call(customerDetailsRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          const detail = response.datum ? response.datum : {};
          yield put({
            type: 'updateForm',
            payload: {
              ...detail,
            },
          });
        } else {
          const message = response.reason || '获取详细信息失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resData: list,
          resDataSource: list,
        },
      });
    },
    // 根据省获取市
    *handleChangeCity({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:CITY',
        parentDefId: 'COM:PROVINCE',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { cityList: Array.isArray(response) ? response : [] },
        });
      }
    },

    *upload({ payload }, { call, put, select }) {
      const { status, response } = yield call(customerUploadRq, payload);
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
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
    updateSearchFuzzyForm(state, { payload }) {
      const { searchFuzzyForm } = state;
      const newFormData = { ...searchFuzzyForm, ...payload };
      return {
        ...state,
        searchFuzzyForm: newFormData,
      };
    },
    cleansearchFuzzyForm(state, action) {
      return {
        ...state,
        searchFuzzyForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
      };
    },
  },
};
