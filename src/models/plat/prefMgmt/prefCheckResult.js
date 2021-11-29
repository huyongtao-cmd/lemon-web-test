import {
  examFinallyListRq,
  myExamFinallyListRq,
  examByIdViewRq,
  examByIdResDetailRq,
} from '@/services/plat/prefCheck/prefCheckResult';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { queryCascaderUdc } from '@/services/gen/app';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty } from 'ramda';

const defaultSearchForm = {};

export default {
  namespace: 'prefCheckResult',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    resDataSource: [],
    baseBuDataSource: [],
    formData: {
      resVacationApply: {},
      recentResVacationList: [],
      resVacationList: [],
    },
    type2: [],
    othersColumns: [],
    pageConfig: {},
  },

  effects: {
    *examByIdResDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(examByIdResDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return [];
      }
      if (status === 200) {
        if (response && response.ok) {
          const {
            relatedEntityList,
            resBuNoViewList,
            gradeScore,
            gradeExam,
            examTmplPointViewList,
          } = response.datum;

          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...response.datum,
                relatedRole: !isEmpty(relatedEntityList)
                  ? relatedEntityList.filter(v => v.relatedType === 'EXAM_CFM')[0].relatedRole
                  : '',
                resId: !isEmpty(relatedEntityList)
                  ? relatedEntityList.filter(v => v.relatedType === 'EXAM_CFM')[0].resId
                  : undefined,
                // countType: !isEmpty(examTmplPointViewList)
                //   ? examTmplPointViewList[0].countType
                //   : '',
                gradeScoreFiy: gradeScore,
                gradeExamFiy: gradeExam,
              },
              relatedEntityListExamEval: relatedEntityList.filter(
                v => v.relatedType === 'EXAM_EVAL'
              ),
              checkResData: resBuNoViewList,
              relatedEntityListExamCheck: Array.isArray(relatedEntityList)
                ? relatedEntityList.filter(v => v.relatedType === 'EXAM_CHECK')
                : [],
              examTmplPointViewList: examTmplPointViewList.map(v => ({
                ...v,
                evalScore: null,
                evalComment: null,
              })),
            },
          });
          return examTmplPointViewList;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        return [];
      }
      createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      return [];
    },
    *examByIdView({ payload }, { call, put, select }) {
      const { status, response } = yield call(examByIdViewRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          const data = response.datum || {};
          yield put({
            type: 'updateForm',
            payload: {
              ...data,
            },
          });
          return data;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      return {};
    },
    *myExamFinallyList({ payload }, { call, put }) {
      const { resTypeArr, finalScore, ...params } = payload;
      if (Array.isArray(resTypeArr) && (resTypeArr[0] || resTypeArr[1])) {
        [params.resType1, params.resType2] = resTypeArr;
      }
      if (Array.isArray(finalScore) && (finalScore[0] || finalScore[1])) {
        [params.scroeMin, params.scoreMax] = finalScore;
      }
      const { response } = yield call(myExamFinallyListRq, params);
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
    *query({ payload }, { call, put }) {
      const { resTypeArr, finalScore, ...params } = payload;
      if (Array.isArray(resTypeArr) && (resTypeArr[0] || resTypeArr[1])) {
        [params.resType1, params.resType2] = resTypeArr;
      }
      if (Array.isArray(finalScore) && (finalScore[0] || finalScore[1])) {
        [params.scroeMin, params.scoreMax] = finalScore;
      }

      const { response } = yield call(examFinallyListRq, params);
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
    // 分类一关联分类二
    *typeChange({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:RES_TYPE2',
        parentDefId: 'RES:RES_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { type2: Array.isArray(response) ? response : [] },
        });
      }
    },
    *clean({ payload }, { call, put }) {
      yield put({
        type: 'updateForm',
        payload: {},
      });
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
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {
        if (pathname === '/hr/prefMgmt/prefCheckResult/index') {
          dispatch({
            type: 'getPageConfig',
            payload: { pageNo: 'PERFORMANCE_EXAM_RESULT_LIST' },
          });
        } else if (
          pathname === '/hr/prefMgmt/prefCheckResult/view' ||
          pathname === '/hr/prefMgmt/prefCheckResult/detail'
        )
          dispatch({
            type: 'getPageConfig',
            payload: { pageNo: 'PERFORMANCE_EXAM_RESULT_DETAIL' },
          });
      });
    },
  },
};
