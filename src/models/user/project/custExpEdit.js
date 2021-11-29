import { queryCustExpDetail, saveCustExpForm } from '@/services/user/expense/custExp';
import { selectAccount } from '@/services/user/expense/expense';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

// 主表空数据
const emptyFormData = {
  custexpApplyStatus: 'CREATE',
  apprStatus: 'NOTSUBMIT',
  applyAmt: 0,
  taxedApplyAmt: 0,
};

export default {
  namespace: 'custExpEdit',

  state: {
    // 编辑
    formData: emptyFormData,
    dataList: [],
    total: 0,
    accountSource: [],
  },

  effects: {
    *query({ payload }, { call, put, select }) {
      // eslint-disable-next-line no-shadow
      const { user } = yield select(({ user }) => user);
      const { resId, jobGrade } = user.extInfo;
      // yield put({
      //   type: 'queryAccount',
      //   payload: resId,
      // });
      const { response } = yield call(queryCustExpDetail, payload.ids, payload.id);
      const { datum = {} } = response;
      const dataList = Array.isArray(datum.listReimdView) ? datum.listReimdView : [];
      const accountSource = Array.isArray(datum.cusrAccViewList) ? datum.cusrAccViewList : [];

      // eslint-disable-next-line array-callback-return
      dataList.map(v => {
        // eslint-disable-next-line no-param-reassign
        v.applyAmt = v.taxedReimAmt;
      });
      let applyAmt = 0;
      dataList.forEach(v => {
        applyAmt += v.taxedReimAmt;
      });

      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...emptyFormData,
              ...datum,
              applyAmt,
              taxedApplyAmt: applyAmt,
              applyResId: resId,
              applyJobGrade: jobGrade,
              ...accountSource.filter(v => v.defaultFlag === 1)[0],
            },
            dataList,
            accountSource,
          },
        });
      }
    },
    // *queryAccount({ payload }, { call, put }) {
    //   const { response } = yield call(selectAccount, payload);
    //   yield put({
    //     type: 'updateState',
    //     payload: {
    //       accountSource: Array.isArray(response) ? response : [],
    //     },
    //   });
    // },

    *save({ payload }, { call, put, select }) {
      const { formData, dataList } = payload;
      delete formData.listReimdView;
      const newFormData = {
        ...formData,
        custDList: dataList,
        submit: true,
      };
      const { response } = yield call(saveCustExpForm, newFormData);
      if (response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto('/user/project/custExp');
      } else {
        createMessage({ type: 'error', description: '提交失败' });
      }
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
