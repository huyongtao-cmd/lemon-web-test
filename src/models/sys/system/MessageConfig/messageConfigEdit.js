import {
  messageConfigDetailUriRq,
  messageConfigInsertUriRq,
  messageConfigUpdateUriRq,
  queryMessageTagUriRq,
  queryRolesUriRq,
} from '@/services/sys/system/messageConfiguration';
import { selectIamUsers } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { isNil, isEmpty } from 'ramda';

const dafaultFormData = {
  contentType: 'BUSSINESS_REMIND',
};
export default {
  namespace: 'messageConfigEdit',
  state: {
    formData: dafaultFormData,
    resDataSource: [],
    baseBuDataSource: [],
    tagSource: [],
    dataSource: [],
    loadFinish: false,
  },
  effects: {
    // 发布范围我用多个字段的原因是，无论选择哪种方式，都用roles代替了，但是在传参时，用的是不同字段
    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(messageConfigDetailUriRq, payload);
      if (status === 200) {
        if (response) {
          const {
            noticeRoles,
            noticeBus,
            noticeUsers,
            noticeScopeDesc,
            noticeExpression,
            noticeScope,
            noticeWay = [],
            messageTag = [],
          } = response;
          let roles = '';
          if (noticeScope === 'SPECIFY_ROLE') {
            roles = noticeRoles;
          } else if (noticeScope === 'SPECIFY_BU') {
            roles = noticeBus;
          } else if (noticeScope === 'SPECIFY_PERSON') {
            roles = noticeUsers;
          } else if (noticeScope === 'SPECIAL') {
            roles = noticeScopeDesc;
          } else if (noticeScope === 'EXPRESSION') {
            roles = noticeExpression;
          }
          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...response,
                roles: !isNil(roles) && !isEmpty(roles) ? roles.split(',') : [],
                noticeWay: !isNil(noticeWay) && !isEmpty(noticeWay) ? noticeWay.split(',') : [],
                messageTag: !isNil(messageTag) && !isEmpty(messageTag) ? messageTag.split(',') : [],
              },
              loadFinish: true,
            },
          });
        }
      }
    },
    //
    *roles({ payload }, { call, put }) {
      const { response } = yield call(queryRolesUriRq, payload);
      const list = Array.isArray(response) ? response : [];
      list.forEach(v => {
        // eslint-disable-next-line no-param-reassign
        v.key = v.code;
      });
      yield put({
        type: 'updateState',
        payload: {
          dataSource: list,
        },
      });
    },
    // 用户
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectIamUsers);
      response.forEach(v => {
        // eslint-disable-next-line no-param-reassign
        v.key = v.code;
      });
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resDataSource: list,
        },
      });
    },
    *bu({ payload }, { call, put }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuDataSource: list,
        },
      });
    },
    // 查询所有的消息标签
    *queryMessageTag({ payload }, { call, put }) {
      const { response } = yield call(queryMessageTagUriRq);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          tagSource: list,
        },
      });
    },
    *save({ payload }, { call, put, select }) {
      const { formData } = yield select(({ messageConfigEdit }) => messageConfigEdit);
      const { noticeWay, messageTag, noticeScope, roles } = formData;
      if (noticeScope === 'SPECIFY_ROLE') {
        formData.noticeRoles = roles.join(',');
      } else if (noticeScope === 'SPECIFY_BU') {
        formData.noticeBus = roles.join(',');
      } else if (noticeScope === 'SPECIFY_PERSON') {
        formData.noticeUsers = roles.join(',');
      } else if (noticeScope === 'SPECIAL') {
        formData.noticeScopeDesc = roles;
      } else if (noticeScope === 'EXPRESSION') {
        formData.noticeExpression = roles;
      }
      formData.noticeWay = Array.isArray(noticeWay) ? noticeWay.join(',') : noticeWay;
      formData.messageTag = Array.isArray(messageTag) ? messageTag.join(',') : messageTag;
      const { status, response } = yield call(messageConfigInsertUriRq, {
        ...formData,
        ...payload,
      });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },

    *edit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ messageConfigEdit }) => messageConfigEdit);
      const {
        noticeWay,
        messageTag,
        noticeScope,
        roles,
        noticeRoles,
        noticeBus,
        noticeUsers,
        noticeScopeDesc,
        noticeExpression,
      } = formData;
      // 清除由初始化查询到的值
      if (noticeRoles) {
        formData.noticeRoles = '';
      }
      if (noticeBus) {
        formData.noticeBus = '';
      }
      if (noticeUsers) {
        formData.noticeUsers = '';
      }
      if (noticeScopeDesc) {
        formData.noticeScopeDesc = '';
      }
      if (noticeExpression) {
        formData.noticeExpression = '';
      }
      if (noticeScope === 'SPECIFY_ROLE') {
        formData.noticeRoles = Array.isArray(roles) ? roles.join(',') : roles;
      } else if (noticeScope === 'SPECIFY_BU') {
        formData.noticeBus = Array.isArray(roles) ? roles.join(',') : roles;
      } else if (noticeScope === 'SPECIFY_PERSON') {
        formData.noticeUsers = Array.isArray(roles) ? roles.join(',') : roles;
      } else if (noticeScope === 'SPECIAL') {
        formData.noticeScopeDesc = Array.isArray(roles) ? roles.join(',') : roles;
      } else if (noticeScope === 'EXPRESSION') {
        formData.noticeExpression = Array.isArray(roles) ? roles.join(',') : roles;
      }
      formData.noticeWay = Array.isArray(noticeWay) ? noticeWay.join(',') : noticeWay;
      formData.messageTag = Array.isArray(messageTag) ? messageTag.join(',') : messageTag;
      const { status, response } = yield call(messageConfigUpdateUriRq, {
        ...formData,
        ...payload,
      });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
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
    cleanFormData(state, action) {
      return {
        ...state,
        formData: {
          ...dafaultFormData,
        },
      };
    },
  },
};
