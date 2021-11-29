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
import { subjectTemplateBudgetTree, subjectTemplateListPaging } from '@/services/production/acc';
import { customSelectionListByKey, systemSelectionListByKey } from '@/services/production/system';
import { isNil } from 'ramda';
import update from 'immutability-helper';
import { listToTreePlus } from '@/utils/production/TreeUtil.ts';
import { genFakeId } from '@/utils/production/mathUtils.ts';
import { getViewConf } from '@/services/gen/flow';

// 默认状态
const defaultState = {
  formData: {
    details: [],
    chargeClassification: 'DAILY',
  },
  deleteKeys: [],
  formMode: 'EDIT',
  copy: false,
  unExpandedRowKeys: [],
  treeList: [],
  budgetTypeList: [],
  budgetControlTypeList: [],
  tmplList: [],
  taskId: undefined,
  flowForm: {
    remark: undefined,
    dirty: false,
  },
  fieldsConfig: {
    buttons: [],
    panels: {},
  },
  attachments: [],
};

export default {
  namespace: 'budgetDisplayPage',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const {
        formData: { id },
        copy = false,
        formMode,
      } = yield select(({ budgetDisplayPage }) => budgetDisplayPage);
      if (!id) {
        return;
      }
      const param = { id, attachType: 'BUDGET' };
      if (formMode === 'DESCRIPTION') {
        param.executionFlag = true;
      }
      const { data } = yield outputHandle(budgetDetail, param);
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
      const { attachments = [] } = data;
      const file = attachments.map(item => item.id);
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...data, ...copyObj, file },
          attachments,
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
      return yield put({
        type: 'init',
      });
    },

    *save({ payload }, { put, select }) {
      const { formData } = payload;
      const { id } = formData;
      let output;
      if (id && id > 0) {
        // 编辑
        output = yield outputHandle(budgetOverallModify, formData, 'budgetDisplayPage/success');
      } else {
        // 新增
        output = yield outputHandle(budgetCreate, formData, 'budgetDisplayPage/success');
      }
      return yield put({ type: 'success', payload: output });
    },

    *fetchBudgetTree({ payload }, { put, select }) {
      const { tmplId } = payload;
      if (tmplId) {
        const { data } = yield outputHandle(subjectTemplateBudgetTree, { id: tmplId });
        const list = data.map(item => ({
          ...item,
          id: genFakeId(-1),
          budgetItemId: item.id,
          budgetItemCode: item.budgetCode,
          budgetItemName: item.budgetName,
          detailControlFlag: false,
          detailBudgetAmt: 0,
        }));

        // const wrappedDetails = listToTreePlus(list);

        yield put({
          type: 'updateForm',
          payload: {
            details: list,
          },
        });
      } else {
        yield put({
          type: 'updateForm',
          payload: {
            details: [],
          },
        });
      }
    },

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

    *fetchBudgetControlType({ payload }, { put, select }) {
      const output = yield outputHandle(systemSelectionListByKey, {
        key: 'BUD:CONTROL_TYPE',
      });
      const list = output.data.map(item => ({
        ...item,
        value: item.selectionValue,
        label: item.selectionName,
      }));

      yield put({
        type: 'updateState',
        payload: {
          budgetControlTypeList: list,
        },
      });
    },

    *fetchTmplList({ payload }, { put, select }) {
      const output = yield outputHandle(subjectTemplateListPaging, {
        limit: 0,
        EnabledFlag: true,
        ...payload,
      });
      const list = output.data.rows.map(item => ({
        ...item,
        value: item.id,
        title: item.tmplName,
      }));

      yield put({
        type: 'updateState',
        payload: {
          tmplList: list,
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
      if (Array.isArray(element) && name === 'details') {
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
    recursionUpdateAmt(state, { payload }) {
      const { formData } = state;
      const { index, detailBudgetAmt } = payload;
      const newFormData = update(formData, {
        details: { [index]: { $merge: { detailBudgetAmt } } },
      });

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

    updateDetails(state, { payload }) {
      const { formData } = state;
      const { details } = formData;
      return {
        ...state,
        formData: {
          ...formData,
          details: payload.details,
        },
      };
    },
  },
};
