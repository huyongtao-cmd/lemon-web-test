import {
  catCodeListRq,
  catCodeSaveRq,
  catCodeDeleteRq,
  catCodeDetailsRq,
  catCodeDetailListRq,
  catCodeDetailSaveRq,
  catCodeDetailDeteleRq,
  catCodeDValDetailsRq,
  catCodeDValNodeSaveRq,
  catCodeDValNodeDeteleRq,
  catCodeDetailDetailsRq,
  catCodeDValInsertRq,
  selectSupCatDValRq,
  catCodeDetailTabFieldRq,
} from '@/services/plat/categoryCodeMgmt/categoryCode';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {};
const defaultFormData = {
  catStatus: 'IN_USE',
  blankFlag: 'NO',
  multFlag: 'NO',
};

export default {
  namespace: 'categoryCodeMgmt',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    formData: defaultFormData,
    addFormData: {},
    catCodeDFormData: {},
    catCodeList: [],
    catCodeDelList: [],
    supCatCodeList: [],
    catCodeDvalList: [],
    catCodeDvalSupList: [],
    catCodeDvalDelList: [],
    catCodeDValSupValList: [],
    TabField: [],
    pageConfig: {},
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
    // =================================类别码==========================
    // 类别码列表查询
    *query({ payload }, { call, put }) {
      const { response } = yield call(catCodeListRq, payload);
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
    // 类别码列表删除
    *catCodeDelete({ payload }, { call, put, select }) {
      const { status, response } = yield call(catCodeDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          const { searchForm } = yield select(({ categoryCodeMgmt }) => categoryCodeMgmt);
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '删除失败' });
        }
      }
    },
    // 类别码列表详情
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(catCodeDetailsRq, payload);
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
          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      return {};
    },
    // 类别码明细列表
    *catCodeDetailDetails({ payload }, { call, put, select }) {
      const { status, response } = yield call(catCodeDetailDetailsRq, payload);
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
    // 类别码列表保存
    *save({ payload }, { call, put, select }) {
      const { catCodeList } = yield select(({ categoryCodeMgmt }) => categoryCodeMgmt);
      const params = {
        twCategoryDEntity: catCodeList,
      };

      const { status, response } = yield call(catCodeSaveRq, { ...params, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },

    // =================================类别码明细==========================
    // 类别码明细列表、上级类别码列表
    *catCodeDetailList({ payload }, { call, put }) {
      const { response } = yield call(catCodeDetailListRq, payload);
      if (response) {
        const { rows } = response;
        yield put({
          type: 'updateState',
          payload: {
            supCatCodeList: Array.isArray(rows) ? rows : [],
          },
        });
      }
    },
    *catCodeDetailTabField({ payload }, { call, put }) {
      const { response } = yield call(catCodeDetailTabFieldRq, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            TabField: Array.isArray(response) ? response : [],
          },
        });
      }
    },
    // 类别码明细保存
    *catCodeDetailSave({ payload }, { call, put, select }) {
      const { status, response } = yield call(catCodeDetailSaveRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          yield put({
            type: 'catCodeDetailDetails',
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
    // 类别码明细删除
    *catCodeDetailDetele({ payload }, { call, put, select }) {
      const { status, response } = yield call(catCodeDetailDeteleRq, payload);
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          return true;
          // yield put({
          //   type: 'catCodeDetailDetails',
          //   payload: {
          //     id: fromQs().id,
          //   },
          // });
        }
        createMessage({ type: 'error', description: response.reason || '删除失败' });
        return false;
      }
      return false;
    },
    // =================================类别码明细值==========================
    // 类别码明细值详情
    *catCodeDValDetails({ payload }, { call, put, select }) {
      const { status, response } = yield call(catCodeDValDetailsRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateCatCodeDFormData',
            payload: response.datum || {},
          });
          yield put({
            type: 'updateState',
            payload: {
              catCodeDvalList:
                response.datum && Array.isArray(response.datum.twCategoryDValView)
                  ? response.datum.twCategoryDValView
                  : [],
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

    *catCodeDValDetailsSupValDropDown({ payload }, { call, put, select }) {
      const { status, response } = yield call(catCodeDValDetailsRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              catCodeDvalSupList:
                response.datum && Array.isArray(response.datum.twCategoryDValView)
                  ? response.datum.twCategoryDValView
                  : [],
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

    *selectSupCatDVal({ payload }, { call, put, select }) {
      const { status, response } = yield call(selectSupCatDValRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              catCodeDValSupValList: Array.isArray(response.datum) ? response.datum : [],
            },
          });
        }
      }
    },

    // 类别码明细值维护
    *catCodeDValInsert({ payload }, { call, put, select }) {
      const { catCodeDFormData, catCodeDvalList } = yield select(
        ({ categoryCodeMgmt }) => categoryCodeMgmt
      );
      catCodeDFormData.twCategoryDValEntity = catCodeDvalList;

      const { status, response } = yield call(catCodeDValInsertRq, {
        ...catCodeDFormData,
        ...payload,
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

    // 类别码明细值删除
    *catCodeDValNodeDetele({ payload }, { call, put, select }) {
      const { status, response } = yield call(catCodeDValNodeDeteleRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          // yield put({
          //   type: 'catCodeDValDetails',
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
          formData: {
            catStatus: 'IN_USE',
            blankFlag: 'NO',
            multFlag: 'NO',
          },
          twCategoryDEntity: [],
        },
      });
    },
    *cleanCatCodeDFormData(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          updateCatCodeDFormData: {},
          catCodeDvalList: [],
          catCodeDvalSupList: [],
          catCodeDValSupValList: [],
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
