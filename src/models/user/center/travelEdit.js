import createMessage from '@/components/core/AlertMessage';
import {
  findTravelById,
  saveTravel,
  submitTravelApply,
  findTravelDelsById,
  // submitTravelReApply,
  queryFeeCode,
} from '@/services/user/center/travel';
import { pushFlowTask } from '@/services/gen/flow';
import { selectBusWithOus, selectUserProj, selectUserTask } from '@/services/gen/list';
import { toIsoDate } from '@/utils/timeUtils';
import { omit, isNil } from 'ramda';

// 主表空数据
const emptyFormData = {
  id: null,
  applyNo: null,
  applyStatus: 'CREATE', // 后端并不看这个值只是显示
  applyDate: null,
  // finPeriodId: null,
  projFlag: 0,
  custId: null,
  projId: null,
  taskId: null,
  // eventId: null,
  ouId: null,
  applyResId: null,
  expenseBuType: 'ELITESLAND', // 默认本公司
  expenseBuId: null,
  beginDate: null,
  endDate: null,
  period: null, // 这个值控制上面两个，omit掉不提交
  days: 0,
  bookTicketFlag: 0,
  remark: '',
  apprStatus: null, // 流程状态
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
};

export default {
  namespace: 'userTravelEdit',

  state: {
    // 编辑
    formData: {
      ...emptyFormData,
    },
    // 明细
    dataList: [],
    delList: [],
    // 查询
    buSource: [], // bu列表 - 下拉查询用
    buList: [], // bu列表
    projSource: [], // 项目列表 - 下拉查询用
    projList: [], // 项目列表
    taskSource: [], // 任务列表 - 下拉查询用
    taskList: [], // 任务列表
    feeCodeList: [], // 费用码列表
  },

  effects: {
    *clean({ payload }, { put }) {
      return yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...emptyFormData,
            ...payload,
          },
          dataList: [],
          delList: [],
        },
      });
    },

    *query({ payload }, { call, put }) {
      const { response } = yield call(findTravelById, payload);
      const formData = Array.isArray(response.datum) ? response.datum[0] : {};
      const { projId, taskId, expenseBuId: buId } = formData;
      yield put({ type: 'queryFeeCode', payload: { projId, taskId, buId } });
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...formData,
            // chooseProj: !isNil(formData.projId),
            isProj: !isNil(formData.taskId),
          },
        },
      });
      // return response.datum;
    },
    // 查询出差明细列表
    *queryTravelDels({ payload }, { call, put }) {
      const { response } = yield call(findTravelDelsById, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataList: Array.isArray(response.datum) ? response.datum : [],
          delList: Array.isArray(response.datum) ? response.datum.map(v => v.id) : [],
        },
      });
    },
    // 任务包列表
    *queryTaskList({ payload }, { call, put }) {
      const { response } = yield call(selectUserTask, payload);
      yield put({
        type: 'updateState',
        payload: {
          taskList: Array.isArray(response) ? response : [],
          taskSource: Array.isArray(response) ? response : [],
        },
      });
      return response;
    },

    // 项目列表
    *queryProjList({ payload }, { call, put }) {
      const { response } = yield call(selectUserProj, payload);
      yield put({
        type: 'updateState',
        payload: {
          projList: Array.isArray(response) ? response : [],
          projSource: Array.isArray(response) ? response : [],
        },
      });
      return response;
    },

    // BU - (项目列表/任务包列表)
    *queryBuList({ payload }, { call, put }) {
      const { response } = yield call(selectBusWithOus, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            buList: Array.isArray(response) ? response : [],
            buSource: Array.isArray(response) ? response : [],
          },
        });
      }
    },

    *queryFeeCode({ payload }, { call, put }) {
      const { response } = yield call(queryFeeCode, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            feeCodeList: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },

    *save(
      {
        payload: { submitType },
      },
      { call, put, select }
    ) {
      const { formData, dataList, delList } = yield select(({ userTravelEdit }) => userTravelEdit);

      const formPayload = {
        // 去除拼接用字段
        apply: omit(['period'], formData) || {},
        applyd:
          dataList.map(item => ({
            ...item,
            // beginDate: toIsoDate(item.beginDate),// 调用这个方法后 日期会被减一
            // endDate: toIsoDate(item.endDate),
            // tripResId: formData.applyResId, // 加这个是要，出差申请人由前台来传，就酱:)->出差申请人要改成选择的了！
          })) || [],
        deleteApplyd: delList.filter(
          d => !dataList.map(i => i.id).filter(v => v > 0 && d === v).length
        ),
        submitted: submitType !== 'save',
      };

      const { status, response } = yield call(saveTravel, formPayload);
      if (status === 100) {
        // 主动取消请求
        return { status };
      }
      if (response.ok) {
        return { id: response.datum.id, success: true };
      }
      createMessage({ type: 'error', description: response.reason || '流程提交失败' });
      return { id: response.datum.id, success: false };
    },

    *reSubmit({ payload }, { call, put }) {
      const { taskId, remark } = payload;
      const { status, response } = yield call(pushFlowTask, taskId, { remark, result: 'APPLIED' });
      if (status === 200) {
        createMessage({ type: 'success', description: '流程提交成功' });
        return true;
      }
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      createMessage({ type: 'error', description: response.reason || '流程提交失败' });
      return false;
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
  },
};
