// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';

// service方法
import { budgetDetail, budgetAdjustDetail, budgetAdjustSave } from '@/services/production/bud';
import { customSelectionListByKey, systemSelectionListByKey } from '@/services/production/system';
import { isNil } from 'ramda';
import update from 'immutability-helper';
import { getViewConf } from '@/services/gen/flow';
import { genFakeId } from '@/utils/mathUtils';

// 默认状态
const defaultState = {
  formData: {
    applyDetailAmt: 0,
    details: [],
    adjustDetails: [],
  },
  formDataOld: {
    applyDetailAmt: 0,
    details: [],
  },
  deleteKeys: [],
  formMode: 'EDIT',
  copy: false,
  unExpandedRowKeys: [],
  unExpandedAdjustRowKeys: [],
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
  namespace: 'budgetAdjustDisplayPage',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const {
        formData: { id, budgetId },
        copy = false,
      } = yield select(({ budgetAdjustDisplayPage }) => budgetAdjustDisplayPage);
      if (!id && !budgetId) {
        return;
      }
      let wrappedData = {};
      let datas;

      if (id) {
        const { data } = yield outputHandle(budgetAdjustDetail, { id });
        datas = data;
        const budgetDate = [];
        if (data.budgetStartDate) {
          budgetDate[0] = data.budgetStartDate;
        }
        if (data.budgetEndDate) {
          budgetDate[1] = data.budgetEndDate;
        }
        data.budgetDate = budgetDate;
        wrappedData = data;
      } else if (budgetId) {
        const { data } = yield outputHandle(budgetDetail, { id: budgetId, attachType: 'ADJUST' }); // 查预算调整的附件
        datas = data;
        const budgetDate = [];
        if (data.budgetStartDate) {
          budgetDate[0] = data.budgetStartDate;
        }
        if (data.budgetEndDate) {
          budgetDate[1] = data.budgetEndDate;
        }
        data.budgetDate = budgetDate;
        // 处理预算调整明细行
        const wrappedDetails = (data.details || []).map(item => ({
          ...item,
          id: genFakeId(-1),
          budgetId: undefined,
        }));
        wrappedData = data;
        wrappedData.budgetId = budgetId;
        wrappedData.id = undefined;
        wrappedData.details = wrappedDetails;
      }
      if (isNil(wrappedData.details)) {
        wrappedData.details = [];
      }
      if (isNil(wrappedData.adjustDetails)) {
        wrappedData.adjustDetails = [];
      }
      // 当为复制时,处理id为null
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      const { attachments = [] } = datas;
      const file = attachments.map(item => item.id);
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...wrappedData, ...copyObj, file },
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
      // 页面变为详情模式
      yield put({
        type: 'updateState',
        payload: {
          formMode: 'DESCRIPTION',
        },
      });
      return yield put({
        type: 'init',
      });
    },

    *save({ payload }, { put, select }) {
      const { formData } = payload;
      const output = yield outputHandle(
        budgetAdjustSave,
        formData,
        'budgetAdjustDisplayPage/success'
      );
      return yield put({ type: 'success', payload: output });
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

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      const { taskKey } = response;
      let formMode;
      if (taskKey === 'B02_01_SUBMIT_i') {
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
  },
};
