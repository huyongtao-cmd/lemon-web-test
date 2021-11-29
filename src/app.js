/* eslint-disable no-console */

export const dva = {
  config: {
    onError(err) {
      err.preventDefault && err.preventDefault();
      // tag :: 这里有需要就是做错误日志记录了，作为最后一道兜底。。。
      console.error(err.message || err);
    },
    onReducer: reducer => (state, action) => {
      const { type } = action;
      const newState = reducer(state, action);
      // console.log('action:', action);
      // console.log('newState:', newState);
      // !!focus:: dispatch({ type: 'RESET' }) 把状态重置
      if (type === 'RESET') {
        return {
          loading: newState.loading,
          routing: newState.routing,
          uiSettings: newState.uiSettings,
          global: { ...newState.global, panes: [], activePane: '' },
          login: newState.login,
          user: {
            user: {
              info: {},
              extInfo: {},
            },
            formData: {},
            myShortCut: [],
            sysShortCut: [],
          },
          userCenter: {
            myShortCut: [],
            sysShortCuts: [],
            newSortNo: null,
            todoList: [],
            backList: [],
            doneList: [],
            notifyList: [],
            myInfo: {},
            recentWork: [],
            activeTabKey: '1',
            messageList: [],
          },
        };
      }
      return newState;
    },
  },
};
