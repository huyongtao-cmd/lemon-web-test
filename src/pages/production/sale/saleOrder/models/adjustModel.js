import {
  saleOrderIncreaseRq,
  saleOrderOverallRq,
  saleOrderAdjustDetailRq,
  saleOrderAdjustRq,
} from '@/services/production/sale';
import { customSettingDetailByKey } from '@/services/production/system/customSetting';
import { selectCust } from '@/services/user/Contract/sales';
import moment from 'moment';
import router from 'umi/router';
import createMessage from '@/components/core/AlertMessage';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/production/stringUtil';
import { isEmpty, isNil, omit, type } from 'ramda';
import update from 'immutability-helper';
import { div, mul, add } from '@/utils/mathUtils';
import { purchaseDetail } from '@/services/production/pur';
import { getViewConf } from '@/services/gen/flow';

const defaultState = {
  formData: {
    soStatus: 'CREATE',
    createTime: moment().format('YYYY-MM-DD hh:mm:ss'),
    foreignCurrencyFlag: false,
    detailViews: [], // 销售单明细
    planViews: [], // 收款计划明细
    exchangeRate: 1,
  },
  customFormData: {},
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  copy: false,
  id: undefined,
  detailDelViews: [], // 删除的销售单明细
  planDelViews: [], // 删除的收款计划明细
  customerList: [],
  taskId: undefined,
  flowForm: {
    remark: undefined,
    dirty: false,
  },
  fieldsConfig: {
    buttons: [],
    panels: {},
  },
  attachments: [],
};
export default {
  namespace: 'saleOrderAdjust',

  state: defaultState,

  effects: {
    *fetchCustomSetting({ payload }, { put, select }) {
      const { data } = yield outputHandle(customSettingDetailByKey, { key: 'BASE_CURRENCY' });

      yield put({
        type: 'updateForm',
        payload: {
          originalCurrency: data.settingValue,
        },
      });

      yield put({
        type: 'updateState',
        payload: {
          customFormData: {
            originalCurrency: data.settingValue,
          },
        },
      });
    },
    // 客户列表
    *getCustomerList({ payload }, { call, put, select }) {
      const { status, response = [] } = yield call(selectCust, payload);
      if (status === 100) {
        // 主动取消请求
        return [];
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            customerList: response.map(item => ({
              ...item,
              value: item.id,
              title: item.name,
            })),
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '获取客户列表失败' });
      return [];
    },
    //调整
    *saleOrderAdjust({ payload }, { put, select }) {
      const { ...params } = payload;
      let data = {};
      const { data: datum } = yield outputHandle(
        saleOrderAdjustRq,
        params,
        'saleOrderAdjust/success'
      );
      data = datum;
      yield put({ type: 'success', payload: data });
    },

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      const { taskKey } = response;
      let formMode;
      if (taskKey === 'SAL03_01_SUBMIT_i') {
        formMode = 'EDIT';
      } else {
        formMode = 'DESCRIPTION';
      }
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            formMode,
            fieldsConfig: response || {},
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
      }
    },

    *init({ payload }, { put, select }) {
      const {
        formData: { id },
        copy = false,
      } = yield select(({ saleOrderAdjust }) => saleOrderAdjust);
      if (!id) {
        return;
      }
      const { data } = yield outputHandle(saleOrderAdjustDetailRq, { id });
      // 当为复制时,处理id为null
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      const { attachments = [] } = data;
      const productsaleorder = attachments.map(item => item.id);
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...data, ...copyObj, productsaleorder },
          attachments,
        },
      });
    },

    *success({ payload }, { put, select }) {
      // 弹出操作成功,操作失败无需写代码,outputHandle已处理
      message({ type: 'success' });

      yield put({
        type: 'updateForm',
        payload: {
          id: payload.data.id,
        },
      });
      yield put({
        type: 'init',
      });
    },
  },

  reducers: {
    ...commonModelReducers(defaultState),

    updateFormForEditTable(state, { payload }) {
      const { formData } = state;
      const name = Object.keys(payload)[0];
      const element = payload[name];
      let newFormData = formData;
      if (Array.isArray(element) && !element.filter(v => type(v) !== 'Object').length) {
        element.forEach((ele, index) => {
          if (!isNil(ele)) {
            newFormData = update(formData, { [name]: { [index]: { $merge: ele } } });
            if (
              name === 'detailViews' &&
              (Object.keys(ele)[0] === 'qty' || Object.keys(ele)[0] === 'unitPrice') &&
              type(Object.values(ele)[0]) === 'Number'
            ) {
              const { detailViews, exchangeRate } = newFormData;
              const tt1 = detailViews
                .map(v => mul(v.qty || 0, v.unitPrice || 0))
                .reduce((x = 0, y = 0) => add(x, y), 0);
              const tt2 = !isNil(tt1) && !isNil(exchangeRate) ? mul(tt1, exchangeRate) : '';
              newFormData = {
                ...newFormData,
                originalCurrencyAmt: tt1,
                baseCurrencyAmt: tt2,
              };
            }
          }
        });
      } else {
        newFormData = {
          ...formData,
          ...payload,
        };
      }

      return {
        ...state,
        formData: newFormData,
      };
    },

    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
  },
};
