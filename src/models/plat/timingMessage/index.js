import {
  getTimingMessageList,
  saveMessageHandle,
  getMessageInfo,
  updateMessageHandle,
  seedMessageHandle,
  deleteMessageHandle,
  recallHandle,
} from '@/services/plat/message';
import { selectIamUsers } from '@/services/gen/list';
import { selectBus } from '@/services/org/bu/bu';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { findRoles as findBuTmplRoleSelect } from '@/services/sys/iam/roles';

export default {
  namespace: 'timingMessageInfo',

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
    loading: true,
    targetKeys: [],
    scopeType: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const params = payload;
      if (params) {
        const { createTime = '' } = params;
        if (Array.isArray(createTime) && createTime[0] && createTime[1]) {
          const [startTime, endTime] = createTime;
          params.createTimeStart = startTime;
          params.createTimeEnd = endTime;
        }
        delete params.createTime;
        if (!params.releaseTitle) {
          delete params.releaseTitle;
        }
      }

      const { response } = yield call(getTimingMessageList, params);
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
      const { searchForm } = yield select(({ timingMessageInfo }) => timingMessageInfo);
      const { response } = yield call(deleteMessageHandle, payload);
      if (response.ok) {
        yield put({ type: 'query', payload: searchForm });
        createMessage({ type: 'success', description: '删除成功' });
      } else {
        createMessage({ type: 'error', description: '删除失败' });
      }
    },

    *recall({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ timingMessageInfo }) => timingMessageInfo);
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
        const formData = response.datum;
        let targetKeys = [];
        let scopeType = 0;

        if (formData.noticeScopeFlag === 3) {
          formData.noticeScopeFlagTmp = 3;
        }
        if (formData.noticeScopeFlag === 4) {
          formData.noticeScopeFlagTmp = 4;
        }
        if (
          formData.noticeScopeFlag === 0 ||
          formData.noticeScopeFlag === 1 ||
          formData.noticeScopeFlag === 2
        ) {
          formData.noticeScopeFlagTmp = -1;
          formData.noticeScope = formData.noticeScope ? formData.noticeScope.split(',') : [];
          targetKeys = targetKeys.concat(formData.noticeScope);
          scopeType = formData.noticeScopeFlag;
        }

        yield put({
          type: 'updateState',
          payload: {
            formData,
            loading: false,
            targetKeys,
            scopeType,
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
    *seedMessage({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ timingMessageInfo }) => timingMessageInfo);
      const { response } = yield call(seedMessageHandle, payload.id);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '发布成功' });
        yield put({ type: 'query', payload: searchForm });
      }
    },
    *save({ payload }, { call, put }) {
      const { isPublish, noticeScope, id } = payload;
      const params = {
        isPublish: 'save',
        releaseSource: payload.releaseSource,
        releaseTitle: payload.releaseTitle,
        releaseType: payload.releaseType,
        releaseLevel: payload.releaseLevel,
        releaseBody: payload.releaseBody,
        noticeWay: payload.noticeWay.join(','),
        timingUsable: payload.timingUsable,
        noticeScopeFlag: payload.noticeScopeFlag,
        noticeScope: payload.noticeScope || '',
        timingCode: payload.timingCode,
      };
      if (id) {
        params.id = id;
      }
      if (
        payload.noticeScopeFlag === 0 ||
        payload.noticeScopeFlag === 1 ||
        payload.noticeScopeFlag === 2
      ) {
        params.noticeScope = payload.noticeScope.join(',');
      }
      if (payload.noticeScopeFlag === 3) {
        params.noticeScope = '';
      }
      const { response } = yield call(saveMessageHandle, params);
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({
          type: 'updateState',
          payload: { btnCanUse: true },
        });
        closeThenGoto('/plat/messageMgmt/timingMessage');
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
