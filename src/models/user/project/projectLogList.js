import {
  getProjectLogList,
  deleteProjectLogs,
  changeDistRq,
  customerDetailsRq,
  customerFuzzyListRq,
  signInvalidRq,
  customerUploadRq,
  projectLogUploadRq,
} from '@/services/user/project/projectLogList';
import router from 'umi/router';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { queryCascaderUdc } from '@/services/gen/app';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { formatDT } from '@/utils/tempUtils/DateTime';
import moment from '../../cservice/manage/detail';

const defaultSearchForm = {};

export default {
  namespace: 'projectLogList',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    searchFuzzyForm: defaultSearchForm,
    resDataSource: [],
    cityList: [],
    formData: {},
    fuzzyList: [],
    fuzzyTotal: 0,
    pageConfig: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const newPayload = {
        ...payload,
        logMentionTimeStart:
          payload && payload.logMentionTime ? formatDT(payload.logMentionTime[0]) : undefined,
        logMentionTimeEnd:
          payload && payload.logMentionTime ? formatDT(payload.logMentionTime[1]) : undefined,
        logMentionTime: null,

        appointedTimeStart:
          payload && payload.appointedTime ? formatDT(payload.appointedTime[0]) : undefined,
        appointedTimeEnd:
          payload && payload.appointedTime ? formatDT(payload.appointedTime[1]) : undefined,
        appointedTime: null,

        actualTimeStart:
          payload && payload.actualTime ? formatDT(payload.actualTime[0]) : undefined,
        actualTimeEnd: payload && payload.actualTime ? formatDT(payload.actualTime[1]) : undefined,
        actualTime: null,

        traceTimeStart: payload && payload.traceTime ? formatDT(payload.traceTime[0]) : undefined,
        traceTimeEnd: payload && payload.traceTime ? formatDT(payload.traceTime[1]) : undefined,
        traceTime: null,

        createTimeStart:
          payload && payload.createTime ? formatDT(payload.createTime[0]) : undefined,
        createTimeEnd: payload && payload.createTime ? formatDT(payload.createTime[1]) : undefined,
        createTime: null,
      };
      const { status, response } = yield call(getProjectLogList, newPayload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      } else {
        const message = response.reason || '查询失败';
        createMessage({ type: 'error', description: message });
      }
    },
    // 删除
    *delete({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ calerdarList }) => calerdarList);
      const { status, response } = yield call(deleteProjectLogs, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '删除成功' });
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '删除失败' });
        }
      }
    },
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resData: list,
          resDataSource: list,
        },
      });
    },
    *upload({ payload }, { call, put, select }) {
      const { status, response } = yield call(projectLogUploadRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (!response.ok) {
          return response;
        }
        return response;
      }
      return {};
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
    },
    // 跳转到录入界面，初始化某些值
    *toAddView({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: { createTime: moment() },
        },
      });
    },
  },

  reducers: {
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
      };
    },
  },
};
