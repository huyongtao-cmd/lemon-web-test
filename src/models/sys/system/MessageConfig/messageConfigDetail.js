import { messageConfigDetailUriRq } from '@/services/sys/system/messageConfiguration';
import { isNil, isEmpty } from 'ramda';

export default {
  namespace: 'messageConfigDetail',
  state: {
    detailFormData: {},
  },
  effects: {
    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(messageConfigDetailUriRq, payload);
      if (status === 200) {
        if (response) {
          const {
            noticeRolesName,
            noticeBusName,
            noticeUsersName,
            noticeScopeDesc,
            noticeExpression,
            noticeScope,
            messageTagName,
          } = response;
          let roles = '';
          if (noticeScope === 'SPECIFY_ROLE') {
            roles = noticeRolesName;
          } else if (noticeScope === 'SPECIFY_BU') {
            roles = noticeBusName;
          } else if (noticeScope === 'SPECIFY_PERSON') {
            roles = noticeUsersName;
          } else if (noticeScope === 'SPECIAL') {
            roles = noticeScopeDesc;
          } else if (noticeScope === 'EXPRESSION') {
            roles = noticeExpression;
          }
          yield put({
            type: 'updateForm',
            payload: {
              ...response,
              messageTagName: messageTagName
                ? messageTagName.replace(/null/g, '标签已删除')
                : messageTagName,
              roles,
            },
          });
        }
      }
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
      const { detailFormData } = state;
      const newFormData = { ...detailFormData, ...payload };
      return {
        ...state,
        detailFormData: newFormData,
      };
    },
  },
};
