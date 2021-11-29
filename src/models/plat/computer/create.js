import { create, findResById, createApply } from '@/services/plat/computer';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import moment from 'moment';

export default {
  namespace: 'platComputerApplyCreate',

  state: {
    formData: {
      applyStatus: 'CREATE',
      apprStatus: 'NOTSUBMIT',
    },
  },

  effects: {
    *initCreate({ payload }, { select, put }) {
      const {
        user: { extInfo },
      } = yield select(({ user: { user } }) => ({ user }));
      extInfo && extInfo.resId
        ? yield put({ type: 'changeApplyResId', payload: extInfo.resId })
        : yield put({ type: 'clean' });
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
        const { id, baseCityName, baseBuName, baseBuId, compfeeQuota } = datum || {};
        yield put({
          type: 'updateForm',
          payload: {
            applyResId: id,
            baseCityName,
            resBuName: baseBuName,
            resBuId: baseBuId,
            monthlyAmt: compfeeQuota,
          },
        });
      }
    },
    *save({ payload }, { call, put, select }) {
      const { formData, isSubmit } = payload;
      const newPayload = {
        ...formData,
        buyDate:
          formData && formData.buyDate ? moment(formData.buyDate).format('YYYY-MM-DD') : undefined,
        startPeriodId:
          formData && formData.startPeriodId
            ? moment(formData.startPeriodId).format('YYYYMM')
            : undefined,
      };

      const { response, status } = yield call(create, newPayload);
      if (status === 100) {
        // 自动取消请求
        return;
      }
      if (response && response.ok) {
        if (!isSubmit) {
          // 保存成功
          createMessage({ type: 'success', description: '保存成功' });
          closeThenGoto(`/user/center/info?key=computer`);
          return;
        }
        // 提交流程
        const { status: apprSts } = yield call(createApply, response.datum.id);
        if (apprSts === 100) {
          // 自动取消请求
          return;
        }
        if (apprSts === 200) {
          createMessage({ type: 'success', description: '提交成功' });
          // closeThenGoto('/user/flow/procs');
          closeThenGoto(`/user/center/info?key=computer`);
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
