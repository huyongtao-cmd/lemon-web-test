/* eslint-disable */
import { postParticular, findExpenseById, putParticular } from '@/services/user/expense/expense';
import createMessage from '@/components/core/AlertMessage';
import { queryUserPrincipal } from '@/services/gen/user';
import { pushFlowTask } from '@/services/gen/flow';
import { closeThenGoto } from '@/layouts/routerControl';
import moment from 'moment';
import { isEmpty, isNil, takeWhile, trim } from 'ramda';
import { fromQs } from '@/utils/stringUtils';

const whereToGo = () => {
  const { sourceUrl } = fromQs();
  return sourceUrl || '/user/center/myExpense';
};

export default {
  namespace: 'userExpenseParticularEdit',
  state: {
    formData: {},
    detailList: [], // 明细列表
    phaseList: [],
    feeCodeList: [],
    reimTmpl: {},
    feeApplyList: [],
    feeApplyAvailable: 0,
    expenseOuList: [],
  },

  effects: {
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
        const formData = isCopy
          ? {
              ...response.datum,
              id: null,
              reimStatus: 'CREATE',
              reimBatchNo: '系统生成',
              reimNo: '系统生成',
              allocationFlag: 0,
              reimStatusName: '新建',
              applyDate: moment().format('YYYY-MM-DD'),
            }
          : response.datum || {};
        const detailList =
          Array.isArray(formData.reimdList) && isCopy
            ? formData.reimdList.map(item => ({
                ...item,
                id: item.id + '',
                reimId: undefined,
                invoiceentity: [],
              }))
            : formData.reimdList || [];
        yield put({
          type: 'updateState',
          payload: {
            formData,
            detailList,
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
        return undefined;
      }
      const { resId, resName, jobGrade, baseBuName } = response.extInfo || {};

      yield put({
        type: 'updateState',
        payload: {
          formData: {
            reimResId: isNil(resId) ? undefined : resId + '',
            reimResName: resName,
            jobGrade,
            resBuName: baseBuName,
            reimBatchNo: '系统生成',
            reimNo: '系统生成',
            reimStatusName: '新建',
            applyDate: moment().format('YYYY-MM-DD'),
            payMethod: '1',
          },
          detailList: [],
        },
      });

      return resId;
    },

    *save({ payload }, { call, put, select }) {
      const { id, isSubmit, taskId, params } = payload;
      const { formData, detailList } = yield select(
        ({ userExpenseParticularEdit }) => userExpenseParticularEdit
      );
      if (formData.reimDate === '') {
        formData.reimDate = null;
      }
      // 明细列表
      let notSatisfied = false;
      takeWhile(item => {
        const judgment = isNil(item.accId) || isNil(item.reimDesc) || isEmpty(trim(item.reimDesc));
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
      const { status: sts, response } = yield call(putParticular, {
        ...formData,
        submitted: payload.isSubmit,
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
          closeThenGoto(`/plat/expense/particular/view?id=${response.datum}`);
        } else {
          // // 保存之后原地刷新
          // yield put({ type: 'query', payload: formData.id });
          // 现在不跳编辑页了，跳我的报销
          closeThenGoto(whereToGo());
        }
        return true;
      }
      createMessage({ type: 'warn', description: response.reason || '保存失败', duration: 8 });
      return false;
    },

    *create({ payload }, { call, put, select }) {
      const { formData, detailList } = yield select(
        ({ userExpenseParticularEdit }) => userExpenseParticularEdit
      );
      if (formData.reimDate === '') {
        formData.reimDate = null;
      }
      if (isEmpty(detailList) || detailList.length <= 0) {
        createMessage({ type: 'warn', description: '请填写费用明细' });
        return 0;
      }
      // 明细列表
      let notSatisfied = false;
      takeWhile(item => {
        const judgment = isNil(item.accId) || isNil(item.reimDesc) || isEmpty(trim(item.reimDesc));
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

      const { status, response } = yield call(postParticular, {
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
          closeThenGoto(`/plat/expense/particular/view?id=${response.datum}`);
        } else {
          // 保存之后进我的报销页面
          closeThenGoto(whereToGo());
          // 保存之后进编辑页
          // closeThenGoto(`/plat/expense/particular/edit?id=${response.datum}`);
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
