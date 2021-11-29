import moment from 'moment';
import {
  systemSettingCreateRq,
  systemSettingModifyRq,
  systemSettingDetailRq,
  systemSettingListPagingRq,
  systemSettingLogicalDeleteRq,
} from '@/services/production/system/systemSetting';
import createMessage from '@/components/core/AlertMessage';
import message from '@/components/production/layout/Message';
import { handleEmptyProps } from '@/utils/objectUtils';
import { fromQs } from '@/utils/production/stringUtil.ts';
import { isEmpty, isNil, omit } from 'ramda';
import update from 'immutability-helper';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';

const defaultSearchForm = {};
const defaultState = {
  formData: { details: [] },
  list: [],
  moduleList: [],
  total: 0,
  searchForm: defaultSearchForm,
  valueData: {},
  deleteKeys: [],
  formMode: 'EDIT',
};
export default {
  namespace: 'systemSettingIndex',
  state: defaultState,

  effects: {
    *init({ payload }, { call, put }) {
      const { id, mode } = fromQs();
      const { data } = yield outputHandle(systemSettingDetailRq, { id });
      yield put({
        type: 'updateState',
        payload: {
          formData: data,
        },
      });
    },
    // 查询
    *query({ payload }, { call, put }) {
      const param = handleEmptyProps(payload);
      const { status, response } = yield call(systemSettingListPagingRq, param);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows.filter(v => v) : [],
            total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    // 查询系统设置详情（详情页）
    *queryValueData({ payload }, { call, put }) {
      const { status, response } = yield call(systemSettingDetailRq, payload);
      if (status === 200) {
        const { datum } = response;
        if (response && response.ok) {
          // createMessage({ type: 'success', description: response.reason || '查询成功' });
          yield put({
            type: 'updateState',
            payload: {
              valueData: datum,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '查询失败' });
        }
      }
    },
    // 查询系统设置详情（修改时）
    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(systemSettingDetailRq, payload);
      if (status === 200) {
        const { datum } = response;
        if (response && response.ok) {
          // createMessage({ type: 'success', description: response.reason || '查询成功' });
          yield put({
            type: 'updateForm',
            payload: datum,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '查询失败' });
        }
      }
    },

    *save({ payload }, { call, put, select }) {
      const { formData } = payload;
      const { id } = formData;
      // const param = { entity: omit(['details'], formData), details: formData.details, deleteKeys };
      let output;
      if (id && id > 0) {
        // 编辑
        const { data } = yield outputHandle(systemSettingModifyRq, formData);
        output = data;
      } else {
        // 新增
        const { data } = yield outputHandle(systemSettingCreateRq, formData);
        // const {response} = yield call(systemLocaleCreate, formData);
        output = data;
      }
      // 弹出操作成功,操作失败无需写代码,outputHandle已处理
      message({ type: 'success' });
      yield put({
        type: 'init',
        payload: { id: output.data.id },
      });

      yield put({
        type: 'init',
        payload: {},
      });

      yield put({
        type: 'updateState',
        payload: {
          formMode: 'DESCRIPTION',
        },
      });
    },
    // 删除
    *delete({ payload }, { call, put, select }) {
      const { searchForm } = yield select(({ systemSettingIndex }) => systemSettingIndex);
      const { status, response } = yield call(systemSettingLogicalDeleteRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '删除失败' });
        }
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
    resetState(state, { payload }) {
      return defaultState;
    },
    updateForm(state, { payload }) {
      const { formData } = state;

      const newFormData = { ...formData, ...payload };

      return {
        ...state,
        formData: newFormData,
      };
    },
    updateFormForEditTable(state, { payload }) {
      const { formData } = state;
      const name = Object.keys(payload)[0];
      const element = payload[name];
      let newFormData;
      if (Array.isArray(element)) {
        element.forEach((ele, index) => {
          if (!isNil(ele)) {
            newFormData = update(formData, { [name]: { [index]: { $merge: ele } } });
          }
        });
      } else {
        newFormData = { ...formData, ...payload };
      }

      return {
        ...state,
        formData: newFormData,
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
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [], // 清空选中项，因为searchForm里面记录了这个东西
        },
      };
    },
    cleanState(state, { payload }) {
      return defaultState;
    },
  },
};
