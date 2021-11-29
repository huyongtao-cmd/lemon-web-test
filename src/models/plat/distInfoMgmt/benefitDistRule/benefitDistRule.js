import {
  // 利益分配模板crud
  functionListRq,
  // 利益分配规则
  profitConditionSaveRq,
  profitConditionDetailRq,
  profitConditionTableColRq,
  templateNameListRq,
  profitConditionDeleteRq,
  updateStatusRq,
} from '@/services/plat/distInfoMgmt/distInfoMgmt';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {
  limit: 10,
  offset: 0,
  enabledFlag: 'true',
};
const defaultFormData = {
  activeFlag: '0',
};

export default {
  namespace: 'benefitDistRule',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    formData: defaultFormData,
    pageConfig: {
      pageBlockViews: [],
    },
    businessFunList: [], // 业务功能列表
    templateNameList: [], // 模板名称等列表
    objectProFitTemConList: [], // 利益分配对象
    objectProFitTemConColums: [], // 利益分配对象及比例表头
    proFitdistName: [], // 利益分配条件
    proFitdistNameColums: [], // 利益分配条件表头
    benefitDistRuleEditList: [], // 利益分配规则
    benefitDistRuleList: [], // 利益分配规则
    delete: [], // 利益分配规则删除的list
  },

  effects: {
    // 利益分配规则 - 列表维护
    *profitConditionSaveList({ payload }, { call, put, select }) {
      const { searchForm, benefitDistRuleList } = yield select(
        ({ benefitDistRule }) => benefitDistRule
      );

      const tt = benefitDistRuleList.map(v => {
        // eslint-disable-next-line no-param-reassign
        delete v.groupNo;
        // eslint-disable-next-line no-param-reassign
        delete v.disabled;
        return v;
      });

      const { status, response } = yield call(profitConditionSaveRq, {
        ...searchForm,
        map: tt,
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
    // 利益分配规则 - 详情
    *query({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ benefitDistRule }) => benefitDistRule);
      const { status, response } = yield call(profitConditionDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          const { map, ...resParams } = response.datum;

          yield put({
            type: 'updateState',
            payload: {
              searchForm: { ...resParams, ...searchForm, selectedRowKeys: [] },
              benefitDistRuleList: Array.isArray(map) ? map : [],
            },
          });
          return response;
        }
      }
      createMessage({ type: 'error', description: response.reason || '获取详情失败' });
      return {};
    },
    // 利益分配规则 - 列表更改启用状态
    *updateStatus({ payload }, { call, put, select }) {
      const { status, response } = yield call(updateStatusRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '操作失败' });
        return {};
      }
      return {};
    },
    // 利益分配规则 - 列表删除
    *profitConditionDelete({ payload }, { call, put, select }) {
      const { status, response } = yield call(profitConditionDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '删除失败' });
        return {};
      }
      return {};
    },
    // 利益分配规则 - 详情
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(profitConditionDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          const { map, ...resParams } = response.datum;

          yield put({
            type: 'updateState',
            payload: {
              formData: resParams,
              benefitDistRuleEditList: Array.isArray(map) ? map : [],
            },
          });
          return response;
        }
      }
      createMessage({ type: 'error', description: response.reason || '获取详情失败' });
      return {};
    },
    // 利益分配规则 - 维护
    *profitConditionSave({ payload }, { call, put, select }) {
      const { formData, benefitDistRuleEditList, deleteList } = yield select(
        ({ benefitDistRule }) => benefitDistRule
      );

      formData.delete = deleteList.filter(v => v > 0);
      formData.map = benefitDistRuleEditList.map(v => {
        // eslint-disable-next-line no-param-reassign
        delete v.groupNo;
        return v;
      });

      const { status, response } = yield call(profitConditionSaveRq, {
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
    // 根据模板名称拉取利益分配条件和利益分配对象
    *profitConditionTableCol({ payload }, { call, put }) {
      const { status, response } = yield call(profitConditionTableColRq, payload);
      if (status === 200) {
        const objectProFitTemConList = Array.isArray(response?.datum?.objectProFitTemConList)
          ? response?.datum?.objectProFitTemConList
          : [];
        const proFitdistName = Array.isArray(response?.datum?.proFitdistName)
          ? response?.datum?.proFitdistName
          : [];
        yield put({
          type: 'updateState',
          payload: {
            objectProFitTemConList,
            proFitdistName,
          },
        });
        return { objectProFitTemConList, proFitdistName };
      }
      createMessage({ type: 'error', description: response.reason || '查询失败' });
      return {};
    },
    // 模板名称列表
    *templateName({ payload }, { call, put }) {
      const { status, response } = yield call(templateNameListRq, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            templateNameList: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    // 业务功能列表
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
          businessFunList: [], // 业务功能列表
          templateNameList: [], // 模板名称等列表
          objectProFitTemConList: [], // 利益分配对象
          objectProFitTemConColums: [], // 利益分配对象及比例表头
          proFitdistName: [], // 利益分配条件
          proFitdistNameColums: [], // 利益分配条件表头
          benefitDistRuleEditList: [], // 利益分配规则
          deleteList: [], // 利益分配规则删除的list
        },
      });
    },
    *cleanList(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          searchForm: defaultSearchForm,
          proFitdistName: [],
          objectProFitTemConColums: [],
          proFitdistNameColums: [],
          benefitDistRuleList: [],
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
