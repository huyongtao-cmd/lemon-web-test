import { budgetItemListPaging } from '@/services/production/acc';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils.ts';

// 默认状态
const defaultState = {
  treeList: [],
  currentSelectId: undefined,
};

export default {
  namespace: 'budgetItemTab',

  state: defaultState,

  effects: {
    *init({ payload }, { call, put, select }) {
      const {
        data: { rows },
      } = yield outputHandle(budgetItemListPaging, { limit: 0 });
      const list = rows.map(item => ({
        ...item,
        title: item.budgetName,
        key: item.budgetCode,
      }));

      yield put({
        type: 'updateState',
        payload: {
          treeList: list,
        },
      });
    },
  },

  reducers: {
    // 使用工具方法快速写updateState,updateForm,cleanState 方法
    ...commonModelReducers(defaultState),
  },
};
