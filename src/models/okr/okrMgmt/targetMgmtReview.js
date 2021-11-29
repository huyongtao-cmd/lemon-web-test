import {
  objectiveSupListRq,
  objectiveEditRq,
  objectiveDetailRq,
  implementListRq,
  flowSubmit,
  objtempRq,
  isPreRq,
} from '@/services/okr/okrMgmt';
import { getViewConf } from '@/services/gen/flow';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { isEmpty, isNil } from 'ramda';
import { genFakeId } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';

const defaultSearchForm = {};
const defaultFormData = {
  objectiveStatus: 'PROG',
  publicTag: false,
  supObjectiveMsg: {},
  objectSpeakFlag: 0,
  objectSpeakFlagSubmit: 0,
  activeKey: 'msgBoard',
  rangeBu: [],
  rangeRes: [],
  isPresobjectRes: false,
  isPres: false,
};

const defaultGradeTypeFormData = {
  gradeType: 'LINEAR',
};

export default {
  namespace: 'targetMgmtReview',
  state: {
    // 实施周期数据
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    dataSource: [],
    formData: defaultFormData,
    // 实施周期目标数据
    targetList: [],
    targetTotal: 0,
    implementList: [],
    objectiveProgList: [],
    keyresultList: [],
    keyresultListDel: [],
    keyresultWorkPlanList: [],
    keyresultWorkPlanListDel: [],
    // 打分规则
    gradeTypeFormData: defaultGradeTypeFormData, // 打分规则数据
    gradeTypeList: [], // 打分规则列表
    gradeTypeListDel: [], // 打分规则删除列表
    // 相关人员
    resDataSource: [],
    fieldsConfig: {},
    flowForm: {},
  },

  effects: {
    *isPre({ payload }, { call, put }) {
      const { status, response } = yield call(isPreRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateForm',
            payload: {
              isPres: !isNil(response.datum) ? response.datum : false,
            },
          });
          return { ...defaultFormData, ...response.datum };
        }
        createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
      return {};
    },
    *pass({ payload }, { put, call, select }) {
      const { status, response } = yield call(objtempRq, payload);
      if (status === 200 && response.ok) {
        createMessage({ type: 'success', description: '通过成功' });
      } else {
        createMessage({ type: 'error', description: response.reason });
      }
      return response;
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
      }
    },
    *submitFlow({ payload }, { put, call, select }) {
      const { status, response } = yield call(flowSubmit, payload);
      if (status === 200 && response.ok) {
        // createMessage({ type: 'success', description: '线索提交成功' });
        return response;
      }
      // createMessage({ type: 'error', description: '线索提交失败' });
      return {};
    },

    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(objectiveDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          const { rangeBu, rangeRes } = response.datum;
          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...defaultFormData,
                ...response.datum,
                rangeBu: !isNil(rangeBu) ? rangeBu.split(',').map(v => Number(v)) : [],
                rangeRes: !isNil(rangeRes) ? rangeRes.split(',').map(v => Number(v)) : [],
              },
              keyresultList: Array.isArray(response.datum.twOkrKeyresultView)
                ? response.datum.twOkrKeyresultView.map(v => ({ ...v, id: genFakeId(-1) }))
                : [],
              keyresultWorkPlanList: Array.isArray(response.datum.twOkrWorkPlanView)
                ? response.datum.twOkrWorkPlanView
                : [],
            },
          });
          return { ...defaultFormData, ...response.datum };
        }
        createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
      return {};
    },

    *queryImplementList({ payload }, { call, put }) {
      const { status, response } = yield call(implementListRq, payload);
      if (status === 200) {
        const { rows } = response;
        yield put({
          type: 'updateState',
          payload: {
            implementList: Array.isArray(rows) ? rows : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *queryObjectiveSupList({ payload }, { call, put }) {
      const { status, response } = yield call(objectiveSupListRq, payload);
      if (status === 200) {
        const { datum } = response;
        yield put({
          type: 'updateState',
          payload: {
            objectiveProgList: Array.isArray(datum)
              ? datum.filter(v => v.id !== Number(fromQs().id))
              : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },

    *submit({ payload }, { call, put, select }) {
      const { formData, keyresultList, keyresultListDel, keyresultWorkPlanList } = yield select(
        ({ targetMgmtReview }) => targetMgmtReview
      );
      formData.deleteKeys = keyresultListDel;
      formData.twOkrKeyresultEnetity = keyresultList;

      formData.twOkrWorkPlanEnetity = keyresultWorkPlanList;

      const { status, response } = yield call(objectiveEditRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },

    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
          searchForm: {
            ...defaultSearchForm,
            selectedRowKeys: [],
          },
          implementList: [],
          objectiveList: [],
          keyresultList: [],
          keyresultListDel: [],
        },
      });
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
    updateGradeTypeForm(state, { payload }) {
      const { gradeTypeFormData } = state;
      const newFormData = { ...gradeTypeFormData, ...payload };
      return {
        ...state,
        gradeTypeFormData: newFormData,
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
    updateWorkPlanForm(state, { payload }) {
      const { workPlanFromData } = state;
      const newFormData = { ...workPlanFromData, ...payload };
      return {
        ...state,
        workPlanFromData: newFormData,
      };
    },
  },
};
