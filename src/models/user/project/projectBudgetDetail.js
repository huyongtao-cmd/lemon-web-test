import {
  findFeeBudgetByProjId,
  findProjectShByProjId,
  saveFeeBudget,
} from '@/services/user/project/project';
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
  namespace: 'userProjectBudgetDetail',

  state: {
    feeFormData: {
      ...defaultFeeFormData,
    },
    feeDataSource: [],
    projectshDataSource: [], // 当量预算列表数据
  },

  effects: {
    // 查询
    *query({ payload }, { call, put }) {
      const { response } = yield call(findFeeBudgetByProjId, {
        projId: payload.projId,
      });
      const {
        response: { rows },
      } = yield call(findProjectShByProjId, payload);

      if (!response.datum) {
        createConfirm({
          content: '当前项目未创建预算,是否跳转到编辑页创建预算？',
          onOk: () => router.push(`/user/project/projectBudget?projId=${payload.projId}`),
        });
      }
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
