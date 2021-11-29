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
import { fromQs } from '@/utils/production/stringUtil';

const defaultState = {
  formData: {
    batchStatus: 'CREATE',
    createTime: moment().format('YYYY-MM-DD hh:mm:ss'),
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  invoiceItemList: [],
  selectList: [],
  attachments: [],
};
export default {
  namespace: 'collectionPlanEdit',

  state: defaultState,

  effects: {
    // 编保存加提交
    *salesInvoiceApplySave({ payload }, { call, put, select }) {
      const { ...params } = payload;

      let data = {};
      const { data: datum } = yield outputHandle(
        salesInvoiceApplySaveRq,
        params,
        'collectionPlanEdit/success'
      );
      data = datum;
      message({ type: 'success' });

      // 提交操作跳转到我提交的流程
      if (params.submit) {
        closeThenGoto(`/user/flow/process?type=procs`);
        return {};
      }

      if (data.id) {
        const { invId } = fromQs();
        const { id } = data;
        // 新增操作而且成功了
        if (!invId) {
          router.push(`/workTable/sale/collectionPlan/edit?id=${id}&invId=${id}&mode=EDIT`);
          return {};
        }

        // 修改操作而且成功了
        if (invId) {
          yield put({
            type: 'salesInvoiceApplyDetail',
            payload: {
              id,
            },
          });
          return {};
        }
        return {};
      }

      // 后端未返回主键ID
      createMessage({ type: 'error', description: '操作失败' });
      return {};
    },
    // 开票表详情
    *salesInvoiceApplyDetail({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(salesInvoiceApplyDetailRq, payload);
      const { createTime, invoiceItem, ...restData } = data;
      const { attachments = [] } = data;
      const attach = attachments.map(item => item.id);
      yield put({
        type: 'updateForm',
        payload: {
          ...restData,
          createTime: createTime ? moment(createTime).format('YYYY-MM-DD hh:mm:ss') : null,
          attach,
          invItemId:
            Array.isArray(invoiceItem) && (invoiceItem[0] || invoiceItem[1])
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
        ...restData
      } = data;
      yield put({
        type: 'updateForm',
        payload: {
          ...restData,
          createTime: createTime
            ? moment(createTime).format('YYYY-MM-DD hh:mm:ss')
            : moment().format('YYYY-MM-DD hh:mm:ss'),
          batchStatus: batchStatus || 'CREATE',
          invAmt: collectionAmt,
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
