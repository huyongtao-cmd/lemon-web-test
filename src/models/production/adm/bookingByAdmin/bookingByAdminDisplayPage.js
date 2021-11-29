// 产品化引用
import message from '@/components/production/layout/Message';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import { commonModelReducers } from '@/utils/production/modelUtils';
// service方法
import { customSelectionListByKey, systemSelectionListByKey } from '@/services/production/system';
import { isNil } from 'ramda';
import update from 'immutability-helper';
import { getViewConf } from '@/services/gen/flow';
import {
  othersTripExpenseData,
  tripExpenseDetailListAllData,
  tripManagementCreateUri,
  tripManagementDetail,
  tripManagementModify,
  tripManagementOverallModify,
  tripManagementPerson,
} from '../../../../services/production/adm/trip/tripApply';

// 默认状态
const defaultState = {
  formData: {
    submit: false, // 是否执行提交审批流程
    tripExpenseDataList: [],
  },
  // 页面菜单传递参数 tripApplyId, id, copy, mode, taskId
  tripApplyId: '',
  tripNo: '',
  id: '',
  chargeCompany: '',
  copy: false, // 复制标志
  formMode: 'EDIT', // 模式类型
  taskId: undefined,
  // 业务需要的数据对象，根据需要进行定义
  budgetDescList: [], // 预算查询列表
  expenseClaimSiteList: [], // 费用结算方下拉列表
  budgetTypeList: [], // 预算归属类型
  submitState: false,
  deleteKeys: [], // 删除字段keys
  businessAccItemList: [],
  unExpandedRowKeys: [],

  //行政订票和原订票号
  tripExpenseNoList: [],
  otherTicketNoList: [],
  //同一出差下其他订票明细
  otherTripExpenseList: [],
  //出差人信息
  tripExpensePersonList: [],
  //相关费用明细
  detailList: [],

  bookStatus: 'CREATE',
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
  namespace: 'bookingByAdminDisplayPage',

  state: defaultState,

  // 异步方法
  effects: {
    *init({ payload }, { put, select }) {
      // 定义数据参数
      const {
        formData: { id },
        copy = false,
      } = yield select(({ bookingByAdminDisplayPage }) => bookingByAdminDisplayPage);
      if (!id) {
        return;
      }
      // 查询行政订票明细
      const { data } = yield outputHandle(tripManagementDetail, { id });

      // 当为复制时,处理id为null
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      const { attachments = [] } = data;
      const attachment = attachments.map(item => item.id);
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...data, ...copyObj, attachment },
          attachments,
        },
      });
      //出差人信息
      const tripData = yield outputHandle(tripManagementPerson, { id });
      const list = tripData.data.rows;
      yield put({
        type: 'updateState',
        payload: {
          tripExpensePersonList: list,
        },
      });
      //相关费用明细
      const tripApplyIdObject = {};
      tripApplyIdObject.tripApplyId = data.tripApplyId;
      yield put({ type: 'fetchTripExpenseData', payload: tripApplyIdObject });

      //同一出差下其他订票明细
      const tripApplyIdPayload = {};
      tripApplyIdPayload.tripApplyId = data.tripApplyId;
      const ticketNoArr = [];
      const tripExpenseIdArr = [];
      data.tripExpenseDataList.forEach(e => {
        tripExpenseIdArr.push(e.id);
        ticketNoArr.push(e.ticketNo);
      });
      tripApplyIdPayload.ticketNoArr = ticketNoArr;
      tripApplyIdPayload.tripExpenseIdArr = tripExpenseIdArr;
      yield put({ type: 'fetchOthersTripExpenseData', payload: tripApplyIdPayload });
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

    *update({ payload }, { put, select }) {
      const { formData } = payload;
      // 更新
      yield outputHandle(tripManagementModify, formData);
    },

    *save({ payload }, { put, select }) {
      const { formData } = payload;
      const { id, process } = formData;
      let output;
      if (id && id > 0) {
        // 编辑
        output = yield outputHandle(
          tripManagementOverallModify,
          formData,
          'bookingByAdminDisplayPage/success'
        );
      } else {
        // 新增
        output = yield outputHandle(
          tripManagementCreateUri,
          formData,
          'bookingByAdminDisplayPage/success'
        );
      }
      yield put({ type: 'success', payload: output });

      yield put({
        type: 'updateState',
        payload: {
          submitState: false,
        },
      });
    },

    /**
     * 获取费用归属类型
     * @param payload
     * @param put
     * @param select
     * @returns {Generator<*, void, *>}
     */
    *fetchBudgetType({ payload }, { put, select }) {
      const output = yield outputHandle(customSelectionListByKey, {
        key: 'CUS:CHARGE_CLASSIFICATION',
      });
      const list = output.data.map(item => ({
        ...item,
        value: item.selectionValue,
        label: item.selectionName,
      }));
      yield put({
        type: 'updateState',
        payload: {
          budgetTypeList: list,
        },
      });
    },
    /**
     * 获取结算方列表
     * @param payload
     * @param put
     * @param select
     * @returns {Generator<*, void, *>}
     */
    *fetchExpenseClaimSiteList({ payload }, { put, select }) {
      const output = yield outputHandle(systemSelectionListByKey, {
        key: 'ADM:EXPENSE_CLAIM_SITE',
      });
      const list = output.data.map(item => ({
        ...item,
        value: item.selectionValue,
        label: item.selectionName,
      }));
      yield put({
        type: 'updateState',
        payload: {
          expenseClaimSiteList: list,
        },
      });
    },

    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      const { taskKey } = response;
      let formMode;
      if (taskKey === 'ADM_M06_01_SUBMIT_i') {
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
    /**
     * 查询出差费用明细列表 & 定制相关费用明细下拉
     * @returns {*}
     */
    *fetchTripExpenseData({ payload }, { put, select }) {
      const output = yield outputHandle(tripExpenseDetailListAllData, payload);
      const data = output.data.rows.filter(e => e.expenseClaimSite === 'BY_ADMIN');
      //定制相关费用明细下拉
      let list = [];
      list = data.filter(e => e.expenseClaimSite === 'BY_ADMIN').map(item => ({
        ...item,
        value: item.id,
        title: item.tripExpenseNo,
      }));

      yield put({
        type: 'updateState',
        payload: {
          detailList: data,
          tripExpenseNoList: list,
        },
      });
    },
    /**
     * 同一出差下其他订票明细
     * @returns {*}
     */
    *fetchOthersTripExpenseData({ payload }, { put, select }) {
      // const { tripApplyIdPayload } = payload;
      const output = yield outputHandle(othersTripExpenseData, { ...payload });
      const data = output.data.rows;
      //定制原订票号下拉
      let list = [];
      list = data.map(item => ({
        ...item,
        value: item.id,
        title: item.ticketNo,
      }));
      yield put({
        type: 'updateState',
        payload: {
          otherTripExpenseList: data,
          otherTicketNoList: list,
        },
      });
    },
    /**
     * 获取核算项目
     * @param payload
     * @param put
     * @param select
     * @returns {IterableIterator<Promise<OutputProps | OutputProps>|*>}
     */
    // *fetchBusinessAccItem({ payload }, { put, select }) {
    //   const output = yield outputHandle(businessAccItemPaging, payload, undefined, false);
    //
    //   let list = [];
    //
    //   if (output.ok) {
    //     list = output.data.rows
    //       .sort((d1, d2) => d1.busAccItemCode.localeCompare(d2.busAccItemCode))
    //       .map(item => ({
    //         ...item,
    //         id: item.busAccItemId,
    //         value: item.busAccItemId,
    //         title: item.busAccItemName,
    //         parentId: item.parentId + '',
    //       }));
    //   }
    //
    //   yield put({
    //     type: 'updateState',
    //     payload: {
    //       businessAccItemList: list,
    //     },
    //   });
    // },
  },

  // 同步方法
  reducers: {
    // 使用工具方法快速写updateState,updateForm,cleanState 方法
    ...commonModelReducers(defaultState),
    updateFormForEditTable(state, { payload }) {
      const { formData } = state;
      const name = Object.keys(payload)[0];
      const element = payload[name];
      let newFormData;
      if (Array.isArray(element) && name === 'tripExpenseDataList') {
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
