import {
  projClosureApplySaveRq,
  projClosureApplyListRq,
  projClosureApplyDetailsRq,
  projClosureApplyDeleteRq,
  findProjectById,
  pmProjectRq,
  getResultsByProjRq,
  checkresultSaveRq,
  checkresultRq,
} from '@/services/user/project/project';
import { fromQs } from '@/utils/stringUtils';
import { queryReasonList } from '@/services/user/timesheet/timesheet';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import createMessage from '@/components/core/AlertMessage';

const defaultSearchForm = {};
const defaultFormData = {};

export default {
  namespace: 'finishProject',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    dataSource: [],
    resDataSource: [],
    baseBuDataSource: [],
    projList: [],
    formData: {},
    selfChkList: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { applyDate, ...params } = payload;
      if (Array.isArray(applyDate) && applyDate[0] && applyDate[1]) {
        [params.applyDateStart, params.applyDateEnd] = applyDate;
      }

      const { status, response } = yield call(projClosureApplyListRq, params);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
        yield put({
          type: 'updateSearchForm',
          payload: {
            selectedRowKeys: [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *submit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ finishProject }) => finishProject);
      const { status, response } = yield call(projClosureApplySaveRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *projClosureApplyDetails({ payload }, { call, put }) {
      const { status, response } = yield call(projClosureApplyDetailsRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateForm',
            payload: {
              ...response.datum,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
    },
    *findProjectDetailsById({ payload }, { call, put }) {
      const { status, response } = yield call(findProjectById, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          const { id, remark, ...newResponse } = response.datum;
          yield put({
            type: 'updateForm',
            payload: {
              ...newResponse,
              projId: id,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
    },
    *pmProject({ payload }, { call, put }) {
      const { status, response } = yield call(pmProjectRq);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            projList: Array.isArray(response) ? response : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取项目失败' });
      }
    },
    *getResultsByProj({ payload }, { call, put }) {
      const { status, response } = yield call(getResultsByProjRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              selfChkList: Array.isArray(response.datum) ? response.datum : [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取检查事项失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取检查事项失败' });
      }
    },
    *checkresult({ payload }, { call, put }) {
      const { status, response } = yield call(checkresultRq, payload);
      if (status === 200 && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            selfChkList: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取办理事项列表失败' });
      }
    },
    *checkresultUpdate({ payload }, { call, put }) {
      const { status, response } = yield call(checkresultSaveRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '结项检查事项处理失败' });
      return {};
    },
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(projClosureApplyDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: response.reason || '删除成功' });
          const { searchForm } = yield select(({ finishProject }) => finishProject);
          yield put({
            type: 'query',
            payload: searchForm,
          });
          yield put({
            type: 'updateSearchForm',
            payload: {
              selectedRowKeys: [],
            },
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
      yield put({
        type: 'updateForm',
        payload: { baseBuId: '', baseBuName: '' },
      });
    },
    // 获得项目下拉数据
    *queryProjList({ payload }, { call, put }) {
      const { response } = yield call(queryReasonList);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            projList: Array.isArray(response) ? response : [],
          },
        });
      }
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
          selfChkList: [],
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
