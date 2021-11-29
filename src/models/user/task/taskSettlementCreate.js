import { equivalentDetailRq, queryTaskDetailUriRq } from '@/services/user/task/equivalent';
import {
  queryBuList,
  queryReasonList,
  queryPreSaleList,
  queryTaskSettle,
} from '@/services/user/task/task';
import { getViewConf } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectUsersWithBu } from '@/services/gen/list';
import { pickAll } from 'ramda';
import { genFakeId, add, div, mul } from '@/utils/mathUtils';

const defaultFormData = {};
export default {
  namespace: 'taskSettlementCreate',
  state: {
    taskFormData: {},
    taskProjSource: [],
    taskProjList: [], // 事由号-项目列表
    buSource: [],
    buList: [], // 事由号-bu列表
    preSaleSource: [],
    preSaleList: [], // 事由号-售前列表
    resDataSource: [], // 收入资源下拉数据
    baseBuDataSource: [], // 收入BU下拉书卷
  },
  effects: {
    *queryTaskDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryTaskDetailUriRq, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            taskFormData: response.datum,
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || 'config获取失败' });
      return {};
    },
    *queryBuList({ payload }, { call, put }) {
      const { response } = yield call(queryBuList);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            buList: Array.isArray(response.datum) ? response.datum : [],
            buSource: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },
    *queryProjList({ payload }, { call, put }) {
      const { response } = yield call(queryReasonList);
      if (response.datum) {
        yield put({
          type: 'updateState',
          payload: {
            taskProjList: Array.isArray(response.datum) ? response.datum : [],
            taskProjSource: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },
    *queryPreSaleList({ payload }, { call, put }) {
      const { response } = yield call(queryPreSaleList);
      if (response.datum) {
        yield put({
          type: 'updateState',
          payload: {
            preSaleList: Array.isArray(response.datum) ? response.datum : [],
            preSaleSource: Array.isArray(response.datum) ? response.datum : [],
          },
        });
      }
    },
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUsersWithBu);
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
    *queryTaskSettleByCondition({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryTaskSettle, payload);
      if (status === 200) {
        const { taskFormData } = yield select(({ taskSettlementCreate }) => taskSettlementCreate);
        const { settlePriceFlag, buSettlePrice, applyforEqva } = taskFormData;
        const newForm = pickAll(
          ['buSettlePrice', 'taxRate', 'settlePrice', 'suggestSettlePrice', 'eqvaSalary'],
          response.datum || {}
        );
        // 实际BU结算价格
        newForm.buSettlePrice =
          settlePriceFlag === '1' ? buSettlePrice : newForm.suggestSettlePrice;
        newForm.taxRate = newForm.taxRate || 0;
        // 最终结算单价
        newForm.settlePrice = newForm.buSettlePrice
          ? div(mul(newForm.buSettlePrice, add(100, newForm.taxRate)), 100).toFixed(2)
          : 0;
        // 总金额
        newForm.amt =
          applyforEqva && newForm.settlePrice
            ? mul(applyforEqva, newForm.settlePrice).toFixed(2)
            : 0;
        if (response.ok) {
          yield put({
            type: 'updateForm',
            payload: newForm,
          });
        } else if (response.errCode) {
          createMessage({ type: 'error', description: `查询失败,错误原因：${response.reason}` });
        } else {
          createMessage({ type: 'error', description: '查询失败,请联系管理员' });
        }
      }
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
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
    updateForm(state, { payload }) {
      const { taskFormData } = state;
      const newFormData = { ...taskFormData, ...payload };
      return {
        ...state,
        taskFormData: newFormData,
      };
    },
  },
};
