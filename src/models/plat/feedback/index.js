import {
  getFeedbackList,
  deleteFeedbackInfoHandle,
  getFeedbackInfo,
  updateFeedbackInfoHandle,
  closeFeedbackHandle,
  saveRemarkHandle,
  saveResultHandle,
  getRemarkAndResultHandle,
} from '@/services/plat/feedback/';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs, toQs } from '@/utils/stringUtils';

export default {
  namespace: 'feedbackInfo',

  state: {
    dataSource: [],
    total: 0,
    searchForm: {
      solveState: 'SOLVING',
    },
    feedStatus: 'SOLVING',
    btnCanUse: true,
    feedbackDetail: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const params = payload;
      if (params) {
        const { feedbackTime = '' } = params;
        if (Array.isArray(feedbackTime) && feedbackTime[0] && feedbackTime[1]) {
          const [problemStartTime, problemEndTime] = feedbackTime;
          params.problemStartTime = problemStartTime;
          params.problemEndTime = problemEndTime;
        }
        delete params.feedbackTime;
        if (!params.problemTitle) {
          delete params.problemTitle;
        }
      }

      const { response } = yield call(getFeedbackList, params);
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
      const { searchForm } = yield select(({ feedbackInfo }) => feedbackInfo);
      const { response } = yield call(deleteFeedbackInfoHandle, payload);
      if (response.ok) {
        yield put({ type: 'query', payload: searchForm });
        createMessage({ type: 'success', description: '删除成功' });
      } else {
        createMessage({ type: 'error', description: '删除失败' });
      }
    },

    *queryFeedbackInfo({ payload }, { call, put }) {
      const { response } = yield call(getFeedbackInfo, payload.id);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            feedbackDetail: response.datum || {},
            feedStatus: response.datum.solveState || 'SOLVING',
          },
        });
      }
    },
    *save({ payload }, { call, put }) {
      const { response } = yield call(updateFeedbackInfoHandle, payload);
      const { solveType } = payload;
      if (response.ok) {
        createMessage({ type: 'success', description: '回复成功' });
        yield put({
          type: 'updateState',
          payload: { btnCanUse: true },
        });
        if (solveType === 'NO') {
          closeThenGoto('/sys/maintMgmt/feedback');
        } else {
          closeThenGoto('/user/myFeedbacks');
        }
      } else {
        yield put({
          type: 'updateState',
          payload: { btnCanUse: true },
        });
        createMessage({ type: 'error', description: response.reason });
      }
    },

    *close({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ feedbackInfo }) => feedbackInfo);
      const params = {
        ids: payload.ids,
        content: payload.content,
      };
      const { response } = yield call(closeFeedbackHandle, params);
      if (response.ok) {
        createMessage({ type: 'success', description: '关闭成功' });
        yield put({
          type: 'updateState',
          payload: { btnCanUse: true },
        });

        if (payload.backHome) {
          closeThenGoto('/user/myFeedbacks');
        } else {
          yield put({
            type: 'query',
            payload: searchForm,
          });
        }
      } else {
        yield put({
          type: 'updateState',
          payload: { btnCanUse: true },
        });
      }
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          feedbackDetail: {},
          feedStatus: 'SOLVING',
        },
      });
    },

    // *saveRemarkOrResult({ payload }, { call, put }) {
    //   const { pointType, pointContent, id } = payload;
    //   const params = {
    //     remark: pointContent,
    //     feedbackId: id,
    //   };
    //   let api = saveRemarkHandle;
    //   if (pointType === 'result') {
    //     params.result = pointContent;
    //     params.remark = undefined;
    //     api = saveResultHandle;
    //   }
    //   const { response } = yield call(api, params);
    //   if (response && response.ok) {
    //     yield put({
    //       type: 'queryRemarkAndResult',
    //       payload: {
    //         id,
    //       },
    //     });
    //   }
    // },

    // 添加备注
    *saveRemark({ payload }, { call, put }) {
      const { response } = yield call(saveRemarkHandle, payload);

      if (response && response.ok) {
        yield put({
          type: 'queryRemarkAndResult',
          payload: {
            id: fromQs().id,
          },
        });
      }
    },
    // 添加处理结果
    *saveResult({ payload }, { call, put }) {
      const { response } = yield call(saveResultHandle, payload);

      if (response && response.ok) {
        yield put({
          type: 'queryRemarkAndResult',
          payload: {
            id: fromQs().id,
          },
        });
      }
    },

    *queryRemarkAndResult({ payload }, { call, put }) {
      const { response } = yield call(getRemarkAndResultHandle, payload.id);
      if (response && response.ok) {
        const { datum } = response;
        const { remarks, results } = datum;
        yield put({
          type: 'updateState',
          payload: {
            remarkDetail: remarks || [],
            resultDetail: results || [],
          },
        });
      }
    },
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, { pageNo: payload.pageNo });
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
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
