import {
  // 利益分配模板crud
  functionListRq,
  // 利益分配规则
  profitConditionSaveRq,
  profitConditionDetailRq,
  profitConditionTableColRq,
  templateNameListRq,
} from '@/services/plat/distInfoMgmt/distInfoMgmt';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {
  activeFlag: '0',
};
const defaultFormData = {};

export default {
  namespace: 'benefitDistRuleEdit',
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
    benefitDistRuleList: [], // 利益分配规则
    delete: [], // 利益分配规则删除的list
  },

  effects: {
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
              benefitDistRuleList: Array.isArray(map) ? map : [],
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
      const { formData, benefitDistRuleList, deleteList } = yield select(
        ({ benefitDistRuleEdit }) => benefitDistRuleEdit
      );

      formData.delete = deleteList.filter(v => v > 0);
      formData.map = benefitDistRuleList.map(v => {
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
          benefitDistRuleList: [], // 利益分配规则
          deleteList: [], // 利益分配规则删除的list
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
