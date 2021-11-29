import { isNil } from 'ramda';
import update from 'immutability-helper';
// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';

// service方法
import { accountSelectPaging, businessAccItemPaging } from '@/services/production/common/select';
import { getViewConf } from '@/services/gen/flow';
import { budgetItemListPaging, financialAccSubjListPaging } from '@/services/production/acc';
import {
  copyrightCreate,
  copyrightDetail,
  copyrightModify,
  copyrightPaging,
} from '@/services/production/adm/copyright/copyright';

// 默认状态
const defaultState = {
  formData: {
    partners: [],
  },
  formMode: 'EDIT',
  applyStatus: 'CREATE',
  copy: false,
  id: undefined,
  deleteKeys: [],
  from: undefined,
  fieldsConfig: {
    buttons: [],
    panels: {},
  },
};

export default {
  namespace: 'copycrightList',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const {
        formData: { id },
        copy = false,
      } = yield select(({ copycrightList }) => copycrightList);
      if (!id) {
        return {};
      }
      return {};
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
