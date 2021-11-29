import { findPlanningHistoryBy, findResPlanningById } from '@/services/user/project/project';

const defaultFormData = {
  id: null,
  projId: null, // 项目id
  planTypeDesc: null, // 计划类型
  objName: null, // 计划对象
  startDate: null, // 开始周
  durationWeek: null, // 持续周数
  salePhase: null, // 销售阶段
  probability: null, // 承担概率
  remark: null, // 备注
};

export default {
  namespace: 'userResPlanningHistory',

  state: {
    formData: {
      ...defaultFormData,
    },
    dataSource: [],
    historyDataSource: [], // 历史版本列表
    extraCols: [], // 动态列
  },

  effects: {
    // 资源规划详情
    *queryById({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(findResPlanningById, payload.id);
      if (ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: (datum || {}).planningTitle,
            dataSource: (datum || {}).details,
            extraCols: [],
          },
        });
      }
    },
    // 资源规划历史
    *queryHistory({ payload }, { call, put }) {
      const { response } = yield call(findPlanningHistoryBy, {
        planType: payload.planType, // 计划类型此处默认为“2”，表示“项目”
        objid: payload.objid,
      });
      yield put({
        type: 'updateState',
        payload: {
          historyDataSource: Array.isArray(response.rows) ? response.rows : [],
          formData: {
            ...defaultFormData,
          },
          dataSource: [],
          extraCols: [],
        },
      });
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

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
