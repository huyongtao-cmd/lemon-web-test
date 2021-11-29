import {
  objectiveListRq,
  objectiveDetailRq,
  targetResultFlowDetailRq,
  selectGradeListRq,
} from '@/services/okr/okrMgmt';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty } from 'ramda';

const defaultSearchForm = {};

export default {
  namespace: 'targetEvalApply',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    keyresultList: [],
    objectiveList: [],
    sonObjectiveList: [],
    objectiveListAll: [],
    formData: {},
    twOkrKeyresultView: [],
  },

  effects: {
    *targetResultFlowDetail({ payload }, { call, put }) {
      const { status, response } = yield call(targetResultFlowDetailRq, payload);
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              formData: { ...response.datum, twOkrKeyresultView: null },
              twOkrKeyresultView: Array.isArray(response.datum.twOkrKeyresultView)
                ? response.datum.twOkrKeyresultView
                : [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
      }
    },
    *queryObjectiveList({ payload }, { call, put }) {
      const { status, response } = yield call(objectiveListRq);
      if (status === 200) {
        const { rows } = response;
        yield put({
          type: 'updateState',
          payload: {
            objectiveList: Array.isArray(rows) ? rows.filter(v => v.objTotalSon) : [],
            sonObjectiveList: Array.isArray(rows) ? rows : [],
            objectiveListAll: Array.isArray(rows) ? rows : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *query({ payload }, { call, put }) {
      const { finalScore, ...params } = payload;

      if (Array.isArray(finalScore) && (finalScore[0] || finalScore[1])) {
        [params.scroeMin, params.scoreMax] = finalScore;
      }

      const { response } = yield call(selectGradeListRq, params);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
    },
    *clean({ payload }, { call, put }) {
      yield put({
        type: 'updateForm',
        payload: {},
      });
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
        list: [],
        total: 0,
      };
    },
  },
};
