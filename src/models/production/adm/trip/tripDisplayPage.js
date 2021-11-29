// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';

// service方法
import {
  budgetDetail,
  budgetCreate,
  budgetOverallModify,
  budgetPartialModify,
} from '@/services/production/bud';
import { tripApplyCreate, tripApplyOverallModify } from '@/services/production/adm/trip/tripApply';
import { customSelectionListByKey, systemSelectionListByKey } from '@/services/production/system';
import { budgetSelectPaging } from '@/services/production/common/select';
import { isNil } from 'ramda';
import update from 'immutability-helper';
import { getViewConf } from '@/services/gen/flow';

// 默认状态
const defaultState = {
  formData: {
    tripExpenseDataList: [],
  },
  tripExpenseDataListNo: 0,
  projectSelectParam: '', // 项目查询条件
  budgetDescList: [], // 预算查询列表
  expenseClaimSiteList: [], // 费用结算方下拉列表
  budgetTypeList: [], // 预算归属类型
  formMode: 'EDIT', // 模式类型
  submitState: false,

  deleteKeys: [], // 删除字段keys
  copy: false, // 复制标志
  unExpandedRowKeys: [],
  internalOuList: [],
  taskId: undefined,

  flowForm: {
    remark: undefined,
    dirty: false,
  },
  fieldsConfig: {
    buttons: [],
    panels: {},
  },
};

export default {
  namespace: 'tripDisplayPage',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const {
        formData: { id },
        copy = false,
      } = yield select(({ budgetDisplayPage }) => budgetDisplayPage);
      if (!id) {
        yield put({ type: 'cleanState' });
        return;
      }
      const { data } = yield outputHandle(budgetDetail, { id });
      const budgetDate = [];
      if (data.budgetStartDate) {
        budgetDate[0] = data.budgetStartDate;
      }
      if (data.budgetEndDate) {
        budgetDate[1] = data.budgetEndDate;
      }
      data.budgetDate = budgetDate;
      if (isNil(data.details)) {
        data.details = [];
      }
      // 当为复制时,处理id为null
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...data, ...copyObj },
        },
      });
    },

    *success({ payload }, { put, select }) {
      // 弹出操作成功,操作失败无需写代码,outputHandle已处理
      message({ type: 'success' });
      yield put({
        type: 'updateForm',
        payload: {
          id: payload.data.id,
        },
      });
      yield put({
        type: 'init',
      });
    },

    *save({ payload }, { put, select }) {
      const { formData } = payload;
      const { id } = formData;
      let output;
      if (id && id > 0) {
        // 编辑
        output = yield outputHandle(tripApplyOverallModify, formData, 'budgetDisplayPage/success');
      } else {
        // 新增
        output = yield outputHandle(tripApplyCreate, formData, 'budgetDisplayPage/success');
      }
      yield put({ type: 'success', payload: output });

      yield put({
        type: 'updateState',
        payload: {
          submitState: false,
        },
      });
    },
    /**
     * 获取预算查询展示列表数据
     * @param payload
     * @param put
     * @param select
     * @returns {Generator<*, void, *>}
     */
    *fetchBudgetDescList({ payload }, { put, select }) {
      const { chargeProjectId } = payload;
      const output = yield outputHandle(budgetSelectPaging, { chargeProjectId });
      const list = output.data.rows.map(item => ({
        ...item,
        value: item.id,
        title: item.budgetName,
      }));
      if (list.length === 1) {
        this.put({ type: 'updateForm', payload: { relatedBudgetId: list[0].id } });
      }
      yield put({
        type: 'updateState',
        payload: {
          budgetDescList: list,
        },
      });
    },
    /**
     * 获取费用归属类型
     * @param payload
     * @param put
     * @param select
     * @returns {Generator<*, void, *>}
     */
    *fetchBudgetType({ payload }, { put, select }) {
      const output = yield outputHandle(customSelectionListByKey, {
        key: 'CUS:CHARGE_CLASSIFICATION',
      });
      const list = output.data.map(item => ({
        ...item,
        value: item.selectionValue,
        label: item.selectionName,
      }));
      yield put({
        type: 'updateState',
        payload: {
          budgetTypeList: list,
        },
      });
    },
    /**
     * 获取结算方列表
     * @param payload
     * @param put
     * @param select
     * @returns {Generator<*, void, *>}
     */
    *fetchExpenseClaimSiteList({ payload }, { put, select }) {
      const output = yield outputHandle(systemSelectionListByKey, {
        key: 'ADM:EXPENSE_CLAIM_SITE',
      });
      const list = output.data.map(item => ({
        ...item,
        value: item.selectionValue,
        label: item.selectionName,
      }));
      yield put({
        type: 'updateState',
        payload: {
          expenseClaimSiteList: list,
        },
      });
    },

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      const { taskKey } = response;
      let formMode;
      if (taskKey === 'BUD_B01_01_SUBMIT_i') {
        formMode = 'EDIT';
      } else {
        formMode = 'DESCRIPTION';
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formMode,
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
      }
    },
    /**
     * 查询我的出差列表数据
     * @param payload
     * @param put
     * @param select
     * @returns {Generator<*, void, *>}
     */
    // * fetchMyTripList({ payload }, { put, select }) {
    //
    // },
    *fetchInternalOuList({ payload }, { put, select }) {
      const {
        user: { extInfo = {} },
        formData: { chargeCompany, id },
      } = yield select(({ user, regularExpenseDisplay }) => ({
        ...user,
        ...regularExpenseDisplay,
      }));
      const output = yield outputHandle(customSelectionListByKey, {
        key: 'CUS:INTERNAL_COMPANY',
      });
      const list = output.data.map(item => ({
        ...item,
        value: item.selectionValue,
        title: item.selectionName,
      }));
      if (!chargeCompany) {
        let chargeCompany2;
        const chargeCompanyList = list.filter(item => item.extVarchar1 === extInfo.ouAbNo);
        if (chargeCompanyList && chargeCompanyList.length > 0) {
          chargeCompany2 = chargeCompanyList[0].value;
        }
        yield put({
          type: 'updateForm',
          payload: {
            chargeCompany: chargeCompany2,
          },
        });
      }

      yield put({
        type: 'updateState',
        payload: {
          internalOuList: list,
        },
      });
    },
  },

  // 同步方法
  reducers: {
    // 使用工具方法快速写updateState,updateForm,cleanState 方法
    ...commonModelReducers(defaultState),
    updateFormForEditTable(state, { payload }) {
      const { formData } = state;
      const name = Object.keys(payload)[0];
      const element = payload[name];
      let newFormData;
      if (Array.isArray(element) && name === 'tripExpenseDataList') {
        element.forEach((ele, index) => {
          if (!isNil(ele)) {
            newFormData = update(formData, { [name]: { [index]: { $merge: ele } } });
          }
        });
      } else {
        newFormData = { ...formData, ...payload };
      }

      return {
        ...state,
        formData: newFormData,
      };
    },

    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
  },
};
