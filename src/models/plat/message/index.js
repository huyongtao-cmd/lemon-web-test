import {
  getMessageList,
  saveMessageHandle,
  getMessageInfo,
  updateMessageHandle,
  seedMessageHandle,
  deleteMessageHandle,
  recallHandle,
} from '@/services/plat/message';
import { queryMessageTagUriRq } from '@/services/sys/system/messageConfiguration';
import { selectIamUsers } from '@/services/gen/list';
import { selectBus } from '@/services/org/bu/bu';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { findRoles as findBuTmplRoleSelect } from '@/services/sys/iam/roles';
import { isNil, isEmpty } from 'ramda';

export default {
  namespace: 'messageInfo',

  state: {
    dataSource: [],
    total: 0,
    searchForm: {
      isRead: 0,
    },
    btnCanUse: true,
    formData: {},
    detailFormData: {},
    userList: [],
    tagSource: [],
    loading: true,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const params = payload;
      if (params) {
        const { releaseTime = '' } = params;
        if (Array.isArray(releaseTime) && releaseTime[0] && releaseTime[1]) {
          const [startTime, endTime] = releaseTime;
          params.releaseStartTime = startTime;
          params.releaseEndTime = endTime;
        }
        delete params.releaseTime;
        if (!params.releaseTitle) {
          delete params.releaseTitle;
        }
      }

      const { response } = yield call(getMessageList, params);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
          },
        });
      }
    },

    *del({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ messageInfo }) => messageInfo);
      const { response } = yield call(deleteMessageHandle, payload);
      if (response.ok) {
        yield put({ type: 'query', payload: searchForm });
        createMessage({ type: 'success', description: '删除成功' });
      } else {
        createMessage({ type: 'error', description: '删除失败' });
      }
    },

    *recall({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ messageInfo }) => messageInfo);
      const { response } = yield call(recallHandle, payload);
      if (response.ok) {
        yield put({ type: 'query', payload: searchForm });
        createMessage({ type: 'success', description: '撤回成功' });
      } else {
        createMessage({ type: 'error', description: '撤回失败' });
      }
    },

    *queryMessageInfo({ payload }, { call, put, select }) {
      const { response } = yield call(getMessageInfo, payload.id);
      if (response && response.ok) {
        const { messageTag } = response.datum;
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...response.datum,
              noticeScope: '',
              noticeScopeFlag: '0',
              messageTag: !isNil(messageTag) && !isEmpty(messageTag) ? messageTag.split(',') : [],
            } || {
              noticeScope: '',
              noticeScopeFlag: '0',
            },
            loading: false,
          },
        });
      }
    },
    *queryMessageDetailInfo({ payload }, { call, put }) {
      const { response } = yield call(getMessageInfo, payload.id);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            detailFormData: response.datum || {},
          },
        });
      }
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
    *seedMessage({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ messageInfo }) => messageInfo);
      const { response } = yield call(seedMessageHandle, payload.id);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '发布成功' });
        yield put({ type: 'query', payload: searchForm });
      }
    },
    *save({ payload }, { call, put }) {
      const { isPublish, noticeScope, id } = payload;
      const mesTips = isPublish === 'save' ? '保存' : '发布';
      const params = {
        isPublish: payload.isPublish,
        releaseSource: payload.releaseSource,
        releaseTitle: payload.releaseTitle,
        releaseType: payload.releaseType,
        releaseLevel: payload.releaseLevel,
        releaseBody: payload.releaseBody,
        noticeWay: Array.isArray(payload.noticeWay)
          ? payload.noticeWay.join(',')
          : payload.noticeWay,
        messageTag: Array.isArray(payload.messageTag)
          ? payload.messageTag.join(',')
          : payload.messageTag,
      };
      if (isPublish === 'publish') {
        params.noticeScope = noticeScope ? noticeScope.join(',') : '';
        params.noticeScopeFlag = payload.noticeScopeFlag;
      }
      if (id) {
        params.id = id;
        delete params.noticeScopeList;
      }
      const { response } = yield call(saveMessageHandle, params);
      if (response.ok) {
        createMessage({ type: 'success', description: `${mesTips}成功` });
        yield put({
          type: 'updateState',
          payload: { btnCanUse: true },
        });
        closeThenGoto('/plat/messageMgmt/message');
      } else {
        yield put({
          type: 'updateState',
          payload: { btnCanUse: true },
        });
        createMessage({ type: 'error', description: response.reason });
      }
    },

    *selectUser(_, { call, put }) {
      const { response } = yield call(selectIamUsers);
      response.forEach(v => {
        // eslint-disable-next-line no-param-reassign
        v.key = v.code;
      });
      yield put({
        type: 'updateState',
        payload: {
          userList: response,
        },
      });
    },

    *selectBus(_, { call, put }) {
      const { response } = yield call(selectBus);
      response.forEach(v => {
        // eslint-disable-next-line no-param-reassign
        v.key = v.code;
      });
      yield put({
        type: 'updateState',
        payload: {
          busList: response,
        },
      });
    },
    // 查询角色信息
    *queryRoleList({ payload }, { call, put }) {
      const { response } = yield call(findBuTmplRoleSelect, { limit: 1000 });
      if (response) {
        const data = Array.isArray(response.rows) ? response.rows : [];
        data.forEach(v => {
          // eslint-disable-next-line no-param-reassign
          v.key = v.code;
        });
        yield put({
          type: 'updateState',
          payload: { roleList: data },
        });
      }
    },

    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          btnCanUse: true,
          formData: {},
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
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
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
