import {
  equivalentCreate,
  equivalentDetailRq,
  queryTaskDetailUriRq,
  queryModalDetailRq,
  disterUserPass,
} from '@/services/user/task/equivalent';
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
import { closeThenGoto } from '@/layouts/routerControl';
import { getUrl } from '@/utils/flowToRouter';

const defaultFormData = {};
export default {
  namespace: 'equivalentCreateFlow',
  state: {
    formData: defaultFormData,
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
    jobType2List: [],
    capasetLeveldList: [],
    taskProjSource: [],
    taskProjList: [], // 事由号-项目列表
    buSource: [],
    buList: [], // 事由号-bu列表
    preSaleSource: [],
    preSaleList: [], // 事由号-售前列表
    taskFormData: {},
    resDataSource: [], // 收入资源下拉数据
    baseBuDataSource: [], // 收入BU下拉书卷
    modalFormData: {},
    reasonIdList: [],
    buttonFilter: '1',
  },
  effects: {
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(equivalentDetailRq, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum,
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || 'config获取失败' });
      return {};
    },
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
      createMessage({ type: 'error', description: response.reason || '获取详情失败' });
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
        return response;
      }
      return {};
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          taskFormData: {},
          buttonFilter: '1',
        },
      });
      return {};
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
    },
    *queryTaskSettleByCondition({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryTaskSettle, payload);
      if (status === 200) {
        const { taskFormData } = yield select(({ equivalentCreateFlow }) => equivalentCreateFlow);
        const { settlePriceFlag, buSettlePrice, applyforEqva } = taskFormData;

        const newForm = pickAll(
          ['buSettlePrice', 'taxRate', 'settlePrice', 'suggestSettlePrice', 'eqvaSalary'],
          response.datum || {}
        );
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
            type: 'updateTaskForm',
            payload: newForm,
          });
        } else if (response.errCode) {
          createMessage({ type: 'error', description: `查询失败,错误原因：${response.reason}` });
        } else {
          createMessage({ type: 'error', description: '查询失败,请联系管理员' });
        }
      }
    },
    *queryModal({ payload }, { call, put }) {
      const { status, response } = yield call(queryModalDetailRq, payload);
      if (status === 200) {
        if (response && response.ok)
          yield put({
            type: 'updateState',
            payload: {
              modalFormData: response.datum,
            },
          });
      }
    },
    // 申请人重新提交
    *againSumit({ payload }, { call, put, select }) {
      const { status, response } = yield call(equivalentCreate, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    // 发包人通过/拒绝
    *submit({ payload }, { call, put, select }) {
      const { status, response } = yield call(disterUserPass, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    updateTaskForm(state, { payload }) {
      const { taskFormData } = state;
      const newFormData = { ...taskFormData, ...payload };
      return {
        ...state,
        taskFormData: newFormData,
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
};
