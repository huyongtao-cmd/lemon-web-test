import { commonModelReducers } from '@/utils/production/modelUtils.ts';

const defaultState = {};
export default {
  namespace: 'subjectTemplateList',
  state: defaultState,

  effects: {
    *init({ payload }, { call, put }) {
      //
    },
  },

  reducers: {
    // 使用工具方法快速写updateState,updateForm,cleanState 方法
    ...commonModelReducers(defaultState),
  },
};
