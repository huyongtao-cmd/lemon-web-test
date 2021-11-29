import { createNormal, findExpenseById, saveExpense } from '@/services/user/expense/expense';
import createMessage from '@/components/core/AlertMessage';
import { queryAdvanceVerificationDetail, saveData } from '@/services/plat/advanceVerification';
import { queryUserPrincipal } from '@/services/gen/user';
import { pushFlowTask } from '@/services/gen/flow';
import { closeThenGoto } from '@/layouts/routerControl';
import moment from 'moment';
import { isEmpty, isNil, takeWhile, trim } from 'ramda';
import { fromQs } from '@/utils/stringUtils';

export default {
  namespace: 'advanceVerificationEdit',
  state: {
    formData: {},
    detailList: [], // 明细列表
    phaseList: [],
    feeCodeList: [],
    reimTmpl: {},
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

    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryAdvanceVerificationDetail, payload);
      if (response && response.ok) {
        const formData = response.datum || {};
        const detailList = response.datum.reimdList || [];
        yield put({
          type: 'updateState',
          payload: {
            formData,
            detailList,
          },
        });
        return formData;
      }
      createMessage({ type: 'error', description: response.reason });
      return {};
    },

    // *query({ payload }, { call, put }) {
    //   const { status, response } = yield call(findExpenseById, payload);
    //   if (status === 100) {
    //     // 主动取消请求
    //     return {};
    //   }
    //   if (response.ok) {
    //     // 如果是复制功能，则给部分参数初始化，如果是编辑功能，则给所有值
    //     const { isCopy = null } = fromQs();
    //     const formData = isCopy
    //       ? {
    //           ...response.datum,
    //           id: null,
    //           reimStatus: 'CREATE',
    //           reimBatchNo: '系统生成',
    //           reimNo: '系统生成',
    //           reimStatusName: '新建',
    //           applyDate: moment().format('YYYY-MM-DD'),
    //         }
    //       : response.datum || {};
    //     const detailList =
    //       Array.isArray(formData.reimdList) && isCopy
    //         ? formData.reimdList.map(item => ({ ...item, id: item.id + '', reimId: undefined }))
    //         : formData.reimdList || [];
    //     yield put({
    //       type: 'updateState',
    //       payload: {
    //         formData,
    //         detailList,
    //       },
    //     });
    //     return formData;
    //   }
    //   createMessage({ type: 'error', description: response.reason });
    //   return {};
    // },

    *init({ payload }, { call, put }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
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
    },

    *save({ payload }, { call, put, select }) {
      const { id, isSubmit, taskId, params } = payload;
      const { formData, detailList } = yield select(
        ({ advanceVerificationEdit }) => advanceVerificationEdit
      );
      if (formData.reimDate === '') {
        formData.reimDate = null;
      }
      if (!detailList || (detailList && detailList.length < 1)) {
        createMessage({ type: 'warn', description: '费用明细至少需要一条数据' });
        return false;
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
      if (formData.phaseDesc) {
        formData.phaseDesc = parseInt(formData.phaseDesc, 10);
      }
      const { status: sts, response } = yield call(saveData, formData);
      if (sts === 100) {
        // 主动取消请求
        return false;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        closeThenGoto(`/user/flow/process`);
        return true;
      }
      createMessage({ type: 'warn', description: response.reason || '操作失败', duration: 8 });
      return false;
    },

    *create({ payload }, { call, put, select }) {
      const { formData, detailList } = yield select(
        ({ advanceVerificationEdit }) => advanceVerificationEdit
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

      const { status, response } = yield call(createNormal, {
        ...formData,
        submitted: payload.isSubmit,
      });
      if (status === 100) {
        // 主动取消请求
        return false;
      }
      if (response.ok) {
        const { sourceUrl } = fromQs();
        createMessage({ type: 'success', description: '保存成功' });
        if (payload.isSubmit) {
          // 提交之后进查看页
          sourceUrl
            ? // 如果带来源页，则传递来源页
              closeThenGoto(`/plat/expense/normal/view?id=${response.datum}&sourceUrl=${sourceUrl}`)
            : closeThenGoto(`/plat/expense/normal/view?id=${response.datum}`);
        } else {
          // 保存之后进我的报销页面
          closeThenGoto(sourceUrl || '/user/center/myExpense');
          // 保存之后进编辑页
          // closeThenGoto(`/plat/expense/normal/edit?id=${response.datum}`);
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
  },
};
