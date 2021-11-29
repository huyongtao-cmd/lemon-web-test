// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';

// service方法
import {
  budgetDetail,
  budgetAppropriationDetail,
  budgetAppropriationCreate,
  budgetAppropriationOverallModify,
  budgetAppropriationPartialModify,
} from '@/services/production/bud';
import { subjectTemplateBudgetTree, subjectTemplateListPaging } from '@/services/production/acc';
import { customSelectionListByKey, systemSelectionListByKey } from '@/services/production/system';
import { isNil } from 'ramda';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/production/mathUtils.ts';
import { getViewConf } from '@/services/gen/flow';

// 默认状态
const defaultState = {
  formData: {
    applyDetailAmt: 0,
    details: [],
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
  namespace: 'appropriationDisplayPage',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const {
        formData: { id, budgetId },
        copy = false,
      } = yield select(({ appropriationDisplayPage }) => appropriationDisplayPage);
      if (!id && !budgetId) {
        return;
      }
      let wrappedData = {};

      let datas;
      if (id) {
        const { data } = yield outputHandle(budgetAppropriationDetail, { id });
        datas = data;
        wrappedData = data;
      } else if (budgetId) {
        const { data } = yield outputHandle(budgetDetail, { id: budgetId, attachType: 'APPR' }); // attachType查预算拨付的附件
        datas = data;
        wrappedData.budgetId = data.id;
        wrappedData.budgetName = data.budgetName;
        wrappedData.totalBudgetAmt = data.totalBudgetAmt;
        wrappedData.totalAppropriationAmt = data.totalAppropriationAmt;
        wrappedData.usedAmt = data.usedAmt;
        wrappedData.occupiedAmt = data.occupiedAmt;
        const details = [];
        (data.details || []).forEach(detail => {
          details.push({
            id: genFakeId(-1),
            budgetDetailId: detail.id,
            budgetItemId: detail.budgetItemId,
            parentId: detail.parentId,
            budgetItemCode: detail.budgetItemCode,
            budgetItemName: detail.budgetItemName,
            detailBudgetAmt: detail.detailBudgetAmt,
            detailAppropriationAmt: detail.detailAppropriationAmt,
            applyDetailAmt: 0,
          });
        });
        wrappedData.details = details;
      }
      if (isNil(wrappedData.details)) {
        wrappedData.details = [];
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
      yield put({
        type: 'init',
      });
      // 页面变为详情模式
      return yield put({
        type: 'updateState',
        payload: {
          formMode: 'DESCRIPTION',
        },
      });
    },

    *save({ payload }, { put, select }) {
      const { formData } = payload;
      const { id } = formData;
      let output;
      if (id && id > 0) {
        // 编辑
        output = yield outputHandle(
          budgetAppropriationOverallModify,
          formData,
          'appropriationDisplayPage/success'
        );
      } else {
        // 新增
        output = yield outputHandle(
          budgetAppropriationCreate,
          formData,
          'appropriationDisplayPage/success'
        );
      }
      return yield put({ type: 'success', payload: output });
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
      const { index, applyDetailAmt } = payload;
      const newFormData = update(formData, {
        details: { [index]: { $merge: { applyDetailAmt } } },
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
