// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';

// service方法
import {
  subjectTemplateDetail,
  subjectTemplateCreate,
  subjectTemplateOverallModify,
  subjectTemplatePartialModify,
  budgetItemListPaging,
  businessAccItemListPaging,
  financialAccSubjListPaging,
} from '@/services/production/acc';
import { isNil } from 'ramda';
import update from 'immutability-helper';
import { closeThenGoto } from '@/layouts/routerControl';
import { genFakeId } from '@/utils/mathUtils';

// 默认状态
const defaultState = {
  formData: {
    details: [],
  },
  deleteKeys: [],
  formMode: 'EDIT',
  copy: false,
  treeList: [],
  financialAccSubjTreeList: [],
  budgetItemTreeList: [],
  modalVisible: false,
  checkedKeys: [],
  allCheckedKeys: [],
  unExpandedRowKeys: [],
};

export default {
  namespace: 'subjTemplateDisplayPage',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const {
        formData: { id },
        copy = false,
      } = yield select(({ subjTemplateDisplayPage }) => subjTemplateDisplayPage);
      if (!id) {
        return;
      }
      const { data } = yield outputHandle(subjectTemplateDetail, { id });
      if (isNil(data.details)) {
        data.details = [];
      }
      const checkedKeys = data.details.map(detail => detail.busAccItemId);
      // 当为复制时,处理id为null
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...data, ...copyObj },
          checkedKeys,
          allCheckedKeys: checkedKeys,
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
      yield put({
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
          subjectTemplateOverallModify,
          formData,
          'subjTemplateDisplayPage/success'
        );
        closeThenGoto(`/plat/financial/subjTemplateList?refresh=${genFakeId(-1)}`);
      } else {
        // 新增
        output = yield outputHandle(
          subjectTemplateCreate,
          formData,
          'subjTemplateDisplayPage/success'
        );
        closeThenGoto(`/plat/financial/subjTemplateList?refresh=${genFakeId(-1)}`);
      }
      yield put({ type: 'success', payload: output });
    },

    *fetchTree({ payload }, { put, select }) {
      const {
        data: { rows },
      } = yield outputHandle(businessAccItemListPaging, { limit: 0 });
      const list = rows.map(item => ({
        ...item,
        title: `${item.itemCode}-${item.itemName}`,
        key: item.itemCode,
      }));

      yield put({
        type: 'updateState',
        payload: {
          treeList: list,
        },
      });
    },

    *fetchFinancialAccSubjTree({ payload }, { put, select }) {
      const {
        data: { rows },
      } = yield outputHandle(financialAccSubjListPaging, { limit: 0 });
      const list = rows.map(item => ({
        ...item,
        title: `${item.accCode}-${item.accName}`,
        key: item.accCode,
      }));

      yield put({
        type: 'updateState',
        payload: {
          financialAccSubjTreeList: list,
        },
      });
    },

    *fetchBudgetItemTree({ payload }, { put, select }) {
      const {
        data: { rows },
      } = yield outputHandle(budgetItemListPaging, { limit: 0 });
      const list = rows.map(item => ({
        ...item,
        title: `${item.budgetCode}-${item.budgetName}`,
        key: item.budgetCode,
      }));

      yield put({
        type: 'updateState',
        payload: {
          budgetItemTreeList: list,
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
      if (Array.isArray(element)) {
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
  },
};
