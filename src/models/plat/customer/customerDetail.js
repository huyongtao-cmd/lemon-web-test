export default {
  namespace: 'customerDetail',

  state: {
    custNo: 121212,
    custName: null,
    custStatus: null,
    custType1: null,
    buId: null,
    salemanId: null,
    regionCode: null,
    industry: null,
    custScale: null,
    relatedCustId: null,
    contactName: null,
    contactPhone: null,
    contactDept: null,
    contactPosition: null,
    website: null,
    taxNo: null,
    remark: null,
    createUserId: null,
    createUserName: null,
    createDate: '2018-09-09',

    mode: 'create',
  },

  effects: {},

  reducers: {
    updateState(state, action) {
      switch (action.type) {
        case 'customerDetail/updateState':
          return Object.assign([], state, action.payload);
        default:
          return state;
      }
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {
        dispatch({ type: 'clean' });
      });
    },
  },
};
