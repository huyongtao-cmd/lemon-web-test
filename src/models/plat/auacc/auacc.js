import { findAuAccList, auAccSave } from '@/services/plat/auacc/auacc';
import createMessage from '@/components/core/AlertMessage';
import router from 'umi/router';
import { clone } from 'ramda';

export default {
  namespace: 'platAuAcc',

  state: {
    searchForm: {
      ouName: null, // 公司
      buId: null, // bu
      accsetName: null, // 账套名称
      accSearchKey: null, // 科目
      accLevel: null, // 科目级别
      accStatus: null, // 科目状态
    },
    dataSource: [],
    total: 0,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(findAuAccList, payload);

      yield put({
        type: 'updateState',
        payload: {
          dataSource: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
    },
    // 保存
    *save(payload, { call, select, put }) {
      const { dataSource } = yield select(({ platAuAcc }) => platAuAcc);
      const { queryParams } = payload;
      // 借方金额
      const drAmt = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ];
      // 贷方金额
      const crAmt = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ];
      // 组装数据
      const newDataSource = clone(dataSource);
      newDataSource.map(element => {
        const newDrAmt = drAmt.map((item, index) => {
          const str = 'drAmt' + (index + 1);
          return element[str];
        });
        const newCrAmt = crAmt.map((item, index) => {
          const str = 'crAmt' + (index + 1);
          return element[str];
        });
        const newElement = element;
        newElement.drAmtArr = newDrAmt;
        newElement.crAmtArr = newCrAmt;
        newElement.id = null;
        return newElement;
      });

      const { response, status } = yield call(auAccSave, { entityList: newDataSource });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({
          type: 'query',
          payload: queryParams,
        });
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
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

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
