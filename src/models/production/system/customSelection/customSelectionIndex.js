import {
  customSelectionContainBase,
  customSelectionListPaging,
  customSelectionCreate,
  customSelectionDetail,
  customSelectionLogicalDelete,
  customSelectionModify,
} from '@/services/production/system';
import { outputHandle } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils.ts';

// 默认状态
const defaultState = {
  selectionList: [],
  formData: {},
  formMode: 'DESCRIPTION',
  currentTenantId: '0',
};

export default {
  namespace: 'customSelectionIndex',

  state: defaultState,

  effects: {
    *init({ payload }, { call, put, select }) {
      const { currentTenantId } = yield select(({ customSelectionIndex }) => customSelectionIndex);
      // const {data: {rows},} = yield outputHandle(customSelectionListPaging, {limit: 0});
      // const list = rows.map(item => ({
      //   ...item,
      //   title: item.selectionName,
      //   key: item.selectionKey,
      // }));
      const output = yield outputHandle(customSelectionContainBase, {
        containBaseTenantId: currentTenantId,
        limit: 0,
      });
      const list = output.data.map(item => ({
        ...item,
        title: item.selectionName,
        key: item.selectionKey,
      }));
      yield put({
        type: 'updateState',
        payload: {
          selectionList: list,
        },
      });
    },

    *handleSelectChange({ payload }, { call, put }) {
      // const { id } = payload;
      // const { response } = yield call(customSelectionDetail, payload);
      const output = yield outputHandle(customSelectionDetail, payload);
      yield put({
        type: 'updateState',
        payload: {
          formMode: 'DESCRIPTION',
          formData: output.data,
        },
      });
    },

    *save({ payload }, { call, put, select }) {
      const { formData } = yield select(({ customSelectionIndex }) => customSelectionIndex);
      const { id } = formData;
      let output;
      if (id && id > 0) {
        // 编辑
        // const { response } = yield call(customSelectionModify, formData);
        output = yield outputHandle(customSelectionModify, formData);
      } else {
        // 新增
        // const { response } = yield call(customSelectionCreate, formData);
        output = yield outputHandle(customSelectionCreate, {
          ...formData,
        });
      }
      // yield put({
      //   type: 'updateState',
      //   payload: {
      //     formMode: 'DESCRIPTION',
      //     formData: output.data,
      //   },
      // });
      yield put({
        type: 'handleSelectChange',
        payload: { id: output.data.id },
      });

      yield put({
        type: 'init',
        payload: {},
      });
    },

    *delete({ payload }, { call, put, select }) {
      // const { response } = yield call(customSelectionLogicalDelete, payload);
      const output = yield outputHandle(customSelectionLogicalDelete, payload);
      yield put({
        type: 'updateState',
        payload: {
          formMode: 'DESCRIPTION',
          formData: {},
        },
      });
      yield put({
        type: 'init',
        payload: {},
      });
    },
  },

  reducers: {
    // 使用工具方法快速写updateState,updateForm,cleanState 方法
    ...commonModelReducers(defaultState),
  },
};
