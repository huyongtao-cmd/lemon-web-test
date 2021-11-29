/* eslint-disable no-nested-ternary */
import { isEmpty } from 'ramda';
import {
  topListRq,
  topListDetailRq,
  getTopListDetailRq,
  topListSaveRq,
  topListDeleteRq,
  changeShowFlagRq,
  topListdateRq,
  topListdateDetailRq,
} from '@/services/sys/listTopMgmt/listTopMgmt';
import { queryUdc, queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {
  showFlag: null,
};
const defaultFormData = {
  // dataSource: 'SELF_DEF',
  sortMethod: 'LARGE_TO_SMALL',
};

export default {
  namespace: 'listTopMgmt',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    formData: defaultFormData,
    getTopListByDataSource: [],
    getTopListByDataSourceDelList: [],
    transformData: [],
    topList: [],
    topListView: {
      list: [],
      list2: [],
    },
    customDataList: [],
    customDataDelList: [],
    showTopList: [],
    showTopDelList: [],
    udcList: [],
  },

  effects: {
    *queryUdcList({ payload }, { call, put }) {
      const { response } = yield call(queryUdc, payload.code);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          udcList: list,
        },
      });
    },
    *topListdateDetail({ payload }, { call, put }) {
      const { status, response } = yield call(topListdateDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              topListView: response.datum,
            },
          });
          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        return {};
      }
      return {};
    },
    *topListdate({ payload }, { call, put }) {
      const { status, response } = yield call(topListdateRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              topList: Array.isArray(response.datum) ? response.datum : [],
            },
          });
        } else {
          createMessage({ type: 'error', description: '获取数据失败' });
        }
      } else {
        createMessage({ type: 'error', description: '获取数据失败' });
      }
    },
    *changeShowFlag({ payload }, { call, select, put }) {
      const { status, response } = yield call(changeShowFlagRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const { searchForm } = yield select(({ listTopMgmt }) => listTopMgmt);
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          createMessage({ type: 'error', description: '操作失败' });
        }
      } else {
        createMessage({ type: 'error', description: '操作失败' });
      }
    },
    *submit({ payload }, { call, put, select }) {
      const {
        formData,
        getTopListByDataSource,
        getTopListByDataSourceDelList,
        customDataList,
        customDataDelList,
        showTopList,
        showTopDelList,
      } = yield select(({ listTopMgmt }) => listTopMgmt);

      formData.twpsCdsUdcValEntity = getTopListByDataSource;

      formData.findTwTopListDList = showTopList;
      formData.deleteKeys = showTopDelList;

      if (formData.dataSource === 'SELF_DEF') {
        formData.list = customDataList;
        formData.deleteKeyValues = getTopListByDataSourceDelList;

        formData.list2 = getTopListByDataSource;
        formData.deleteKeyGroupNo = customDataDelList;
      }

      const { status, response } = yield call(topListSaveRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *getTopListDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(getTopListDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return [];
      }
      if (status === 200) {
        // 如果配置中不包含SORT_VAL属性，将不能使用该配置
        if (!response.filter(v => v.type === 'SORT_VAL').length) {
          createMessage({ type: 'error', description: '配置中不包含SORT_VAL，使用该配置！' });
          yield put({
            type: 'updateForm',
            payload: {
              dataSource: null,
            },
          });
          return [];
        }

        yield put({
          type: 'updateState',
          payload: {
            getTopListByDataSource: Array.isArray(response) ? response : [],
          },
        });
        return Array.isArray(response) ? response : [];
      }
      createMessage({ type: 'error', description: response.reason || '拉取配置信息失败' });
      return [];
    },
    *query({ payload }, { call, put }) {
      const { date, publieEndDate, ...params } = payload;
      if (Array.isArray(date) && (date[0] || date[1])) {
        [params.startDate, params.endDate] = date;
      }
      if (Array.isArray(publieEndDate) && (publieEndDate[0] || publieEndDate[1])) {
        [params.publieEndStartDate, params.publieEndDateEnd] = publieEndDate;
      }

      const { response } = yield call(topListRq, params);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
    },
    *topListDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(topListDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateForm',
            payload: response.datum || {},
          });
          yield put({
            type: 'updateState',
            payload: {
              getTopListByDataSource: Array.isArray(response.datum.list2)
                ? response.datum.list2
                : [],
              customDataList: Array.isArray(response.datum.list) ? response.datum.list : [],
              showTopList: Array.isArray(response.datum.findTwTopListDViewList)
                ? response.datum.findTwTopListDViewList
                : [],
            },
          });
          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        return {};
      }
      return {};
    },
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(topListDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          const { searchForm } = yield select(({ listTopMgmt }) => listTopMgmt);
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '删除失败' });
        }
      }
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          searchForm: {
            ...defaultSearchForm,
            selectedRowKeys: [],
          },
        },
      });
    },
    *cleanFormData(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
          getTopListByDataSource: [],
          transformData: [],
          customDelList: [],
          customDataList: [],
          customDataDelList: [],
          showTopList: [],
          showTopDelList: [],
        },
      });
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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
  },
};
