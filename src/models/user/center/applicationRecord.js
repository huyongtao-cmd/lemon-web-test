import createMessage from '@/components/core/AlertMessage';
import { genFakeId } from '@/utils/mathUtils';
import { isEmpty, isNil } from 'ramda';
import { queryCapaSetList, queryCapaListUdcTree, queryCapaList } from '@/services/plat/capa/train';
import { queryCapaInfo } from '@/services/user/growth';
import { queryCapaApprovalHistory } from '@/services/plat/capa/course';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';

export default {
  namespace: 'applicationRecord',

  state: {
    searchForm: {
      apprResult: '',
    },
    dataSource: [],
    total: 0,
    capasetData: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { applyData, apprResult, ability, procNo } = payload;
      const params = {
        ...payload,
      };
      if (applyData) {
        [params.applyDateStart, params.applyDateEnd] = applyData;
        delete params.applyData;
      }
      if (!apprResult) {
        delete params.apprResult;
      }
      if (!ability) {
        delete params.ability;
      }
      if (!procNo) {
        delete params.procNo;
      }
      const { response } = yield call(queryCapaApprovalHistory, params);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
          },
        });
      }
    },
    *getCapaSetList({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryCapaSetList);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            capaSetList: response.datum || [],
          },
        });
      }
    },
    *getCapaUdcTree({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryCapaListUdcTree, payload);
      const capaUdcDataClean = (data, pid) => {
        const newData = data.map(item => {
          const newItem = Object.assign({}, item);
          newItem.title = item.catName;
          newItem.value = item.catCode;
          newItem.key = item.catCode;
          if (pid) {
            newItem.value = item.catCode + '-' + pid;
          }
          if (item.children && item.children.length > 0) {
            newItem.children = capaUdcDataClean(item.children, item.catCode);
          }
          return newItem;
        });
        return newData;
      };
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            capaUdcTree: capaUdcDataClean(response.datum, false) || [],
          },
        });
      }
    },

    *getCapaList({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryCapaList, payload);
      const { datum = [] } = response;
      if (status === 200) {
        const capaList = datum.map(item => {
          const newItem = Object.assign({}, item);
          newItem.code = item.id;
          newItem.name = item.capaName;
          return newItem;
        });
        yield put({
          type: 'updateState',
          payload: {
            capaList,
          },
        });
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
    // 复合能力下拉列表
    *queryCapaset({ payload }, { call, put, select }) {
      const { response } = yield call(queryCapaInfo);
      yield put({
        type: 'updateState',
        payload: {
          capasetData: Array.isArray(response.datum) ? response.datum : [],
        },
      });
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          searchForm: {
            apprResult: '',
          },
          dataSource: [],
          total: 0,
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
  },
};
