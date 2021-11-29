import {
  salesInvoiceApplySaveRq,
  salesInvoiceApplyDetailRq,
} from '@/services/production/salesInvoice';
import { getInvoiceItemListRq } from '@/services/plat/recv/InvBatch';
import { detailInvInfo, selectInvInfo } from '@/services/plat/recv/Contract';
import moment from 'moment';
import { getViewConf } from '@/services/gen/flow';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';
import { getUrl } from '@/utils/flowToRouter';
import { isNil, type } from 'ramda';
import update from 'immutability-helper';

const defaultState = {
  flowForm: {
    remark: undefined,
    dirty: false,
  },
  fieldsConfig: {
    buttons: [],
    panels: {},
  },
  formMode: 'DESCRIPTION',
  formData: {
    detialList: [],
  },
  detailDelViews: [],
  pageConfig: {
    pageBlockViews: [],
  },
  invoiceItemList: [],
  selectList: [],
  attachments: [],
};
export default {
  namespace: 'collectionPlanFlow',

  state: defaultState,

  effects: {
    // 开票信息下拉列表
    *fetchAsyncSelectList({ payload }, { call, put }) {
      const { response } = yield call(selectInvInfo, payload);
      if (Array.isArray(response)) {
        yield put({
          type: 'updateState',
          payload: {
            selectList: response.map(item => ({
              ...item,
              value: item.id,
              title: item.name,
            })),
          },
        });
      }
    },

    // 发票信息下拉带出数据
    *invInfoDetail({ payload }, { call, put, select }) {
      const { response } = yield call(detailInvInfo, payload);
      const { datum } = response;
      const { deliMethod, id, ...restDatum } = datum;
      yield put({
        type: 'updateForm',
        payload: {
          ...restDatum,
          invinfoId: payload.id,
        },
      });

      return response;
    },

    // 商品信息下拉带出数据
    *getInvoiceItemList({ payload }, { call, put, select }) {
      const { response } = yield call(getInvoiceItemListRq, payload);
      if (response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            invoiceItemList: response.datum
              .map(v => ({
                ...v,
                label: v.twGoodsCodeName,
                value: v.twGoodsCode,
              }))
              .map(v => ({
                ...v,
                children: v.children.map(item => ({
                  ...item,
                  label: item.goodsName,
                  value: item.id,
                })),
              })),
          },
        });
      } else {
        createMessage({ type: 'error', description: '获取商品信息列表失败' });
      }
    },
    // 详情
    *queryDetail({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(salesInvoiceApplyDetailRq, payload);
      const { createTime, invoiceItem, attachments } = data;
      const attach = attachments.map(item => item.id);
      yield put({
        type: 'updateForm',
        payload: {
          ...data,
          createTime: moment(createTime).format('YYYY-MM-DD hh:mm:ss'),
          attach,
          invItemId:
            Array.isArray(invoiceItem) && (invoiceItem[0] && invoiceItem[1])
              ? [invoiceItem[0], Number(invoiceItem[1])]
              : [],
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

    *submit({ payload }, { call, put, select }) {
      const { ...params } = payload;

      const { data } = yield outputHandle(
        salesInvoiceApplySaveRq,
        params,
        'projectMgmtListFlow/success'
      );

      message({ type: 'success' });
      const url = getUrl().replace('edit', 'view');
      closeThenGoto(url);

      return data;
    },

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

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: response || {},
          },
        });
        return response || {};
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
      let newFormData = formData;
      if (Array.isArray(element) && !element.filter(v => type(v) !== 'Object').length) {
        element.forEach((ele, index) => {
          if (!isNil(ele)) {
            newFormData = update(formData, { [name]: { [index]: { $merge: ele } } });
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
