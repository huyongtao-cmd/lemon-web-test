import {
  findFeeBudgetById,
  findProjectShByProjId,
  getBriefInfo,
  saveFeeBudget,
} from '@/services/user/project/project';
import { getUrl } from '@/utils/flowToRouter';

import { getViewConf } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';
import router from 'umi/router';

// 费用预算初始化
const defaultFeeFormData = {
  id: null,
  projId: null, // 项目id
  budgetNo: null, // 预算编码
  versionNo: null, // 版本号
  budgetName: null, // 预算名称
  finYear: null, // 预算年度
  feeBudgetAmt: null, // 费用预算总金额
  feeReleasedAmt: null, // 已拨付费用预算金额
  usedAmt: null, // 已使用费用预算金额
  budgetStatus: null, // 预算状态
  createUserName: null, // 预算创建人
  projName: null, // 相关项目名称
  createTime: null, // 预算创建时间
};

export default {
  namespace: 'userProjectBudgetFlow',

  state: {
    feeFormData: {
      ...defaultFeeFormData,
    },
    feeDataSource: [],
    projectshDataSource: [], // 当量预算列表数据
    budgetAppropriationEntity: {},
    useCondition: {},
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {},
  },

  effects: {
    // 查询
    *query({ payload }, { call, put }) {
      const { response } = yield call(findFeeBudgetById, {
        id: payload.id,
      });
      const {
        response: { rows },
      } = yield call(findProjectShByProjId, { projId: response.datum.feebudget.projId });

      yield put({
        type: 'updateState',
        payload: {
          feeFormData: response.datum ? response.datum.feebudget : defaultFeeFormData,
          feeDataSource: Array.isArray((response.datum || {}).feebudgetdtls)
            ? (response.datum || {}).feebudgetdtls
            : [],
          projectshDataSource: Array.isArray(rows)
            ? rows.map(row => ({ ...row, id: '' + row.id + row.taskNo }))
            : [],
          budgetAppropriationEntity: (response.datum || {}).budgetAppropriationView,
        },
      });

      yield put({
        type: 'queryInfo',
        payload: { projId: response.datum.feebudget.projId },
      });
    },

    *submit({ payload }, { call, select, put }) {
      const { feeDataSource, feeFormData, budgetAppropriationEntity } = yield select(
        ({ userProjectBudgetFlow }) => userProjectBudgetFlow
      );

      const { status, response } = yield call(saveFeeBudget, {
        feebudget: {
          ...feeFormData,
          ...payload,
          projId: payload.projId,
          submit: true,
          procTaskId: payload.taskId,
        },
        feebudgetdtls: feeDataSource,
        budgetAppropriationEntity,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },

    *queryInfo({ payload }, { call, put, select }) {
      const { status, response } = yield call(getBriefInfo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            useCondition: response,
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

    updateAppropriationAmt(state, action) {
      return {
        ...state,
        budgetAppropriationEntity: { ...state.budgetAppropriationEntity, amt: action.payload.amt },
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
      return history.listen(({ pathname, search }) => {});
    },
  },
};
