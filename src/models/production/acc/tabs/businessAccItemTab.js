import { businessAccItemListPaging } from '@/services/production/acc';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils.ts';

// 默认状态
const defaultState = {
  treeList: [],
  currentSelectId: undefined,
};

export default {
  namespace: 'businessAccItemTab',

  state: defaultState,

  effects: {
    *init({ payload }, { call, put, select }) {
      const {
        data: { rows },
      } = yield outputHandle(businessAccItemListPaging, { limit: 0 });
      const list = rows.map(item => ({
        ...item,
        title: item.itemName,
        key: item.itemCode,
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
