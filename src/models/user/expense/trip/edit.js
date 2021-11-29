/* eslint-disable */
import moment from 'moment';
import { isEmpty, isNil, takeWhile, trim, clone } from 'ramda';
import {
  createTrip,
  findExpenseById,
  commitExpense,
  saveExpense,
  selectTripApply,
  getMealFeeRq,
  selectRoleCodeByResIdRq,
} from '@/services/user/expense/expense';
import createMessage from '@/components/core/AlertMessage';
import { queryUserPrincipal } from '@/services/gen/user';
import { pushFlowTask } from '@/services/gen/flow';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';

const whereToGo = () => {
  const { sourceUrl } = fromQs();
  return sourceUrl || '/user/center/myExpense';
};

export default {
  namespace: 'userExpenseTripEdit',
  state: {
    formData: {},
    detailList: [], // 明细列表
    feeCodeList: [],
    visible: false,
    modalParmas: {},
    mealMoenyList: [],
    expenseOuList: [],
  },

  effects: {
    *getResRoles({ payload }, { call, put }) {
      const { status, response } = yield call(selectRoleCodeByResIdRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }

      if (status === 200 && response.ok) {
        yield put({
          type: 'updateForm',
          payload: {
            roles: Array.isArray(response.datum) ? response.datum : [],
          },
        });
        return response;
      }

      createMessage({ type: 'error', description: response.reason || '获取报销人角色失败' });
      return {};
    },

    *clean(_, { put }) {
      return yield put({
        type: 'updateState',
        payload: {
          formData: {},
          detailList: [],
        },
      });
    },

    *query({ payload }, { call, put }) {
      const { status, response } = yield call(findExpenseById, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok) {
        // 如果是复制功能，则给部分参数初始化，如果是编辑功能，则给所有值
        const { isCopy = null } = fromQs();
        const busitripApplyName =
          (response.datum && response.datum.applyView && response.datum.applyView.applyName) ||
          undefined;
        const formData = isCopy
          ? {
              ...response.datum,
              busitripApplyName,
              reimBatchNo: '系统生成',
              reimNo: '系统生成',
              reimStatusName: '新建',
              applyDate: moment().format('YYYY-MM-DD'),
            }
          : { ...response.datum, busitripApplyName } || {};

        const detailList =
          Array.isArray(formData.reimdList) && isCopy
            ? formData.reimdList.map(item => ({
                ...item,
                id: item.id + '',
                reimId: undefined,
                invoiceentity: [],
              }))
            : formData.reimdList || [];

        const { response: res } = yield call(
          selectTripApply,
          formData.reimResId,
          payload,
          formData.reimType1
        );

        yield put({
          type: 'updateState',
          payload: {
            formData,
            detailList,
            tripApplyList: Array.isArray(res.datum) ? res.datum : [],
          },
        });
        yield put({
          type: 'getResRoles',
          payload: {
            resId: formData.reimResId,
          },
        });
        return response.datum || {};
      }
      createMessage({ type: 'error', description: response.reason });
      return {};
    },

    *init({ payload }, { call, put }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      const { resId, resName, baseBuName, jobGrade } = response.extInfo || {};
      const { roles } = response;

      const { status: sts, response: res } = yield call(
        selectTripApply,
        resId,
        undefined,
        'PERSONAL'
      );
      if (status === 100) return;

      yield put({
        type: 'updateState',
        payload: {
          formData: {
            reimType1: 'PERSONAL',
            reimType2: 'TRIP',
            reimResId: isNil(resId) ? undefined : resId + '',
            jobGrade,
            reimResName: resName,
            resBuName: baseBuName,
            reimBatchNo: '系统生成',
            reimNo: '系统生成',
            reimStatusName: '新建',
            applyDate: moment().format('YYYY-MM-DD'),
            payMethod: '1',
            bookTicketFlag: 0,
            roles,
          },
          detailList: [],
          tripApplyList: Array.isArray(res.datum) ? res.datum : [],
        },
      });
    },

    *save({ payload }, { call, put, select }) {
      const { id, isSubmit, taskId, params } = payload;
      const { formData, detailList } = yield select(
        ({ userExpenseTripEdit }) => userExpenseTripEdit
      );
      if (formData.reimDate === '') {
        formData.reimDate = null;
      }
      // 明细列表
      let notSatisfied = false;
      takeWhile(item => {
        const judgment =
          isNil(item.feeType) ||
          isNil(item.fromPlace) ||
          isNil(item.reimDesc) ||
          isEmpty(trim(item.reimDesc));
        if (judgment) {
          createMessage({ type: 'warn', description: '请补全表单必填项（带*的均为必填项）' });
          notSatisfied = true;
        }
        return !judgment;
      }, detailList);
      if (notSatisfied) return false;
      formData.reimdList = detailList.map(r => ({
        ...r,
        id: typeof r.id === 'string' ? null : r.id,
      }));

      // 住宿填报时必填日期止
      const hh = detailList.filter(v => v.feeType === 'HOTEL' && !v.feeDateTo);
      if (hh.length) {
        createMessage({ type: 'warn', description: '请补全表格中住宿日期(止)项！' });
        return null;
      }
      // 餐费填报时必填日期止
      const tt = detailList.filter(v => v.feeType === 'MEAL' && !v.feeDateTo);
      if (tt.length) {
        createMessage({ type: 'warn', description: '请补全表格中餐费日期(止)项！' });
        return null;
      }

      const { status: sts, response } = yield call(saveExpense, {
        ...formData,
        submitted: isSubmit,
      });
      if (sts === 100) {
        // 主动取消请求
        return false;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        if (isSubmit) {
          if (taskId) {
            // 再次提交流程
            const { status } = yield call(pushFlowTask, taskId, params);
            if (status === 200) {
              createMessage({ type: 'success', description: '操作成功' });
              closeThenGoto(`/user/flow/process`);
            } else if (status === 100) {
              // 主动取消请求
              return false;
            }
            return true;
          }
          // 提交之后进查看页
          closeThenGoto(`/plat/expense/trip/view?id=${response.datum}`);
        } else {
          // // 保存之后原地刷新
          // yield put({ type: 'query', payload: id });
          // 现在不跳编辑页了，跳我的报销
          closeThenGoto(whereToGo());
        }
        return true;
      }

      const { datum } = response;
      if (datum === -88) {
        createMessage({
          type: 'warn',
          description: response.reason.desc || '保存失败',
          duration: 8,
        });
      } else if (datum === -99) {
        createMessage({ type: 'warn', description: response.reason || '保存失败', duration: 8 });
      } else {
        createMessage({ type: 'warn', description: response.reason || '保存失败', duration: 8 });
      }
      return false;
    },

    *create({ payload }, { call, put, select }) {
      const { formData, detailList } = yield select(
        ({ userExpenseTripEdit }) => userExpenseTripEdit
      );
      if (formData.reimDate === '') {
        formData.reimDate = null;
      }
      if (isEmpty(detailList) || detailList.length <= 0) {
        createMessage({ type: 'warn', description: '请填写费用明细' });
        return false;
      }
      // 明细列表
      let notSatisfied = false;
      takeWhile(item => {
        const judgment =
          isNil(item.feeType) ||
          isNil(item.fromPlace) ||
          isNil(item.reimDesc) ||
          isEmpty(trim(item.reimDesc));
        if (judgment) {
          createMessage({ type: 'warn', description: '请补全表单必填项（带*的均为必填项）' });
          notSatisfied = true;
        }
        return !judgment;
      }, detailList);
      if (notSatisfied) return false;
      formData.reimdList = detailList.map(r => ({
        ...r,
        id: typeof r.id === 'string' ? null : r.id,
      }));

      // 住宿填报时必填日期止
      const hh = detailList.filter(v => v.feeType === 'HOTEL' && !v.feeDateTo);
      if (hh.length) {
        createMessage({ type: 'warn', description: '请补全表格中住宿日期(止)项！' });
        return null;
      }
      // 餐费填报时必填日期止
      const tt = detailList.filter(v => v.feeType === 'MEAL' && !v.feeDateTo);
      if (tt.length) {
        createMessage({ type: 'warn', description: '请补全表格中餐费日期(止)项！' });
        return null;
      }

      const { status, response } = yield call(createTrip, {
        ...formData,
        submitted: payload.isSubmit,
      });
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        if (payload.isSubmit) {
          // 提交之后进查看页
          closeThenGoto(`/plat/expense/trip/view?id=${response.datum}`);
        } else {
          // 保存之后进我的报销页面
          closeThenGoto(whereToGo());
          // 保存之后进编辑页
          // closeThenGoto(`/plat/expense/trip/edit?id=${response.datum}`);
        }
        return true;
      }
      createMessage({ type: 'warn', description: response.reason || '保存失败', duration: 8 });
      return false;
    },
    *selectTripApply({ payload }, { call, put, select }) {
      const { resId, id, reimType1 } = payload;
      const { response } = yield call(selectTripApply, resId, id, reimType1);
      yield put({
        type: 'updateState',
        payload: {
          tripApplyList: Array.isArray(response.datum) ? response.datum : [],
        },
      });
    },
    *getMealFee({ payload }, { call, put, select }) {
      const { status, response } = yield call(getMealFeeRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok) {
        const { modalParmas, detailList } = yield select(
          ({ userExpenseTripEdit }) => userExpenseTripEdit
        );
        const { index } = modalParmas;
        const { tripMealsDayList } = detailList[index];

        const {
          datum: { feeAmt },
        } = response;
        yield put({
          type: 'updateState',
          payload: {
            modalParmas: {
              ...modalParmas,
              feeAmt,
            },
            mealMoenyList: clone(tripMealsDayList),
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '获取餐费额度失败' });
      return {};
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

    updateTableCell(state, { payload }) {
      const { detailList } = state;
      const newList = detailList.slice();
      const { type, item, ruleExplain, itemList } = payload;

      newList.map(ele => {
        if (ele.id === item.id) {
          if (ele.ruleExplain && !ele.ruleExplain.includes(ruleExplain)) {
            ele.ruleExplain = ele.ruleExplain
              ? `${ele.ruleExplain}${ele.ruleExplain && ruleExplain ? ',' : ''}${ruleExplain}`
              : '';
          }
        }
        return ele;
      });

      if (type === 'exceedHotelFee' || type === 'invoiceConsecutiveNum') {
        newList.map(ele => {
          if (ele.lineNo === item.lineNo) {
            if (ele.ruleExplain && !ele.ruleExplain.includes(ruleExplain)) {
              ele.ruleExplain = ele.ruleExplain
                ? `${ele.ruleExplain}${ele.ruleExplain && ruleExplain ? ',' : ''}${ruleExplain}`
                : '';
            }
            return ele;
          }
        });
      }

      return {
        ...state,
        detailList: newList,
      };
    },
  },
};
