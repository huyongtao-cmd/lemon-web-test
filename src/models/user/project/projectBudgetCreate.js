import {
  createChangeBudgetByProjIdUri,
  changeBudgetByProjIdUri,
  findProjectShByProjId,
  saveFeeBudget,
  findFeeBudgetTemplateTreeByProjId,
  findProjectByIdSimple,
  changeBudgetSaveUri,
} from '@/services/user/project/project';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

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
  namespace: 'projectBudgetCreate',
  state: {
    feeFormData: {
      ...defaultFeeFormData,
    },
    copyFeeFormData: {},
    feeDataSource: [],
    copyFeeDataSource: [],
    projectshDataSource: [], // 当量预算列表数据
    treeCodeIdMap: {},
    budgetAppropriationEntity: { ...defaultAppropriation },
    projectView: {},
    businessChangeDetailEntities: [], // 用来存储变化的值  变更明细表
    labelLists: [
      {
        viewGroup: 'PROJ_BASIC_BUDGET_CHANGE_VIEW',
        viewGroupName: '项目基本信息预算变更',
        key: 'budgetName',
        lableName: '预算名称',
      },
      {
        viewGroup: 'PROJ_BASIC_BUDGET_CHANGE_VIEW',
        viewGroupName: '项目基本信息预算变更',
        key: 'totalsControlFlag',
        lableName: '预算总费用',
      },
      {
        viewGroup: 'PROJ_BASIC_BUDGET_CHANGE_VIEW',
        viewGroupName: '项目基本信息预算变更',
        key: 'feeBudgetAmt',
        lableName: '预算控制',
      },
      {
        viewGroup: 'PROJ_EQUIVALENT_BUDGET_CHANGE_VIEW',
        viewGroupName: '项目当量预算变更',
        key: 'eqvaBudgetCnt',
        lableName: '当量预算总数',
      },
    ],
    beforeAbstractFormData: {},
  },

  effects: {
    // 查询
    *query({ payload }, { call, put }) {
      const { taskId } = payload;
      let res = {};
      if (taskId) {
        res = yield call(changeBudgetByProjIdUri, {
          projId: payload.projId,
        });
      } else {
        res = yield call(createChangeBudgetByProjIdUri, {
          projId: payload.projId,
        });
      }
      const { response } = res;
      const {
        response: { rows },
      } = yield call(findProjectShByProjId, payload);
      let feebudgetdtls;
      let oldFeebudgetdtls;
      let budgetAppropriationView = {};
      if (response.ok) {
        if (!response.datum) {
          const {
            response: { rows: feeBudgetTemplate },
          } = yield call(findFeeBudgetTemplateTreeByProjId, payload);
          feebudgetdtls = feeBudgetTemplate;
          oldFeebudgetdtls = feeBudgetTemplate;
        } else {
          feebudgetdtls = Array.isArray((response.datum || {}).feebudgetdtls)
            ? (response.datum || {}).feebudgetdtls
            : [];
          oldFeebudgetdtls = Array.isArray((response.datum || {}).oldFeebudgetdtls)
            ? (response.datum || {}).oldFeebudgetdtls
            : [];
          // eslint-disable-next-line prefer-destructuring
          budgetAppropriationView = response.datum.budgetAppropriationView; // 拨付申请
        }

        // 组装treeCodeIdMap
        const codeIdMap = {};
        const codeIdMap1 = {};
        wrapCodeIdMap(feebudgetdtls, codeIdMap);
        wrapCodeIdMap(oldFeebudgetdtls, codeIdMap1);
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
            treeCodeIdMap1: codeIdMap1,
            projectView,
            budgetAppropriationEntity: budgetAppropriationView || defaultAppropriation,
            copyFeeFormData: response.datum ? response.datum.oldFeebudget : {},
            copyFeeDataSource: oldFeebudgetdtls,
            beforeAbstractFormData: response.datum ? response.datum.businessChangeView : {},
          },
        });
        return oldFeebudgetdtls;
      }
      return null;
    },
    // 保存
    *save(payload, { call, select }) {
      const { feeDataSource, feeFormData } = yield select(
        ({ projectBudgetCreate }) => projectBudgetCreate
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
    // 提交
    *submit({ payload }, { call, select }) {
      const { feeDataSource, feeFormData, budgetAppropriationEntity } = yield select(
        ({ projectBudgetCreate }) => projectBudgetCreate
      );
      const { projId, changeFormData } = payload;
      let param = {};
      param = {
        feebudget: {
          ...feeFormData,
          projId,
        },
        feebudgetdtls: feeDataSource,
        budgetAppropriationEntity,
        changeFormData,
      };
      const { status, response } = yield call(changeBudgetSaveUri, param);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto(`/user/flow/process?type=procs`);
      } else if (response.reason === 'PROJECT:BUDGET_SAVE:BUSINESS_CHANGE_EXISTS_CHECK') {
        createMessage({ type: 'error', description: '流程正在审批中，不能重复发起！' });
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          businessChangeDetailEntities: [],
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
      const { feeFormData } = state;
      const newFormData = { ...feeFormData, ...payload };
      return {
        ...state,
        feeFormData: newFormData,
      };
    },
    // 变更前变更后比较
    updateView(state, { payload }) {
      // const { businessChangeDetailEntities } = state;
      // const indexs = [];
      // businessChangeDetailEntities.forEach((item, index) => {
      //   payload.forEach(itm => {
      //     if (item.changeLabel === itm.changeLabel && indexs.indexOf(index) === -1) {
      //       indexs.push(index);
      //     }
      //   });
      // });
      // if (indexs.length > 0) {
      //   // eslint-disable-next-line no-plusplus
      //   for (let i = indexs.length - 1; i > -1; i--) {
      //     businessChangeDetailEntities.splice(indexs[i], 1);
      //   }
      // }
      // const newBusinessChangeDetailEntities = [...businessChangeDetailEntities, ...payload];
      return {
        ...state,
        businessChangeDetailEntities: payload,
      };
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
