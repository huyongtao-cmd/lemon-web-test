import createMessage from '@/components/core/AlertMessage';
import {
  findFeeApplyById,
  saveFeeApply,
  selectCustBy,
  selectBuBy,
  findAccTreeByBuId,
  startFeeApply,
} from '@/services/user/feeapply/feeapply';
import { selectProjectBy } from '@/services/gen/list';
import { pushFlowTask } from '@/services/gen/flow';
import { closeThenGoto } from '@/layouts/routerControl';

const defaultFormData = {
  id: null,
  applyNo: null, // 申请单号
  applyName: null, // 申请单号名称
  applyResId: null, // 申请人
  applyBuId: null, // 申请人base bu
  applyBuName: null, // 申请人base bu
  usageType: null, // 用途类型
  feeCode: null, // 费用码
  applyType: null, // 是否项目相关
  reasonId: null, // 事由号
  custId: null, // 客户
  custNo: null, // 客户
  abName: null, // 客户
  expenseBuId: null, // 费用承担BU
  expenseBuNo: null, // 费用承担BU
  expenseBuName: null, // 费用承担BU
  sumBuId: null, // 费用归属BU
  sumBuNo: null, // 费用归属BU
  sumBuName: null, // 费用归属BU
  applyAmt: null, // 费用总额
  expectDate: null, // 费用预计使用日期
  applyDate: null, // 申请日期
  apprStatus: null, // 申请状态
  apprStatusName: null, // 申请状态
  remark: null, // 费用申请原因说明
};

export default {
  namespace: 'userFeeApplySpecEdit',

  state: {
    formData: {
      ...defaultFormData,
    },
    dataSource: [],
    deleteList: [],
    projDataList: [], // 事由号下拉数据
    custDataList: [], // 客户下拉数据
    buDataList: [], // 费用承担下拉数据
    accDataList: [], // 科目下拉数据
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findFeeApplyById, { id: payload.id });
      if (response.datum) {
        const { response: projSelect } = yield call(selectProjectBy, {
          resId: response.datum.applyResId,
        });
        const { response: custResponse } = yield call(selectCustBy, {
          projId: response.datum.projId,
        });
        const { response: buResponse } = yield call(selectBuBy, { projId: response.datum.projId });
        if (response.datum.expenseBuId) {
          const { response: accResponse } = yield call(findAccTreeByBuId, {
            buId: response.datum.expenseBuId,
          });
          yield put({
            type: 'updateState',
            payload: {
              accDataList: accResponse || [],
            },
          });
        }
        yield put({
          type: 'updateState',
          payload: {
            projDataList: projSelect || [],
            custDataList: custResponse || [],
            buDataList: buResponse || [],
          },
        });
      }
      yield put({
        type: 'updateState',
        payload: {
          formData: response.datum || {},
          dataSource: (response.datum || {}).applyds,
        },
      });
    },
    // 根据事由号id过滤客户、费用承担bu下拉数据
    *queryByProjId({ payload }, { call, put, select }) {
      const { formData } = yield select(({ userFeeApplySpecEdit }) => userFeeApplySpecEdit);

      const { response } = yield call(selectCustBy, { projId: payload.projId });
      const { response: buResponse } = yield call(selectBuBy, { projId: payload.projId });

      const resList = Array.isArray(response) ? response : [];
      const buList = Array.isArray(buResponse) ? buResponse : [];

      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...formData,
            custId: payload.projId && resList[0] ? resList[0].id : null,
            expenseBuId: payload.projId && buList[0] ? buList[0].id : null,
            sumBuId: payload.projId && buList[0] ? buList[0].sumBuId : null,
          },
          custDataList: resList,
          buDataList: buList,
        },
      });
    },
    // 根据费用承担bu.id获取费用科目树
    *queryByBuId({ payload }, { call, put }) {
      const { response } = yield call(findAccTreeByBuId, { buId: payload.expenseBuId });

      yield put({
        type: 'updateState',
        payload: {
          accDataList: Array.isArray(response) ? response : [],
        },
      });
    },
    *save({ payload }, { call, put, select }) {
      const { formData, dataSource, deleteList, isSubmit } = payload;
      const { status: sts, response } = yield call(saveFeeApply, {
        apply: formData,
        applyd: dataSource,
        deleteApplyd: deleteList,
      });
      if (sts === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        // 保存
        if (!isSubmit) {
          createMessage({ type: 'success', description: '保存成功' });
          closeThenGoto(`/plat/expense/spec/list`);
          return;
        }
        if (payload.apprId) {
          // 再次提交流程
          const { apprId: taskId, remark } = payload;
          const { status } = yield call(pushFlowTask, taskId, { result: 'APPROVED', remark });
          if (status === 200) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/user/flow/process`);
          }
        }
        // 提起流程
        else if (response.datum && response.datum.apply && response.datum.apply.id) {
          const { status } = yield call(startFeeApply, response.datum.apply.id);
          if (status === 200) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/plat/expense/spec/list`);
          }
        } else {
          createMessage({ type: 'error', description: '保存成功，提交失败！' });
        }
      } else {
        createMessage({ type: 'error', description: response.errorCode || '保存失败' });
      }
    },
    // 修改form表单字段内容，将数据保存到state
    *updateForm({ payload }, { put, select }) {
      const { key, value } = payload;
      const { formData } = yield select(({ userFeeApplySpecEdit }) => userFeeApplySpecEdit);
      const newFormData = Object.assign({}, formData);
      newFormData[key] = value;
      yield put({
        type: 'updateState',
        payload: { formData: newFormData },
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
};
