import { findIncomes, saveIncomes } from '@/services/sys/baseinfo/butemplate';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'sysButempincome',

  state: {
    incomeList: [],
    incomeDels: [],
  },

  effects: {
    // 查询资源当量收入
    *queryIncomeList({ payload }, { call, put }) {
      const { response } = yield call(findIncomes, payload);
      const list = Array.isArray(response.rows) ? response.rows : [];
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            incomeList: list,
            incomeDels: list.map(v => v.id),
          },
        });
      }
    },
    // 保存
    *save({ payload }, { put, call, select }) {
      const { incomeDels, incomeList } = yield select(({ sysButempincome }) => sysButempincome);
      // // 把原始数据里被删掉的id找出来
      const list = incomeList.filter(v => !!v.jobType);
      const ids = incomeDels.filter(d => !list.map(i => i.id).filter(v => v > 0 && d === v).length);

      const { status, response } = yield call(saveIncomes, { incomeList: list, incomeDels: ids });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({ type: 'queryIncomeList', payload });
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
  },
};
