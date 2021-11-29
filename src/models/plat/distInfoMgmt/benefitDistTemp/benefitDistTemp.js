import {
  // 利益分配模板crud
  proConAndproFacListRq,
  proConAndproFacDelRq,
  proConAndproFacDetailRq,
  functionListRq,
  proConAndproFacRq,
  saveUpdateProConAndproFacRq,
  updateProStatusRq,
  // 利益分配模板字段类型配置
  saveBusinessTableFieldTypeRq,
  saveBusinessTableFieldTypeDetailRq,
  fieldRq,
} from '@/services/plat/distInfoMgmt/distInfoMgmt';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';
import { isNil, isEmpty } from 'ramda';

const defaultSearchForm = {
  activeFlag: '0',
};
const defaultFormData = {
  activeFlag: '0',
};

export default {
  namespace: 'benefitDistTemp',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    formData: defaultFormData,
    businessFunList: [], // 业务功能列表
    pageConfig: {
      pageBlockViews: [],
    },
    profitConditionList: [],
    profitConditionSelectList: [],
    profitFactorList: [],
    profitFactorSelectList: [],
    // 利益分配模板字段类型配置
    fieldTypeFormData: {},
    fieldTypeFunList: [],
    fieldTypeList: [],
    // 详情页
    detailFormData: {},
    profitConditionSelectListView: [],
    profitFactorSelectListView: [],
    profitConditionListView: [],
    profitFactorListView: [],
  },

  effects: {
    // 利益分配模板字段类型配置 -- 业务功能列表
    *fieldTypeListRq({ payload }, { call, put }) {
      const { status, response } = yield call(functionListRq, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldTypeFunList: Array.isArray(response.rows) ? response.rows : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    // 利益分配模板字段类型配置 -- 维护
    *saveBusinessTableFieldType({ payload }, { call, put, select }) {
      const { fieldTypeFormData, fieldTypeList } = yield select(
        ({ benefitDistTemp }) => benefitDistTemp
      );
      const tt = fieldTypeList
        .filter(v => v.update)
        .map(v => ({ ...v, busiFunctionId: fieldTypeFormData.busiFunctionId }));
      const { status, response } = yield call(saveBusinessTableFieldTypeRq, tt);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        createMessage({ type: 'success', description: '保存成功' });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
      return {};
    },
    // 利益分配模板字段类型配置 -- 详情
    *saveBusinessTableFieldTypeDetail({ payload }, { call, put }) {
      const { status, response } = yield call(saveBusinessTableFieldTypeDetailRq, payload);
      if (status === 200) {
        return Array.isArray(response.datum) ? response.datum : [];
      }
      createMessage({ type: 'error', description: response.reason || '查询失败' });
      return [];
    },
    // 利益分配模板字段类型配置 -- 业务功能对应的所有字段
    *field({ payload }, { call, put }) {
      const { status, response } = yield call(fieldRq, payload);
      if (status === 200) {
        return Array.isArray(response.datum) ? response.datum : [];
      }
      createMessage({ type: 'error', description: response.reason || '查询失败' });
      return [];
    },
    // 利益分配规则模板 -- 业务功能对应的利益分配条件和利益分配对象
    *proConAndproFac({ payload }, { call, put }) {
      const { status, response } = yield call(proConAndproFacRq, payload);
      if (status === 200) {
        const { profitConditionList = [], profitFactorList = [] } = response?.datum;
        yield put({
          type: 'updateState',
          payload: {
            profitConditionList,
            profitFactorList,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    // 利益分配规则模板 -- 业务功能列表
    *functionList({ payload }, { call, put }) {
      const { status, response } = yield call(functionListRq, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            businessFunList: Array.isArray(response.rows) ? response.rows : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    // 利益分配规则模板 --利益分配模板列表查询
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(proConAndproFacListRq, payload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
        yield put({
          type: 'updateSearchForm',
          payload: {
            selectedRowKeys: [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    // 利益分配规则模板 --利益分配模板列表编辑
    *saveUpdateProConAndproFac({ payload }, { call, put, select }) {
      const { formData, profitConditionSelectList, profitFactorSelectList } = yield select(
        ({ benefitDistTemp }) => benefitDistTemp
      );

      formData.profitConditionList = profitConditionSelectList.map(v => v.id);
      formData.roleFieldList = profitFactorSelectList.map(v => v.id);

      const { status, response } = yield call(saveUpdateProConAndproFacRq, {
        ...formData,
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
    // 利益分配规则模板 --利益分配模板列表删除
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(proConAndproFacDelRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          const { searchForm } = yield select(({ benefitDistTemp }) => benefitDistTemp);
          yield put({
            type: 'query',
            payload: searchForm,
          });
          yield put({
            type: 'updateSearchForm',
            payload: {
              selectedRowKeys: [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '删除失败' });
        }
      }
    },
    // 利益分配规则模板 -- 改变启用状态
    *updateProStatus({ payload }, { call, put, select }) {
      const { status, response } = yield call(updateProStatusRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateSearchForm',
            payload: {
              selectedRowKeys: [],
            },
          });
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '操作失败' });
        return {};
      }
      return {};
    },
    // 利益分配规则模板 -- 利益分配模板列表详情
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(proConAndproFacDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          const { selectProfitConditionList, selectProfitFactorList, ...parmars } = response.datum;

          yield put({
            type: 'updateState',
            payload: {
              formData: parmars,
              profitConditionSelectList: Array.isArray(selectProfitConditionList)
                ? selectProfitConditionList
                : [],
              profitFactorSelectList: Array.isArray(selectProfitFactorList)
                ? selectProfitFactorList
                : [],
            },
          });
          return response;
        }
      }
      createMessage({ type: 'error', description: response.reason || '获取详情失败' });
      return {};
    },
    // 利益分配规则模板 --利益分配模板列表详情页
    *queryView({ payload }, { call, put, select }) {
      const { status, response } = yield call(proConAndproFacDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          const { selectProfitConditionList, selectProfitFactorList, ...parmars } = response.datum;

          yield put({
            type: 'updateState',
            payload: {
              detailFormData: parmars,
              profitConditionSelectListView: Array.isArray(selectProfitConditionList)
                ? selectProfitConditionList
                : [],
              profitFactorSelectListView: Array.isArray(selectProfitFactorList)
                ? selectProfitFactorList
                : [],
            },
          });
          return response;
        }
      }
      createMessage({ type: 'error', description: response.reason || '获取详情失败' });
      return {};
    },
    // 利益分配规则模板 -- 利益分配模板列表详情页 -- 业务功能对应的利益分配条件和利益分配对象
    *proConAndproFacView({ payload }, { call, put }) {
      const { status, response } = yield call(proConAndproFacRq, payload);
      if (status === 200) {
        const { profitConditionList = [], profitFactorList = [] } = response?.datum;
        yield put({
          type: 'updateState',
          payload: {
            profitConditionListView: profitConditionList,
            profitFactorListView: profitFactorList,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
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
    *cleanView(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
          profitConditionList: [],
          profitConditionSelectList: [],
          profitFactorList: [],
          profitFactorSelectList: [],
        },
      });
    },
    *cleanTable(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          list: [],
          total: 0,
          searchForm: defaultSearchForm,
        },
      });
    },
    *cleanDetail(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          detailFormData: {},
          profitConditionListView: [],
          profitConditionSelectListView: [],
          profitFactorListView: [],
          profitFactorSelectListView: [],
        },
      });
    },
    *cleanField(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          fieldTypeFormData: {},
          fieldTypeList: [],
        },
      });
    },
  },

  reducers: {
    updateFieldTypeForm(state, { payload }) {
      const { fieldTypeFormData } = state;
      const newFormData = { ...fieldTypeFormData, ...payload };
      return {
        ...state,
        fieldTypeFormData: newFormData,
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
