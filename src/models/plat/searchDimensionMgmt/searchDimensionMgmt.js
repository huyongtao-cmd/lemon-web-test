import {
  searchDimensionListRq,
  searchDimensionEditRq,
  searchDimensionDeleteRq,
  searchDimensionCatCodeListRq,
  saveSearchDimDetailsRq,
  saveSearchDimEntityRq,
  saveSearchDimDeteleRq,
  saveSearchDimListRq,
  SearchDimDEntityRq,
  SearchDimDListRq,
  SearchDimDDeleteRq,
  SearchDimDCatCodeListRq,
} from '@/services/plat/searchDimensionMgmt/searchDimension';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {};
const defaultFormData = {};

export default {
  namespace: 'searchDimensionMgmt',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    formData: defaultFormData,
    addFormData: {},
    formDataModalAdd: {
      searchDimStatus: 'IN_USE',
      dfltFlag: 'NO',
    },
    catCodeDFormData: {},
    catCodeList: [],
    catCodeDelList: [],
    supCatCodeList: [],
    catCodeDvalList: [],
    catCodeDvalDelList: [],
    catCodeDValSupValList: [],
    TabField: [],
    pageConfig: {},
    searchDimList: [],
    searchDimDelList: [],
    searchDimDList: [],
    searchDimDDelList: [],
    dimDCatCodeList: [],
    detailEditFormData: {},
    detailEditList: [],
  },

  effects: {
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo || {},
          },
        });
        return response;
      }
      return {};
    },
    // =================================查询维度列表==========================
    // 查询维度列表查询
    *query({ payload }, { call, put }) {
      const { response } = yield call(searchDimensionListRq, payload);
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
    // 查询维度列表删除
    *searchDimensionDelete({ payload }, { call, put, select }) {
      const { status, response } = yield call(searchDimensionDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          const { searchForm } = yield select(({ searchDimensionMgmt }) => searchDimensionMgmt);
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '删除失败' });
        }
      }
    },
    // 查询维度列表维护类别码下拉
    *searchDimensionCatCodeList({ payload }, { call, put, select }) {
      const { status, response } = yield call(searchDimensionCatCodeListRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              catCodeList: Array.isArray(response.datum) ? response.datum : [],
            },
          });
        }
      }
    },
    // =================================查询维度维护==========================
    // 查询维度列表维护保存
    *searchDimensionEdit({ payload }, { call, put, select }) {
      const { searchDimList, searchDimDelList } = yield select(
        ({ searchDimensionMgmt }) => searchDimensionMgmt
      );
      const parmars = {
        twSearchDimEntity: searchDimList,
        deleteSearchDim: searchDimDelList,
      };
      const { status, response } = yield call(searchDimensionEditRq, { ...payload, ...parmars });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    // 查询维度定义详情
    *saveSearchDimDetails({ payload }, { call, put, select }) {
      const { status, response } = yield call(saveSearchDimDetailsRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              formData: response.datum || {},
            },
          });
          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      return {};
    },
    // 查询维度保存
    *saveSearchDimEntity({ payload }, { call, put, select }) {
      const { status, response } = yield call(saveSearchDimEntityRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          yield put({
            type: 'saveSearchDimList',
            payload: {
              id: fromQs().id,
            },
          });
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '操作失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '操作失败' });
      return {};
    },
    // 查询维度定义详情 - 查询维度列表
    *saveSearchDimList({ payload }, { call, put, select }) {
      const { status, response } = yield call(saveSearchDimListRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              searchDimList: Array.isArray(response.datum) ? response.datum : [],
            },
          });
        }
      }
    },
    // 查询维度定义删除 - 查询维度列表
    *saveSearchDimDetele({ payload }, { call, put, select }) {
      const { status, response } = yield call(saveSearchDimDeteleRq, payload);
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '操作成功' });
          return true;
          // yield put({
          //   type: 'saveSearchDimList',
          //   payload: {
          //     id: fromQs().id,
          //   },
          // });
        }
        createMessage({ type: 'error', description: response.reason || '操作失败' });
        return false;
      }
      return false;
    },
    // =================================查询维度明细维护==========================
    // 查询维度明细 - 列表查询
    *SearchDimDList({ payload }, { call, put, select }) {
      const { status, response } = yield call(SearchDimDListRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              detailEditList: Array.isArray(response.datum) ? response.datum : [],
            },
          });
        }
      }
    },

    // 查询维度明细保存
    *SearchDimDEntity({ payload }, { call, put, select }) {
      const { status, response } = yield call(SearchDimDEntityRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '操作失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '操作失败' });
      return {};
    },

    // 查询维度明细 - 查询维度列表维护类别码下拉
    *SearchDimDCatCodeList({ payload }, { call, put, select }) {
      const { status, response } = yield call(SearchDimDCatCodeListRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              dimDCatCodeList: Array.isArray(response.datum) ? response.datum : [],
            },
          });
        }
      }
    },
    // 查询维度明细 - 删除
    *SearchDimDDelete({ payload }, { call, put, select }) {
      const { status, response } = yield call(SearchDimDDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '操作成功' });
          // 未保存修改为提交的数据，前端进行假删除，不重新拉去详情
          // yield put({
          //   type: 'SearchDimDList',
          //   payload: {
          //     id: fromQs().id,
          //   },
          // });
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
      }
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {},
          formDataModalAdd: {
            searchDimStatus: 'IN_USE',
            dfltFlag: 'NO',
          },
          searchDimList: [],
          searchDimDelList: [],
        },
      });
    },
    // *cleanCatCodeDFormData(_, { put }) {
    //   yield put({
    //     type: 'updateState',
    //     payload: {
    //       updateCatCodeDFormData: {},
    //       catCodeDvalList: [],
    //       catCodeDValSupValList: [],
    //     },
    //   });
    // },
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
    updateAddForm(state, { payload }) {
      const { addFormData } = state;
      const newFormData = { ...addFormData, ...payload };
      return {
        ...state,
        addFormData: newFormData,
      };
    },
    updateCatCodeDFormData(state, { payload }) {
      const { catCodeDFormData } = state;
      const newFormData = { ...catCodeDFormData, ...payload };
      return {
        ...state,
        catCodeDFormData: newFormData,
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
