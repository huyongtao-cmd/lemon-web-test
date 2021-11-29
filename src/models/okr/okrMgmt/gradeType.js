import { selectUserMultiCol } from '@/services/user/Contract/sales';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { isEmpty, isNil } from 'ramda';
import { genFakeId } from '@/utils/mathUtils';

const defaultFormData = {
  gradeType: 'LINEAR',
};

export default {
  namespace: 'gradeType',
  state: {
    gradeTypeFormData: defaultFormData,
    gradeTypeList: [],
    gradeTypeListDel: [],
  },

  effects: {
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          gradeTypeFormData: defaultFormData,
          gradeTypeList: [],
          gradeTypeListDel: [],
        },
      });
    },
  },

  reducers: {
    updateGradeTypeForm(state, { payload }) {
      const { gradeTypeFormData } = state;
      const newFormData = { ...gradeTypeFormData, ...payload };
      return {
        ...state,
        gradeTypeFormData: newFormData,
      };
    },
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
