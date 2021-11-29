import {
  examTmplListRq,
  examTmplCreateRq,
  examTmplDetailsRq,
  examTmplEditRq,
  examTmplDeleteRq,
  examTmplChangeStatusRq,
} from '@/services/plat/prefCheck/prefCheckMgmt';
import createMessage from '@/components/core/AlertMessage';
import { isNil, isEmpty } from 'ramda';

const defaultSearchForm = {
  enabledFlag: 'YES',
};
const defaultFormData = {
  enabledFlag: 'YES',
  evalScore: ['', ''],
  pointViewList: [],
};

export default {
  namespace: 'prefCheck',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    formData: defaultFormData,
    gradeEntityList: [],
    pointEntityList: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(examTmplListRq, payload);
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
    *save({ payload }, { call, put, select }) {
      const { formData, gradeEntityList, pointEntityList } = yield select(
        ({ prefCheck }) => prefCheck
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
        ({ prefCheck }) => prefCheck
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
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(examTmplDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          const { searchForm } = yield select(({ prefCheck }) => prefCheck);
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
    *ChangeStatus({ payload }, { call, put, select }) {
      const { status, response } = yield call(examTmplChangeStatusRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          // const { searchForm } = yield select(({ prefCheck }) => prefCheck);
          // yield put({
          //   type: 'query',
          //   payload: searchForm,
          // });
          yield put({
            type: 'updateSearchForm',
            payload: {
              selectedRowKeys: [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '操作失败' });
        }
      }
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
          gradeEntityList: [],
          pointEntityList: [],
          gradeViewList: [],
          pointViewList: [],
        },
      });
    },
    *cleanTableFrom(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          list: [],
          total: 0,
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
