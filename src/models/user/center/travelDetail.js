import { findTravelById, findTravelDelsById } from '@/services/user/center/travel';
import { queryTicketList } from '@/services/plat/admin/ticket';
import { getViewConf } from '@/services/gen/flow';
import { fromQs } from '@/utils/stringUtils';

// 主表空数据
const emptyFormData = {
  id: null,
  applyNo: null,
  applyStatus: 'CREATE',
  applyDate: null,
  // finPeriodId: null,
  projFlag: 0,
  custId: null,
  projId: null,
  taskId: null,
  // eventId: null,
  ouId: null,
  applyResId: null,
  expenseBuType: 'ELITESLAND',
  expenseBuId: null,
  beginDate: null,
  endDate: null,
  period: [null, null],
  days: 0,
  bookTicketFlag: 0,
  remark: '',
};

// 行新增空数据
const emptyRowData = {
  id: null,
  tripResId: null,
  fromPlace: '',
  toPlace: '',
  vehicle: '',
  beginDate: '',
  endDate: '',
  remark: '',
  delFlag: 0,
};

export default {
  namespace: 'userTravelView',

  state: {
    // 编辑
    formData: {
      ...emptyFormData,
    },
    // 明细
    dataList: [],
    fieldsConfig: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    ticketList: [],
    ticketTotal: 0,
  },

  effects: {
    *clean(_, { put }) {
      return yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...emptyFormData,
          },
          dataList: [],
        },
      });
    },

    *query({ payload }, { call, put }) {
      const { response } = yield call(findTravelById, payload);
      yield put({
        type: 'updateState',
        payload: {
          formData: Array.isArray(response.datum) ? response.datum[0] || {} : {},
        },
      });
      const { taskId } = fromQs();
      if (taskId) {
        yield put({
          type: 'fetchConfig',
          payload: taskId,
        });
      } else {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: {},
          },
        });
      }
    },
    // 查询出差明细列表
    *queryTravelDels({ payload }, { call, put }) {
      const { response } = yield call(findTravelDelsById, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataList: Array.isArray(response.datum) ? response.datum : [],
        },
      });
    },
    *fetchConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        const fieldsConfig = response || {};
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig,
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
        const { taskKey } = fieldsConfig;
        // 禅道 #232 出差申请行政订票流程中，流转单“费用承担BU负责人审批”节点 / “项目经理审批”节点 时，要显示订票详情
        // 因此，拉流程配置和拉单据配置产生联系，两个可以同步拉取的操作变成串行的，先拉单据，再拉流程，是需要的节点了，根据单据信息来拉订票想请
        if (taskKey && (taskKey.includes('PM_CONFIRM_b') || taskKey.includes('BU_CONFIRM_b'))) {
          const { formData } = yield select(({ userTravelView }) => userTravelView);
          yield put({
            type: 'queryTicketList',
            payload: {
              resId: formData.applyResId,
              applyId: formData.id,
            },
          });
        }
      }
    },
    *queryTicketList({ payload }, { call, put }) {
      const {
        response: { datum, total },
      } = yield call(queryTicketList, payload);

      yield put({
        type: 'updateState',
        payload: {
          ticketList: Array.isArray(datum) ? datum : [],
          ticketTotal: total,
        },
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
    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {});
    },
  },
};
