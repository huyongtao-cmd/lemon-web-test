import {
  findOperations,
  findExamPeriods,
  saveOperations,
  queryClassTrees,
} from '@/services/sys/baseinfo/butemplate';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'sysButempoperation',

  state: {
    operateList: [],
    operateDels: [],
    examPeriodList: [],
    examPeriodDels: [],
    classTree: [],
  },

  effects: {
    // 查询bu模板 产品分类树
    *queryClassTrees({ payload }, { call, put, select }) {
      const response = yield call(queryClassTrees);
      if (response) {
        yield put({
          type: 'updateState',
          payload: { classTree: Array.isArray(response.response) ? response.response : [] },
        });
      }
    },
    // 查询考核期间
    *queryExamPeriodList({ payload }, { call, put }) {
      const { response } = yield call(findExamPeriods, payload);
      const list = Array.isArray(response.rows) ? response.rows : [];
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            examPeriodList: list,
            examPeriodDels: list.map(v => v.id),
          },
        });
      }
    },
    // 查询经营范围
    *queryOperateList({ payload }, { call, put }) {
      const { response } = yield call(findOperations, payload);
      const list = Array.isArray(response.rows) ? response.rows : [];
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            operateList: list,
            operateDels: list.map(v => v.id),
          },
        });
      }
    },
    // 保存
    *save({ payload }, { put, call, select }) {
      const { examPeriodList, examPeriodDels, operateList, operateDels } = yield select(
        ({ sysButempoperation }) => sysButempoperation
      );
      // // 把原始数据里被删掉的id找出来
      const examList = examPeriodList.filter(v => !!v.dateTo && !!v.dateFrom && !!v.periodName);
      const ids = examPeriodDels.filter(
        d => !examList.map(i => i.id).filter(v => v > 0 && v === d).length
      );

      const operList = operateList.filter(v => !!v.classId);
      const dels = operateDels.filter(
        d => !operList.map(i => i.id).filter(v => v > 0 && v === d).length
      );
      // 保存接口
      const { status, response } = yield call(saveOperations, {
        examPeriodList: examList,
        examPeriodDels: ids,
        operateDels: dels,
        operateList: operList,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({ type: 'queryExamPeriodList', payload });
        yield put({ type: 'queryOperateList', payload });
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
