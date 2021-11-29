import { update, findComputerById, findResById, createApply } from '@/services/plat/computer';
import createMessage from '@/components/core/AlertMessage';
import { pushFlowTask } from '@/services/gen/flow';
import { closeThenGoto } from '@/layouts/routerControl';
import moment from 'moment';

const chosePageToGo = page => {
  if (page === 'list') {
    closeThenGoto('/plat/expense/computer/apply');
  } else if (page === 'my') {
    closeThenGoto('/user/center/info?key=computer');
  }
};

export default {
  namespace: 'platComputerApplyEdit',

  state: {
    formData: {},
  },

  effects: {
    // 查询单条数据内容
    *query({ payload }, { call, put }) {
      const {
        response: { ok, datum },
      } = yield call(findComputerById, payload.id);
      if (ok) {
        const formData = {
          ...datum,
          buyDate: datum && datum.buyDate ? moment(datum.buyDate) : undefined,
          startPeriodId:
            datum && datum.startPeriodId ? moment(datum.startPeriodId, 'YYYYMM') : undefined,
        };
        yield put({
          type: 'updateState',
          payload: { formData },
        });
      }
    },
    // 选择申请人带出：BASE地baseCityName、申请人所属BUbaseBuName、补贴额度compfeeQuota
    *changeApplyResId({ payload }, { call, put }) {
      const {
        status,
        response: { ok, datum },
      } = yield call(findResById, payload);
      if (status === 100) {
        // 自动取消请求
        return;
      }
      if (ok) {
        const { baseCityName, baseBuName, baseBuId, compfeeQuota } = datum || {};
        yield put({
          type: 'updateForm',
          payload: {
            baseCityName,
            resBuName: baseBuName,
            resBuId: baseBuId,
            monthlyAmt: compfeeQuota,
          },
        });
      }
    },
    *save({ payload }, { call, put, select }) {
      const { page, formData, isSubmit, taskId, params } = payload;
      const newPayload = {
        ...formData,
        buyDate:
          formData && formData.buyDate ? moment(formData.buyDate).format('YYYY-MM-DD') : undefined,
        startPeriodId:
          formData && formData.startPeriodId
            ? moment(formData.startPeriodId).format('YYYYMM')
            : undefined,
      };
      const { status, response } = yield call(update, newPayload);
      if (status === 100) {
        // 自动取消请求
        return;
      }
      if (response && response.ok) {
        if (!isSubmit) {
          // 保存成功
          createMessage({ type: 'success', description: '保存成功' });
          chosePageToGo(page);
          return;
        }
        if (!taskId) {
          // 提交流程
          const { status: sts } = yield call(createApply, response.datum.id);
          if (sts === 100) {
            // 自动取消请求
            return;
          }
          if (sts === 200) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/user/flow/process`);
          }
          return;
        }
        // 再次提交流程
        const { status: apprSts } = yield call(pushFlowTask, taskId, params);
        if (apprSts === 100) {
          // 自动取消请求
          return;
        }
        if (apprSts === 200) {
          createMessage({ type: 'success', description: '操作成功' });
          closeThenGoto(`/user/flow/process`);
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            applyStatus: 'CREATE',
            apprStatus: 'NOTSUBMIT',
          },
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
    // 修改form表单字段内容，将数据保存到state
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
