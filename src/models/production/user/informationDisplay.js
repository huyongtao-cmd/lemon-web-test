// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';
// service方法
import { informationDetail, modifyInformation } from '@/services/production/user';
import { accountSelectPaging } from '@/services/production/common/select';
import { isNil } from 'ramda';
import update from 'immutability-helper';

// 默认状态
const defaultState = {
  formData: {
    hello: 'world',
  },
  modifyFormData: {},
  formMode: 'EDIT',
  copy: false,
  id: undefined,
};

export default {
  namespace: 'informationDisplay',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const {
        formData: { id },
        copy = false,
      } = yield select(({ informationDisplay }) => informationDisplay);
      if (!id) {
        return defaultState.formData;
      }
      const { data } = yield outputHandle(informationDetail, { id });
      // 当为复制时,处理id为null
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      const pResId = data.presId;
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...data, ...copyObj, pResId },
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
      // 页面变为详情模式
      // yield put({
      //   type: 'updateState',
      //   payload: {
      //     formMode: 'DESCRIPTION',
      //   },
      // });
    },

    *save({ payload }, { put, select }) {
      const { formData, cb } = payload;
      // 编辑
      const output = yield outputHandle(modifyInformation, formData, cb);
      cb(output);
    },

    /**
     * 收款账户
     * @param payload
     * @param put
     * @param select
     * @returns {IterableIterator<Promise<OutputProps | OutputProps | any>|*>}
     */
    *fetchAccountList({ payload }, { put, select }) {
      const {
        formData: { accountNo },
      } = yield select(({ informationDisplay }) => informationDisplay);
      const { data } = yield outputHandle(accountSelectPaging, { limit: 0, ...payload });
      const accountList = data.rows.map(item => ({
        ...item,
        value: item.accountNo,
        title: item.accountNo,
      }));

      yield put({
        type: 'updateState',
        payload: {
          accountList,
        },
      });

      if (accountList.length > 0 && !accountNo) {
        yield put({
          type: 'updateForm',
          payload: {
            accountNo: accountList[0].accountNo,
            holderName: accountList[0].holderName,
            bankName: accountList[0].bankName,
            bankBranch: accountList[0].bankBranch,
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
      const { formData, modifyFormData } = state;
      const name = Object.keys(payload)[0];
      const element = payload[name];
      let newFormData;
      let modifyData;
      if (Array.isArray(element)) {
        element.forEach((ele, index) => {
          if (!isNil(ele)) {
            newFormData = update(formData, { [name]: { [index]: { $merge: ele } } });
          }
        });
      } else {
        newFormData = { ...formData, ...payload };
        modifyData = { ...modifyFormData, ...payload };
      }

      return {
        ...state,
        formData: newFormData,
        modifyFormData: modifyData,
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
