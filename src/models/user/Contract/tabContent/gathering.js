// /* eslint-disable */
import { recvplanList, saveRecvplanList, saveRecvConf } from '@/services/user/Contract/recvplan';
import { queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import { markAsTab } from '@/layouts/routerControl';
import router from 'umi/router';
import { fromQs } from '@/utils/stringUtils';
import { queryContractDetail } from '@/services/user/Contract/sales';
import { add } from '@/utils/mathUtils';
import moment from 'moment';

export default {
  namespace: 'userContractGathering',

  state: {
    dataList: [],
    total: 0,
    delList: [],
    searchForm: {
      recvNo: null,
      recvStatus: null,
    },
    recvPlanConfForm: {
      recvPlanIds: null,
      confirmDate: null,
      remark: null,
    },
  },

  effects: {
    /* 获取子合同详情 */
    *querySub({ payload }, { call, put, select }) {
      const { response } = yield call(queryContractDetail, payload);
      yield put({
        type: 'updateState',
        payload: {
          totalAmt: (response.datum || {}).amt,
        },
      });
    },
    *query({ payload }, { call, put }) {
      const { response } = yield call(recvplanList, payload);
      // datum.map( (v,i) =>{
      //   if (v.invAmt === null) datum[i].invAmt = 0;
      // })
      yield put({
        type: 'updateState',
        payload: {
          dataList: Array.isArray(response.rows) ? response.rows : [],
          total: response.total || 0,
        },
      });
      // yield put({
      //   type: 'total',
      // });
    },

    *save({ payload }, { call, put, select }) {
      const { id } = fromQs();
      const { dataList, delList, totalAmt } = yield select(
        ({ userContractGathering }) => userContractGathering
      );
      let total = 0;
      let ratio = 0;
      dataList.forEach(v => {
        // 计算总金额不包含客户承担费用
        if (v.phaseDesc.indexOf('客户承担费用') < 0) {
          total = add(total, v.recvAmt || 0);
        }
        ratio = add(ratio, v.recvRatio || 0);
      });

      if (total > totalAmt) {
        createMessage({ type: 'error', description: '当期收款金额不能大于子合同总金额' });
        return;
      }
      if (ratio > 1) {
        createMessage({ type: 'error', description: '当期收款比例不能大于100%' });
        return;
      }
      const entities = dataList;
      // const entities = dataList.slice(0, dataList.length - 1);

      const { status, response } = yield call(saveRecvplanList, id, {
        entities,
        delList,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({
          type: 'query',
          payload: { contractId: id },
        });
        yield put({
          type: 'userContractEditSub/updateState',
          payload: {
            flag3: 0,
          },
        });
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },

    *saveConf({ payload }, { call, put, select }) {
      const {
        recvPlanConfForm: { recvPlanIds, remark },
      } = yield select(({ userContractGathering }) => userContractGathering);
      let {
        recvPlanConfForm: { confirmDate },
      } = yield select(({ userContractGathering }) => userContractGathering);
      // 数组转字符串
      confirmDate = confirmDate || moment().format('YYYY-MM-DD');
      const { status, response } = yield call(saveRecvConf, {
        recvPlanIds: recvPlanIds.join(','),
        confirmDate,
        remark,
      });
      if (status === 100) {
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功！' });
      } else {
        createMessage({ type: 'error', description: '保存失败' + response.reason });
      }
    },

    *updateConfForm({ payload }, { call, put, select }) {
      const { recvPlanConfForm } = yield select(
        ({ userContractGathering }) => userContractGathering
      );
      yield put({
        type: 'updateState',
        payload: {
          recvPlanConfForm: { ...recvPlanConfForm, ...payload },
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
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
  },
};
