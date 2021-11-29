// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';

// service方法
import {
  accountSelectPaging,
  budgetSelectPaging,
  businessAccItemPaging,
} from '@/services/production/common/select';
import { customSelectionListByKey } from '@/services/production/system';
import { isNil } from 'ramda';
import update from 'immutability-helper';
import {
  copyrightCreate,
  copyrightDetail,
  copyrightOverallModify,
} from '@/services/production/adm/copyright/copyright';

// 默认状态
const defaultState = {
  formData: {
    copyrightPartnersList: [],
    currentSerNo: [],
  },
  formMode: 'EDIT',
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
  namespace: 'copyrightDisplayPage',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const {
        formData: { id },
        copy = false,
      } = yield select(({ copyrightDisplayPage }) => copyrightDisplayPage);
      if (!id) {
        return {};
      }
      const { data } = yield outputHandle(copyrightDetail, { id });
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      data.authorizedDate = [];
      data.authorizedDate.push(data.authorizedStartDate);
      data.authorizedDate.push(data.authorizedEndDate);
      if (data.relatedResIds !== undefined && data.relatedResIds !== null) {
        data.relatedResId = data.relatedResIds.split(',');
      }
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...data, ...copyObj },
        },
      });
      return data;
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
        output = yield outputHandle(
          copyrightOverallModify,
          formData,
          'copyrightDisplayPage/success'
        );
      } else {
        // 新增
        output = yield outputHandle(copyrightCreate, formData, 'copyrightDisplayPage/success');
      }
      yield put({ type: 'success', payload: output });
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
      if (Array.isArray(element) && name === 'copyrightPartnersList') {
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
