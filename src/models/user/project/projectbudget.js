import {
  findFeeBudgetByProjId,
  findProjectShByProjId,
  saveFeeBudget,
  findFeeBudgetTemplateTreeByProjId,
  findProjectByIdSimple,
} from '@/services/user/project/project';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';

// 费用预算初始化
const defaultFeeFormData = {
  id: null,
  projId: undefined, // 项目id
  budgetNo: null, // 预算编码
  versionNo: null, // 版本号
  budgetName: null, // 预算名称
  finYear: null, // 预算年度
  feeBudgetAmt: 0, // 费用预算总金额
  feeReleasedAmt: null, // 已拨付费用预算金额
  usedAmt: null, // 已使用费用预算金额
  budgetStatus: 'CREATE', // 预算状态
  createUserName: null, // 预算创建人
  projName: null, // 相关项目名称
  createTime: null, // 预算创建时间
  eqvaBudgetCnt: undefined,
  eqvaBudgetAmt: undefined,
  distributedEqva: 0,
  distributedAmt: 0,
  eqvaReleasedQty: 0,
  eqvaReleasedAmt: 0,
  settledEqva: 0,
  settledAmt: 0,
  totalsControlFlag: 0,
};

const defaultAppropriation = {
  id: -1,
  applyFeeAmt: 0,
  applyEqva: 0,
  applyEqvaAmt: 0,
  applyAmt: 0,
};

const wrapCodeIdMap = (json, map) => {
  if (!json) {
    return;
  }
  for (let i = 0; i < json.length; i += 1) {
    // eslint-disable-next-line no-param-reassign
    map[json[i].accCode] = json[i].id;
    if (json[i].children) {
      wrapCodeIdMap(json[i].children, map);
    }
  }
};

export default {
  namespace: 'userProjectBudget',

  state: {
    feeFormData: {
      ...defaultFeeFormData,
    },
    feeDataSource: [],
    projectshDataSource: [], // 当量预算列表数据
    treeCodeIdMap: {},
    budgetAppropriationEntity: { ...defaultAppropriation },
    projectView: {},
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

      let feebudgetdtls;
      let budgetAppropriationView = {};
      if (!response.datum) {
        const {
          response: { rows: feeBudgetTemplate },
        } = yield call(findFeeBudgetTemplateTreeByProjId, payload);
        feebudgetdtls = feeBudgetTemplate;
      } else {
        feebudgetdtls = Array.isArray((response.datum || {}).feebudgetdtls)
          ? (response.datum || {}).feebudgetdtls
          : [];
        // eslint-disable-next-line prefer-destructuring
        budgetAppropriationView = response.datum.budgetAppropriationView;
      }

      // 组装treeCodeIdMap
      const codeIdMap = {};
      wrapCodeIdMap(feebudgetdtls, codeIdMap);

      const { response: projectView } = yield call(findProjectByIdSimple, payload.projId);

      const newFormData = response.datum ? response.datum.feebudget : defaultFeeFormData;

      yield put({
        type: 'updateState',
        payload: {
          feeFormData: { ...newFormData, projId: Number.parseInt(payload.projId, 10) },
          feeDataSource: feebudgetdtls,
          projectshDataSource: Array.isArray(rows)
            ? rows.map(row => ({ ...row, id: '' + row.id + row.taskNo }))
            : [],
          treeCodeIdMap: codeIdMap,
          projectView,
          budgetAppropriationEntity: budgetAppropriationView || defaultAppropriation,
        },
      });
    },
    *initBudget({ payload }, { call, put, select }) {
      const { feeFormData } = yield select(({ userProjectBudget }) => userProjectBudget);
      const { projId } = feeFormData;
      const {
        response: { rows: feeBudgetTemplate },
      } = yield call(findFeeBudgetTemplateTreeByProjId, { projId });
      const feebudgetdtls = feeBudgetTemplate || [];

      // 组装treeCodeIdMap
      const codeIdMap = {};
      wrapCodeIdMap(feebudgetdtls, codeIdMap);

      yield put({
        type: 'updateState',
        payload: {
          feeFormData: { ...feeFormData, feeBudgetAmt: 0, initFlag: true },
          feeDataSource: feebudgetdtls,
          treeCodeIdMap: codeIdMap,
        },
      });
    },
    // 保存
    *save(payload, { call, select }) {
      const { feeDataSource, feeFormData } = yield select(
        ({ userProjectBudget }) => userProjectBudget
      );

      const { status, response } = yield call(saveFeeBudget, {
        feebudget: { ...feeFormData, projId: payload.projId },
        feebudgetdtls: feeDataSource,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto(`/user/project/projectBudgetDetail?projId=${payload.projId}`);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    // 保存
    *submit(payload, { call, select }) {
      const { feeDataSource, feeFormData, budgetAppropriationEntity } = yield select(
        ({ userProjectBudget }) => userProjectBudget
      );

      const { status, response } = yield call(saveFeeBudget, {
        feebudget: {
          ...feeFormData,
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
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto(`/user/flow/process`);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    // 修改form表单字段内容，将数据保存到state
    *updateForm({ payload }, { put, select }) {
      const { key, value } = payload;
      const { feeFormData } = yield select(({ userProjectBudget }) => userProjectBudget);
      const newFormData = Object.assign({}, feeFormData);
      newFormData[key] = value;
      yield put({
        type: 'updateState',
        payload: { feeFormData: newFormData },
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
