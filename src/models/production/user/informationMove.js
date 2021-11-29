// 框架类
import { isNil } from 'ramda';
import update from 'immutability-helper';

// 产品化组件
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';

// 接口
import { informationDetail, tranSubmit, informationFlowDetail } from '@/services/production/user';
import { getViewConf } from '@/services/gen/flow';
import { informationAssFlowDetail } from '../../../services/production/user';
// 默认状态
const defaultState = {
  formData: {
    hello: 'world',
    details: [],
  },
  modifyFormData: {},
  formMode: 'EDIT',
  copy: false,
  id: undefined,
  deleteKeys: [],
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
  namespace: 'informationMove',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      const {
        formData: { id },
        copy = false,
      } = yield select(({ informationMove }) => informationMove);
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
      const details0 = [];
      const { details } = defaultState.formData;
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...data, ...copyObj, pResId, details: details0 },
        },
      });
      return data;
    },

    // 员工异动流程详情
    *flowInit({ payload }, { put, call, select }) {
      const { data } = yield outputHandle(informationFlowDetail, { ...payload });
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...data },
        },
      });
      return data;
    },

    // 试用期考核流程详情
    // * flowAccInit({ payload }, { put, call, select }) {
    //   const { data } = yield outputHandle(informationAssFlowDetail, { ...payload });
    //   yield put({
    //     type: 'updateState',
    //     payload: {
    //       formData: { ...data },
    //     },
    //   });
    //   return data;
    // },

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

    *save({ payload }, { put, call, select }) {
      const { formData, cb } = payload;
      // 编辑
      const output = yield outputHandle(tranSubmit, formData, cb);
      cb(output);
    },

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      const { taskKey } = response;
      let formMode;
      if (['USER02_04_USER_CONFIRM', 'USER03_02_BU_LEADERS', 'USER03_05_HR'].includes(taskKey)) {
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
