import {
  findAddrByNo,
  saveAddrBank,
  saveAddrBasic,
  saveAddrBook,
  saveAddrCode,
  saveAddrCompany,
  saveAddrContact,
  saveAddrCust,
  saveAddrInvoice,
  saveAddrPerson,
  saveAddrCoop,
} from '@/services/plat/addr/addr';
import { selectAbOus } from '@/services/gen/list';
import { selectOus } from '@/services/plat/res/resprofile';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { queryCascaderUdc } from '@/services/gen/app';
import router from 'umi/router';

const emptyFormData = {};
const emptyListData = [];

const initialState = {
  tabkey: 'basic',
  tabModified: Array(10).fill(0), // 记录哪个tab修改过 - 这个需要放在redux中
  // 查询系列
  formData: {
    // 主数据
    ...emptyFormData,
    relateType: '',
  },
  personData: {
    // 个人
    ...emptyFormData,
  },
  ouData: {
    // 公司
    ...emptyFormData,
  },
  custData: {
    // 客户
    ...emptyFormData,
  },
  supplierData: {
    // 供应商
    ...emptyFormData,
  },
  coopData: {
    // 合作伙伴
    ...emptyFormData,
    coopPeriod: [],
    coopServiceType: [],
  },
  // 明细表
  connList: [], // 联系信息
  connListDel: [], // 联系信息 - 删除
  bankList: [], // 银行账户
  bankListDel: [], // 银行账户 - 删除
  invoiceList: [], // 开票信息
  invoiceListDel: [], // 开票信息 - 删除
  addressList: [], // 地址列表
  addressListDel: [], // 地址列表 - 删除
  // 下拉
  abOuSel: [],
  addrSel: [],
  attachments: [],
  attachments1: [],
  attachments2: [],
};

const commonRespHandler = (response, status) => {
  if (status === 100) {
    // 主动取消请求
    return null;
  }
  // console.log('commonRespHandler ? ->', response)
  if (response && response.ok) {
    createMessage({ type: 'success', description: '保存成功' });
    return response.datum;
  }
  if (response.reason) {
    createMessage({ type: 'error', description: response.reason });
    return null;
  }
  createMessage({ type: 'error', description: '保存失败' });
  return null;
};

export default {
  namespace: 'platAddrEdit',

  state: {
    ...initialState,
  },

  effects: {
    // 根据省获取市
    *handleChangeCity({ payload }, { call }) {
      const { province } = payload;
      if (!payload) {
        return [];
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'COM:CITY',
        parentDefId: 'COM:PROVINCE',
        parentVal: province,
      });
      return response;
    },
    *query({ payload }, { call, put }) {
      const { response, status } = yield call(findAddrByNo, payload);
      const { datum } = response;

      if (status === 100) {
        // 主动取消请求
        return;
      }

      if (status === 200) {
        if (response && response.ok) {
          // eslint-disable-next-line no-restricted-syntax
          for (const key in datum.addressListViews) {
            if (datum.addressListViews[key].province) {
              const getCityList = yield put({
                type: 'handleChangeCity',
                payload: {
                  province: datum.addressListViews[key].province,
                },
              });
              getCityList.then(res => {
                datum.addressListViews[key].cityList = res;
              });
            }
          }
          const { attachments = [], attachments1 = [], attachments2 = [] } = datum.coopView;
          const attache = attachments && attachments.map(item => item.id);
          const attache1 = attachments1 && attachments1.map(item => item.id);
          const attache2 = attachments2 && attachments2.map(item => item.id);
          yield put({
            type: 'updateState',
            payload: {
              formData: datum.abBasicDetailView || { relateType: '' },
              personData: datum.personDetailView || {},
              ouData: datum.ouDetailView || {},
              connList: datum.contactListViews || [], // 联系信息
              bankList: datum.accListViews || [], // 银行账户
              invoiceList: datum.invInfoListViews || [], // 开票信息
              addressList: datum.addressListViews || [], // 地址列表
              custData: datum.custView || {},
              supplierData: datum.supplierView || {},
              coopData:
                {
                  ...datum.coopView,
                  attache,
                  attache1,
                  attache2,
                  coopChargePersonRole: datum.coopView.coopChargePersonRole
                    ? datum.coopView.coopChargePersonRole.split(',')
                    : [],
                } || {},
              attachments,
              attachments1,
              attachments2,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详情失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详情失败' });
      }
    },

    // 在刷新页面之前将form表单里的数据置为空
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          ...initialState,
        },
      });
    },

    // 基础数据
    *basicSave({ payload }, { call, put, select }) {
      const { formData } = yield select(({ platAddrEdit }) => platAddrEdit);
      const preparedData = { ...formData };
      if (formData.relateType) {
        preparedData.relateType = Array.isArray(formData.relateType)
          ? formData.relateType.join(',')
          : formData.relateType;
      }
      // console.log('basicSave -> prepare to save data ->', preparedData);
      const { response, status } = yield call(saveAddrBasic, preparedData);
      if (status === 100) {
        // 主动取消请求
        return null;
      }
      // 注意！主数据保存的逻辑与其他模块不一样
      if (response && response.ok) {
        createMessage({
          type: 'success',
          description: formData.abNo ? '保存成功！您可以继续编辑其他标签页。' : '保存成功',
        });
        return response.datum;
      }
      if (response.reason) {
        createMessage({ type: 'error', description: response.reason });
        return null;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
      return null;
    },

    // 个人信息
    *personDetSave({ payload }, { call, put, select }) {
      const { personData } = yield select(({ platAddrEdit }) => platAddrEdit);
      const preparedData = { ...personData, abNo: payload.abNo };
      const { response, status } = yield call(saveAddrPerson, preparedData);
      return commonRespHandler(response, status);
    },

    // 公司信息
    *compDetSave({ payload }, { call, put, select }) {
      const { ouData } = yield select(({ platAddrEdit }) => platAddrEdit);
      const preparedData = { ...ouData, abNo: payload.abNo };
      const { response, status } = yield call(saveAddrCompany, preparedData);
      return commonRespHandler(response, status);
    },

    // 联系信息 - connList
    *connInfoSave({ payload }, { call, put, select }) {
      const { connList, connListDel } = yield select(({ platAddrEdit }) => platAddrEdit);
      if (connList.length < 1 && connListDel.length < 1) {
        createMessage({ type: 'error', description: `请新增数据,保存不能为空!` });
        return;
      }
      // 校验明细项
      const contactType = connList.filter(v => !v.contactType);
      if (contactType.length) {
        createMessage({ type: 'error', description: `请选择联系人类型` });
        return;
      }
      const contactPerson = connList.filter(v => !v.contactPerson);
      if (contactPerson.length) {
        createMessage({ type: 'error', description: `请输入联系人` });
        return;
      }
      const mobile = connList.filter(v => !v.mobile);
      if (mobile.length) {
        createMessage({ type: 'error', description: `请输入手机` });
        return;
      }
      const { response, status } = yield call(saveAddrContact, {
        abContactEntities: connList,
        ids: connListDel,
        abNo: payload.abNo,
      });
      // eslint-disable-next-line
      return commonRespHandler(response, status);
    },

    // 银行信息 - bankList
    *bankInfoSave({ payload }, { call, put, select }) {
      const { bankList, bankListDel } = yield select(({ platAddrEdit }) => platAddrEdit);
      if (bankList.length < 1 && bankListDel.length < 1) {
        createMessage({ type: 'error', description: `请新增数据,保存不能为空!` });
        return;
      }
      // 校验明细项
      const accType = bankList.filter(v => !v.accType);
      if (accType.length) {
        createMessage({ type: 'error', description: `请选择账户类型` });
        return;
      }
      const accountNo = bankList.filter(v => !v.accountNo);
      if (accountNo.length) {
        createMessage({ type: 'error', description: `请填写账户` });
        return;
      }

      const { response, status } = yield call(saveAddrBank, {
        abAccEntities: bankList,
        ids: bankListDel,
        abNo: payload.abNo,
      });
      // eslint-disable-next-line
      return commonRespHandler(response, status);
    },

    // 开票信息 - invoiceList
    *invoiceSave({ payload }, { call, put, select }) {
      const { invoiceList, invoiceListDel } = yield select(({ platAddrEdit }) => platAddrEdit);
      if (invoiceList.length < 1 && invoiceListDel.length < 1) {
        createMessage({ type: 'error', description: `请新增数据,保存不能为空!` });
        return;
      }
      // 校验明细项
      const taxRate = invoiceList.filter(v => !v.taxRate);
      // if (taxRate.length) {
      //   createMessage({ type: 'error', description: `请选择发票税率` });
      //   return;
      // }
      // const invType = invoiceList.filter(v => !v.invType);
      // if (invType.length) {
      //   createMessage({ type: 'error', description: `请选择开票类型` });
      //   return;
      // }
      const invInfo = invoiceList.filter(v => !v.invInfo);

      if (invInfo.length) {
        createMessage({ type: 'error', description: `请输入发票信息` });
        return;
      }
      const invTitle = invoiceList.filter(v => !v.invTitle);

      if (invTitle.length) {
        createMessage({ type: 'error', description: `请输入发票抬头` });
        return;
      }

      const taxNo = invoiceList.filter(v => !v.taxNo);

      if (taxNo.length) {
        createMessage({ type: 'error', description: `请输入税号` });
        return;
      }

      // const accountNo = invoiceList.filter(v => !v.accountNo);
      // if (accountNo.length) {
      //   createMessage({ type: 'error', description: `请选择币种` });
      //   return;
      // }

      const { response, status } = yield call(saveAddrInvoice, {
        abInvoiceEntities: invoiceList,
        ids: invoiceListDel,
        abNo: payload.abNo,
      });
      // eslint-disable-next-line
      return commonRespHandler(response, status);
    },

    // 地址信息 - addressList
    *addressSave({ payload }, { call, put, select }) {
      const { addressList, addressListDel } = yield select(({ platAddrEdit }) => platAddrEdit);
      if (addressList.length < 1 && addressListDel.length < 1) {
        createMessage({ type: 'error', description: `请新增数据,保存不能为空!` });
        return;
      }
      // 校验明细项
      const addressType = addressList.filter(v => !v.addressType);
      if (addressType.length) {
        createMessage({ type: 'error', description: `请选择地址类型` });
        return;
      }
      const country = addressList.filter(v => !v.country);
      if (country.length) {
        createMessage({ type: 'error', description: `请选择国家` });
        return;
      }
      const detailaddr = addressList.filter(v => !v.detailaddr);
      if (detailaddr.length || detailaddr.length > 50) {
        createMessage({ type: 'error', description: `请输入详细地址且长度不得超过50` });
        return;
      }
      const { response, status } = yield call(saveAddrBook, {
        abAddressEntities: addressList,
        ids: addressListDel,
        abNo: payload.abNo,
      });
      // eslint-disable-next-line
      return commonRespHandler(response, status);
    },

    // 类别码
    *codeSave({ payload }, { call, put, select }) {
      const { formData } = yield select(({ platAddrEdit }) => platAddrEdit);
      const preparedData = { ...formData, abNo: payload.abNo };
      // TODO: 这里因为组件数据类型不统一，只能这样写。这一块判断可以抽取出来。
      if (formData.relateType) {
        preparedData.relateType =
          preparedData.relateType instanceof Array
            ? formData.relateType.join(',')
            : preparedData.relateType;
      }
      const { response, status } = yield call(saveAddrCode, preparedData);
      return commonRespHandler(response, status);
    },

    // 客户
    *custSave({ payload }, { call, put, select }) {
      const { custData } = yield select(({ platAddrEdit }) => platAddrEdit);
      const preparedData = { ...custData, abNo: payload.abNo };
      const { response, status } = yield call(saveAddrCust, preparedData);
      return commonRespHandler(response, status);
    },

    // 供应商
    *supplySave(_, { select }) {
      const { formData } = yield select(({ platAddrEdit }) => platAddrEdit);
      createMessage({ type: 'info', description: '该模块信息由系统维护，请检查其他区域的填写。' });
    },

    // 合作伙伴
    *coopSave({ payload }, { call, put, select }) {
      const { coopData } = yield select(({ platAddrEdit }) => platAddrEdit);
      const { coopChargePersonRole, ...params } = coopData;
      coopData.coopChargePersonRole = coopChargePersonRole.join(',');

      const coopPeriod = Array.isArray(coopData.coopPeriod) ? coopData.coopPeriod : [];
      const [coopPeriodFrom = '', coopPeriodTo = ''] = coopPeriod;
      const preparedData = {
        ...coopData,
        abNo: payload.abNo,
        coopPeriodFrom,
        coopPeriodTo,
      };

      const { response, status } = yield call(saveAddrCoop, preparedData);
      if (status === 100) {
        // 主动取消请求
        return null;
      }
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          return response.datum.abNo;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        return null;
      }
      createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      return null;
    },

    // -------- 数据查询 --------
    *queryAbOuSel(_, { call, put }) {
      const { response } = yield call(selectAbOus);
      yield put({
        type: 'updateState',
        payload: {
          abOuSel: Array.isArray(response) ? response : [],
        },
      });
    },

    // -------- 数据查询 --------
    *queryAddrSel(_, { call, put }) {
      const { response } = yield call(selectOus);
      yield put({
        type: 'updateState',
        payload: {
          addrSel: Array.isArray(response) ? response : [],
        },
      });
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clearForm(state, { payload }) {
      return {
        ...state,
        ...initialState,
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
