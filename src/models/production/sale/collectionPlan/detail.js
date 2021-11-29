import { collectionPlanDetailRq } from '@/services/production/collectionPlan';
import {
  salesInvoiceApplyDetailRq,
  salesInvoiceApplySaveRq,
} from '@/services/production/salesInvoice';
import { getInvoiceItemListRq } from '@/services/plat/recv/InvBatch';
import { detailInvInfo, selectInvInfo } from '@/services/plat/recv/Contract';
import moment from 'moment';
import router from 'umi/router';
import createMessage from '@/components/core/AlertMessage';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';
import { isEmpty, isNil, type } from 'ramda';
import update from 'immutability-helper';
import { mul, add } from '@/utils/mathUtils';

const defaultState = {
  formData: {
    batchStatus: 'CREATE',
    createTime: moment().format('YYYY-MM-DD hh:mm:ss'),
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'DESCRIPTION',
  invoiceItemList: [],
  selectList: [],
  attachments: [],
};
export default {
  namespace: 'collectionPlanDetails',

  state: defaultState,

  effects: {
    // 开票表详情
    *salesInvoiceApplyDetail({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(salesInvoiceApplyDetailRq, payload);
      const { createTime, ...restData } = data;
      yield put({
        type: 'updateForm',
        payload: {
          ...restData,
          createTime: createTime ? moment(createTime).format('YYYY-MM-DD hh:mm:ss') : null,
        },
      });

      return data;
    },

    // 收款表详情
    *collectionPlanDetail({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(collectionPlanDetailRq, payload);
      const {
        createTime,
        batchStatus,
        createUserId,
        taxRate,
        collectionAmt,
        taxNo,
        currCode,
        attachments,
        ...restData
      } = data;
      const attach = attachments.map(item => item.id);
      yield put({
        type: 'updateForm',
        payload: {
          ...restData,
          createTime: createTime
            ? moment(createTime).format('YYYY-MM-DD hh:mm:ss')
            : moment().format('YYYY-MM-DD hh:mm:ss'),
          batchStatus: batchStatus || 'CREATE',
          invAmt: collectionAmt,
          attach,
        },
      });
      yield put({
        type: 'updateState',
        payload: {
          attachments,
        },
      });

      return data;
    },

    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo || {},
          },
        });
        return response;
      }
      return {};
    },

    *init({ payload }, { put, select }) {
      const { id, copy = false } = payload;
      if (!id) {
        return;
      }
      const { data } = yield outputHandle(salesInvoiceApplyDetailRq, { id });
      // 当为复制时,处理id为null
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...data, ...copyObj },
        },
      });
    },

    *success({ payload }, { put, select }) {
      // 弹出操作成功,操作失败无需写代码,outputHandle已处理
      message({ type: 'success' });

      // 页面变为详情模式，更新数据
      yield put({
        type: 'updateState',
        payload: {
          formMode: 'DESCRIPTION',
        },
      });

      // 赋值
      yield put({
        type: 'init',
        payload,
      });
    },
  },

  reducers: {
    ...commonModelReducers(defaultState),

    updateFormForEditTable(state, { payload }) {
      const { formData } = state;
      const name = Object.keys(payload)[0];
      const element = payload[name];
      let newFormData;
      if (Array.isArray(element) && !element.filter(v => type(v) !== 'Object').length) {
        element.forEach((ele, index) => {
          if (!isNil(ele)) {
            newFormData = update(formData, { [name]: { [index]: { $merge: ele } } });
            if (
              name === 'planViews' &&
              Object.keys(ele)[0] === 'collectionAmt' &&
              type(Object.values(ele)[0]) === 'Number'
            ) {
              const { planViews, exchangeRate } = newFormData;
              const tt1 = planViews
                .map(v => v.collectionAmt)
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
