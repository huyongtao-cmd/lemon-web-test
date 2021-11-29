import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'oldProductTheme',
  state: {},

  effects: {},

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
