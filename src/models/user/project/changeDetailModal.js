const defaultFormData = {
  applyResId: null,
  applyResName: null,
  applyTime: null,
  changeBrief: null,
  remark: null,
  businessChangeDetailEntities: [],
};
export default {
  namespace: 'changeDetailModal',
  state: {
    formData: defaultFormData,
  },
  effects: {
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
        },
      });
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
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
  },
};
