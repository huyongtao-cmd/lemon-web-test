import {
  systemLocaleDetail,
  systemLocaleCreate,
  systemLocaleModify,
} from '@/services/production/system';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import { isEmpty, isNil, omit } from 'ramda';
import update from 'immutability-helper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/production/stringUtil.ts';

const defaultState = {
  formData: {
    details: [],
  },
  deleteKeys: [],
  formMode: 'EDIT',
};

export default {
  namespace: 'systemLocaleEdit',

  state: defaultState,

  effects: {
    *init({ payload }, { call, put }) {
      const { id, mode } = fromQs();
      if (!id) {
        return;
      }
      const { data } = yield outputHandle(systemLocaleDetail, { id });
      yield put({
        type: 'updateState',
        payload: {
          formData: data,
        },
      });
    },

    *save({ payload }, { call, put, select }) {
      const { formData, deleteKeys } = payload;
      const { id } = formData;
      const param = { entity: omit(['details'], formData), details: formData.details, deleteKeys };
      let output;
      if (id && id > 0) {
        // 编辑
        const { data } = yield outputHandle(systemLocaleModify, param);
        output = data;
      } else {
        // 新增
        const { data } = yield outputHandle(systemLocaleCreate, param);
        // const {response} = yield call(systemLocaleCreate, formData);
        output = data;
      }

      yield put({
        type: 'init',
        payload: {},
      });

      yield put({
        type: 'updateState',
        payload: {
          formMode: 'DESCRIPTION',
        },
      });
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateForm(state, { payload }) {
      const { formData } = state;
      return {
        ...state,
        formData: { ...formData, ...payload },
      };
    },
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

    cleanState(state, { payload }) {
      return defaultState;
    },
  },
};
