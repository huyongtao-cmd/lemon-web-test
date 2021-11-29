import {
  examTmplListRq,
  examTmplCreateRq,
  examTmplDetailsRq,
  examTmplEditRq,
  examTmplDeleteRq,
  examTmplChangeStatusRq,
} from '@/services/plat/prefCheck/prefCheckMgmt';
import { systemFunctionListPaging } from '@/services/sys/system/function';
import createMessage from '@/components/core/AlertMessage';
import { isNil, isEmpty } from 'ramda';

const defaultSearchForm = {
  enabledFlag: 'YES',
};
const defaultFormData = {
  activeFlag: 'YES',
};

export default {
  namespace: 'benefitDistTempEdit',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    formData: defaultFormData,
    gradeEntityList: [],
    pointEntityList: [],
    businessFunList: [],
  },

  effects: {
    *queryBusinessFun({ payload }, { call, put }) {
      const { response, status } = yield call(systemFunctionListPaging, { limit: 0 });
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            businessFunList: Array.isArray(response.rows) ? response.rows : [],
          },
        });
        yield put({ type: 'queryList', payload });
      }
    },
    *save({ payload }, { call, put, select }) {
      const { formData, gradeEntityList, pointEntityList } = yield select(
        ({ benefitDistTempEdit }) => benefitDistTempEdit
      );
      const { evalScore, ...params } = formData;
      if (Array.isArray(evalScore) && !isNil(evalScore[0]) && !isNil(evalScore[1])) {
        [params.scoreMin, params.scoreMax] = evalScore;
      }
      params.gradeEntityList = gradeEntityList;
      params.pointEntityList = pointEntityList;

      const { status, response } = yield call(examTmplCreateRq, params);
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
      const { formData, gradeEntityList, pointEntityList } = yield select(
        ({ benefitDistTempEdit }) => benefitDistTempEdit
      );
      const { evalScore, ...params } = formData;
      if (Array.isArray(evalScore) && !isNil(evalScore[0]) && !isNil(evalScore[1])) {
        [params.scoreMin, params.scoreMax] = evalScore;
      }
      params.gradeEntityList = gradeEntityList;
      params.pointEntityList = pointEntityList;

      const { status, response } = yield call(examTmplEditRq, params);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(examTmplDetailsRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          const { gradeViewList, pointViewList } = response.datum;
          let gradeCheck = '';
          if (Array.isArray(gradeViewList) && !isEmpty(gradeViewList)) {
            gradeViewList.forEach((v, index) => {
              if (index === 0) {
                gradeCheck = `${gradeCheck + v.gradeName}(<=${v.ratio}%) , `;
              } else {
                gradeCheck = ` ${gradeCheck + v.gradeName}(${gradeViewList[index - 1].ratio + 1}%~${
                  v.ratio
                }%)${index < gradeViewList.length - 1 ? ' , ' : ''}`;
              }
            });
          }

          // 计算得分占比初始值,第一行初始值为0
          gradeViewList.map((v, index) => {
            if (index > 0) {
              // eslint-disable-next-line
              return (v.ratioStart = gradeViewList[index - 1].ratio + 1);
            }
            // eslint-disable-next-line
            return (v.ratioStart = 0);
          });

          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...response.datum,
                gradeCheck,
                evalScore: [response.datum.scoreMin, response.datum.scoreMax],
              },
              pointEntityList: Array.isArray(pointViewList) ? pointViewList : [],
              gradeEntityList: Array.isArray(gradeViewList) ? gradeViewList : [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详情失败' });
        }
      }
    },
    *cleanView(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
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
