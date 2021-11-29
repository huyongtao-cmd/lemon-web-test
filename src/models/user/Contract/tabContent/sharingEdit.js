import { isEmpty, groupWith } from 'ramda';
// import { groupBy } from 'lodash';
import {
  getPlatformProfileList,
  getSharingList,
  getOtherRecvList,
  saveSharingList,
  saveOtherRecvList,
  resetSharingList,
  resetCreateSharingList,
  forceResetSharingList,
  contOtherStlApply,
  getProfitAgreesByRuleId,
  getNewRuleByContIdRq,
  saveNewRuleRq,
} from '@/services/user/Contract/profitSharing';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { genFakeId } from '@/utils/mathUtils';
import { closeThenGoto } from '@/layouts/routerControl';
import { findProfitdistRuleById } from '@/services//sys/baseinfo/profitdistrule';

export default {
  namespace: 'sharingEdit',

  state: {
    formData: {},
    dataList: [], // 平台利益分配规则
    ruleList: [], // 本单分配规则
    delList: [],
    normSettleView: [],
    normSettleViewDel: [],
    otherRecvList: [], // 其他收付费用
    delOtherList: [],
    projectList: [],
    taskList: [],
  },

  effects: {
    *saveNewRule({ payload }, { call, put, select }) {
      const { status, response } = yield call(saveNewRuleRq, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '操作成功!' });
          yield put({
            type: 'queryDetails',
            payload: {
              contractId: fromQs().id,
            },
          });
          return response;
        }
        createMessage({ type: 'error', description: '操作失败!' });
        return {};
      }
      createMessage({ type: 'error', description: '操作失败!' });
      return {};
    },

    *queryDetails({ payload }, { call, put }) {
      const { status, response } = yield call(getNewRuleByContIdRq, payload);
      if (status === 100) {
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          const {
            basicInfo,
            calculationFactor,
            distributionFactor,
            modelRule = [],
            normSettleView = [],
            rows = [],
          } = response.datum;
          yield put({
            type: 'updateState',
            payload: {
              ruleList: rows, // 本单分配规则
              dataList: modelRule ? [modelRule] : [], // 标准分配规则
              normSettleView,
              projectList: Array.isArray(basicInfo.projectList) ? basicInfo.projectList : [],
              taskList: Array.isArray(basicInfo.taskList) ? basicInfo.taskList : [],
            },
          });
          // 表单信息
          yield put({
            type: 'updateForm',
            payload: {
              ...basicInfo,
              ...calculationFactor,
              ...distributionFactor,
            },
          });
          return response;
        }
        createMessage({ type: 'error', description: '查询子合同利益分配详情失败！' });
        return {};
      }
      createMessage({ type: 'error', description: '查询子合同利益分配详情失败！' });
      return {};
    },

    *query({ payload }, { call, put }) {
      const res1 = yield call(getPlatformProfileList, payload);
      const res2 = yield call(getSharingList, payload);
      const res3 = yield call(getOtherRecvList, payload);

      yield put({
        type: 'updateState',
        payload: {
          // dataList: res1.response.datum ? [res1.response.datum] : [],
          dataList: [res1.response.datum || {}].filter(x => !isEmpty(x)),
          ruleList: Array.isArray(res2.response.datum) ? res2.response.datum : [],
          otherRecvList: Array.isArray(res3.response.datum) ? res3.response.datum : [],
        },
      });
    },

    *save({ payload }, { call, put, select }) {
      const { id } = fromQs();
      const { ruleList, delList, otherRecvList, delOtherList, otherRule } = yield select(
        ({ sharingEdit }) => sharingEdit
      );

      // 校验其他收付计划必填字段
      if (otherRecvList.filter(r => !r.inBuId).length) {
        createMessage({ type: 'warn', description: '收入方bu不能为空！' });
        return;
      }
      if (otherRecvList.filter(r => !r.outBuId).length) {
        createMessage({ type: 'warn', description: '支持方bu不能为空！' });
        return;
      }
      if (otherRecvList.filter(r => !r.dealAmt && r.dealAmt !== 0).length) {
        createMessage({ type: 'warn', description: '交易金额不能为空！' });
        return;
      }

      // 校验 同一利益分配角色收益占比相加为100
      const arr = [];

      const groupRoleArr = ['DELI', 'LEADS', 'SIGN', 'PLAT'];

      for (let i = 0; i < groupRoleArr.length; i += 1) {
        const b = ruleList.filter(item => item.groupRole === groupRoleArr[i]);
        arr.push(b);
      }
      //
      for (let i = 0; i < arr.length; i += 1) {
        if (Array.isArray(arr[i]) && arr[i].length > 1) {
          let sum = 0;
          arr[i].forEach((el, $key) => {
            sum += el.gainerIngroupPercent;
          });
          if (sum !== 100) {
            createMessage({
              type: 'error',
              description: '同一利益分配角色收益占比相加为100',
            });
            return;
          }
        } else if (
          Array.isArray(arr[i]) &&
          arr[i].length === 1 &&
          arr[i][0].gainerIngroupPercent !== 100
        ) {
          createMessage({ type: 'error', description: '同一利益分配角色收益占比相加为100' });
          return;
        }
      }

      // console.warn(arr);
      // 校验 同一利益分配角色  利益分配比例和 基于 必须一样
      for (let i = 0; i < arr.length; i += 1) {
        if (Array.isArray(arr[i]) && arr[i].length > 1) {
          const $arr = groupWith((a, b) => a.groupBaseType === b.groupBaseType, arr[i]);
          if ($arr.length > 1) {
            createMessage({ type: 'error', description: '同一利益分配角色基于必须相同' });
            return;
          }
        }
      }

      // 校验 同一利益分配角色  利益分配比例和 基于 必须一样
      for (let i = 0; i < arr.length; i += 1) {
        if (Array.isArray(arr[i]) && arr[i].length > 1) {
          const $arr = groupWith((a, b) => a.groupPercent === b.groupPercent, arr[i]);
          if ($arr.length > 1) {
            createMessage({
              type: 'error',
              description: '同一利益分配角色利益分配比例必须相同',
            });
            return;
          }
        }
      }

      let profitRuleId = null;
      if (otherRule && otherRule.length > 0) {
        profitRuleId = otherRule[0].id;
      }
      const { status, response } = yield call(saveSharingList, id, profitRuleId, {
        entities: ruleList.map(r => ({
          ...r,
          id: typeof r.id === 'string' ? null : r.id,
        })),
        delList: delList.filter(r => typeof r !== 'string'),
      });
      if (status === 100) {
        // 主动取消请求
        // eslint-disable-next-line consistent-return
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({
          type: 'query',
          payload: fromQs().id,
        });
        yield put({
          type: 'userContractEditSub/updateState',
          payload: {
            flag4: 0, // reset dirty flag
          },
        });

        // 保存其他交付信息

        const { status: status2, response: response2 } = yield call(saveOtherRecvList, id, {
          entities: otherRecvList.map(r => ({
            ...r,
            id: typeof r.id === 'string' ? null : r.id,
          })),
          delList: delOtherList.filter(r => typeof r !== 'string'),
        });

        if (status2 === 100) {
          // 主动取消请求
          // eslint-disable-next-line consistent-return
          return;
        }
        if (response2.ok) {
          yield put({
            type: 'query',
            payload: fromQs().id,
          });
          yield put({
            type: 'userContractEditSub/updateState',
            payload: {
              flag4: 0, // reset dirty flag
            },
          });
        } else {
          createMessage({
            type: 'error',
            description: '保存失败!' + response.reason || '保存其他收付计划失败',
          });
        }
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },

    *reset({ payload }, { call, put, select }) {
      const { id } = fromQs();
      const { status, response } = yield call(resetSharingList, id);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({
          type: 'query',
          payload: fromQs().id,
        });
        yield put({
          type: 'userContractEditSub/updateState',
          payload: {
            flag4: 0, // reset dirty flag
          },
        });
        yield put({
          type: 'updateState',
          payload: {
            otherRule: [], // reset dirty flag
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '操作失败' });
      }
    },

    *resetCreate({ payload }, { call, put, select }) {
      const { id } = fromQs();
      const { status, response } = yield call(resetCreateSharingList, id);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({
          type: 'userContractEditSub/updateState',
          payload: {
            flag4: 0, // reset dirty flag
          },
        });
        // eslint-disable-next-line
        Array.isArray(response.datum) && response.datum.forEach(v => (v.id = genFakeId(-1)));
        yield put({
          type: 'updateState',
          payload: {
            ruleList: Array.isArray(response.datum) ? response.datum : [],
            // 清空分配规则主数据id，清空选择的其他分配规则主数据
            otherRule: [],
          },
        });
        const states = yield select(({ sharingEdit }) => sharingEdit);
      } else {
        createMessage({ type: 'error', description: response.reason || '操作失败' });
      }
    },

    *forceReset({ payload }, { call, put, select }) {
      const { id } = fromQs();
      const { status, response } = yield call(forceResetSharingList, id);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        yield put({
          type: 'query',
          payload: fromQs().id,
        });
        yield put({
          type: 'userContractEditSub/updateState',
          payload: {
            flag4: 0, // reset dirty flag
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '操作失败' });
      }
    },

    *saveRecv({ payload }, { call, put, select }) {
      const { id } = fromQs();
      const { otherRecvList, delOtherList } = yield select(({ sharingEdit }) => sharingEdit);

      const { status, response } = yield call(saveOtherRecvList, id, {
        entities: otherRecvList.map(r => ({
          ...r,
          id: typeof r.id === 'string' ? null : r.id,
        })),
        delList: delOtherList.filter(r => typeof r !== 'string'),
      });

      const { datum } = response;

      if (status === 100) {
        // 主动取消请求
        // eslint-disable-next-line consistent-return
        return;
      }
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: { otherRecvList: datum },
        });
        yield put({
          type: 'userContractEditSub/updateState',
          payload: {
            flag4: 0, // reset dirty flag
          },
        });
        createMessage({
          type: 'success',
          description: '保存成功!',
        });
      } else {
        createMessage({
          type: 'error',
          description: '保存失败!' + response.reason || '保存其他收付计划失败',
        });
      }
    },

    *stlApply({ payload }, { call, put, select }) {
      const { otherRecv } = payload;
      const { status, response } = yield call(contOtherStlApply, otherRecv);

      if (status === 100) {
        // 主动取消请求
        // eslint-disable-next-line consistent-return
        return;
      }
      if (response.ok) {
        // 重新查询数据
        const { id } = fromQs();
        const res3 = yield call(getOtherRecvList, id);
        yield put({
          type: 'updateState',
          payload: {
            otherRecvList: Array.isArray(res3.response.datum) ? res3.response.datum : [],
          },
        });
        yield put({
          type: 'userContractEditSub/updateState',
          payload: {
            flag4: 0, // reset dirty flag
          },
        });
        createMessage({
          type: 'success',
          description: '提交成功!',
        });
      } else {
        createMessage({
          type: 'error',
          description: '提交失败!' + response.reason || '提交结算申请失败',
        });
      }
    },
  },

  reducers: {
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
