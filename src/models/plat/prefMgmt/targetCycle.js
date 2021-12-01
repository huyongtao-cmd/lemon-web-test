import { isEmpty } from 'ramda';
import createMessage from '@/components/core/AlertMessage';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import {
  targetPeriodListRq,
  createTargetPeriodRq,
  targetPeriodDeleteRq,
  targetPeriodDetailRq,
  targetResListRq,
  feedbackResListRq,
  feedbackNoticedListRq,
  summaryResListRq,
  summaryNoticedListRq,
  feedbackBatchSetRq,
  summaryBatchSetRq,
  targetNoticedListRq,
  targetBatchSetRq,
  getResDetailRq,
} from '@/services/plat/prefCheck/performance';

export default {
  namespace: 'targetCycle',

  state: {
    formData: {},
    dataSource: [],
    dataListSelected: [],
    createResList: {
      list: [],
      total: undefined,
    },
    haveNotifiedList: {
      notifiedList: [],
      notifiedTotal: undefined,
    },
  },

  effects: {
    // 请求列表页
    *query({ payload }, { call, put }) {
      const { response } = yield call(targetPeriodListRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.data.rows,
            total: response.data.total,
          },
        });
      }
    },

    // 新建/修改
    *save({ payload }, { call, put, select }) {
      let beginDate = payload?.beginDate;
      let endDate = payload?.endDate;
      if (payload.dates && !isEmpty(payload.dates)) {
        beginDate = payload?.dates[0];
        endDate = payload?.dates[1];
      }
      const { status, response } = yield call(createTargetPeriodRq, {
        ...payload,
        beginDate,
        endDate,
      });
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          yield put({
            type: 'query',
            payload: {
              offset: 0,
              limit: 10,
              sortBy: 'id',
              sortDirection: 'DESC',
            },
          });
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },

    // 删除
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(targetPeriodDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          yield put({
            type: 'query',
            payload: {
              offset: 0,
              limit: 10,
              sortBy: 'id',
              sortDirection: 'DESC',
            },
          });
        } else {
          const message = response.reason || '操作失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },

    // 详情
    *getDetail({ payload }, { call, put }) {
      const { response, status } = yield call(targetPeriodDetailRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              formData: response.data,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详情出错' });
        }
      }
    },

    // 绩效待通知人员列表
    *queryResList({ payload }, { call, put }) {
      const { response } = yield call(targetResListRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            createResList: {
              list: response.data,
            },
          },
        });
      }
    },

    // 绩效已通知人员列表
    *queryTargetNoticedList({ payload }, { call, put }) {
      const { response } = yield call(targetNoticedListRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            haveNotifiedList: {
              notifiedList: response.data,
            },
          },
        });
      }
    },

    // 批量发起kpi设置流程
    *targetBatchSet({ payload }, { call, put, select }) {
      const { status, response } = yield call(targetBatchSetRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto(`/user/flow/process`);
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },

    // 年中待通知人员列表
    *queryFeedbackResList({ payload }, { call, put }) {
      const { response } = yield call(feedbackResListRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            createResList: {
              list: response.data,
            },
          },
        });
      }
    },

    // 年中已通知人员列表
    *queryFeedbackNoticedList({ payload }, { call, put }) {
      const { response } = yield call(feedbackNoticedListRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            haveNotifiedList: {
              notifiedList: response.data,
            },
          },
        });
      }
    },

    // 批量发起年中反馈流程
    *feedbackBatchSet({ payload }, { call, put, select }) {
      const { status, response } = yield call(feedbackBatchSetRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto(`/user/flow/process`);
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },

    // 年末待通知人员列表
    *querySummaryResList({ payload }, { call, put }) {
      const { response } = yield call(summaryResListRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            createResList: {
              list: response.data,
            },
          },
        });
      }
    },

    // 年末已通知人员列表
    *querySummaryNoticedList({ payload }, { call, put }) {
      const { response } = yield call(summaryNoticedListRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            haveNotifiedList: {
              notifiedList: response.data,
            },
          },
        });
      }
    },

    // 批量发起年末报告流程
    *summaryBatchSet({ payload }, { call, put, select }) {
      const { status, response } = yield call(summaryBatchSetRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '提交成功' });
          closeThenGoto(`/user/flow/process`);
        } else {
          const message = response.reason || '提交失败';
          createMessage({ type: 'warn', description: message });
        }
      }
    },

    // 根据资源获取详情
    *getResDetail({ payload }, { call, put }) {
      const { response } = yield call(getResDetailRq, payload);
      return response;
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
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

    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
