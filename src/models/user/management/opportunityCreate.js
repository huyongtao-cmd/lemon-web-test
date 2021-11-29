import {
  findOppoById,
  selectCust,
  selectProduct,
  update,
  create,
} from '@/services/user/management/opportunity';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { findLeadById, selectUsers, selectBus, closeLead } from '@/services/user/management/leads';
import { queryCascaderUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

const formDataModal = {
  //  ###### 客户信息 ######
  leadsNo: null, // 商机编号
  oppoName: null, // 商机名称
  saleContent: null, // 销售内容
  custRegion: null, // 客户区域
  custRegionDesc: null, // 客户区域
  oldcustFlag: 0, // 是否老客户
  custId: null, // 老客户
  custName: null, // 客户名称
  custProj: null, // 客户项目
  contactName: null, // 客户联系人
  contactPhone: null, // 联系人电话
  contactDept: null, // 客户部门
  contactPosition: null, // 客户岗位
  contactWebsite: null, // 企业主页
  custProp: null, // 客户性质
  custPropDesc: null, // 客户性质
  leadsId: null, // 关联线索
  leadsName: null, // 关联线索
  oppoStatus: null, // 商机状态
  oppoStatusDesc: null, // 商机状态
  closeReason: null, // 关闭原因
  closeReasonDesc: null, // 关闭原因
  createUserId: null, // 报备人
  createUserName: null, // 报备人
  createTime: null, // 创建日期
  //  ###### 销售信息 ######
  saleType1: null, // 销售大类
  saleType1Desc: null, // 销售大类
  saleType2: null, // 销售小类
  saleType2Desc: null, // 销售小类
  forecastWinDate: null, // 预计成单日期
  forecastAmount: null, // 预计签单金额
  probability: null, // 成单概率
  probabilityDesc: null, // 成单概率
  salePhase: null, // 销售阶段
  salePhaseDesc: null, // 销售阶段
  productIds: [], // 关联产品
  productNames: null, // 关联产品
  deliveryAddress: null, // 交付地点
  oppoLevel: null, // 商机级别
  oppoLevelDesc: null, // 商机级别
  currCode: 'CNY', // 币种
  currCodeName: null, // 币种
  //  ###### 销售信息 ######
  signBuId: null, // 签单BU
  signBuName: null, // 签单BU
  salesmanResId: null, // 销售负责人
  salesmanName: null, // 销售负责人
  deliBuId: null, // 交付BU
  deliBuName: null, // 交付BU
  deliResId: null, // 交付负责人
  deliResName: null, // 交付负责人
  coBuId: null, // 副签单BU
  coBuName: null, // 副签单BU
  coResId: null, // 副签单负责人
  coUserName: null, // 副签单负责人
  codeliBuId: null, // 副交付BU
  codeliBuName: null, // 副交付BU
  codeliResId: null, // 副交付负责人
  codeliResName: null, // 副交付负责人
  //  ###### 来源信息 ######
  sourceType: 'INTERNAL', // 来源类型
  externalIden: null, // 线索来源
  externalName: null, // 来源人
  externalPhone: null, // 来源电话
  internalBuId: null, // 线索来源BU
  internalBuName: null, // 线索来源BU
  internalResId: null, // ': '来源人
  internalResName: null, // ': '来源人
  profitDesc: null, // 利益承诺
};
export default {
  namespace: 'userOppsCreate',

  state: {
    formData: {
      ...formDataModal,
    },
    mode: 'create',
    page: 'opps',
    userList: [],
    buList: [],
    custList: [],
    prodList: [],
    saleType2Data: [],
    pageConfig: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      yield put({ type: 'clean' });
      const { response } = yield call(findOppoById, payload.id);
      const formData = { ...(response.datum || {}) };
      const productIds = formData && formData.productIds ? formData.productIds.split(',') : [];
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...formData, productIds },
          page: payload.page || 'opps',
          mode: payload.mode || 'create',
        },
      });
    },
    *leadsTransform({ payload }, { call, put }) {
      const { response } = yield call(findLeadById, payload.id);
      const formData = { ...formDataModal, ...(response.datum || {}) };
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...formData,
            id: null,
            leadsId: formData.id,
            contactName: formData.custContact,
            createTime: null,
            createUserId: null,
          },
          page: payload.page || 'opps',
          mode: payload.mode || 'create',
        },
      });
    },
    // 获得人员下拉信息
    *selectUsers(_, { call, put }) {
      const { response } = yield call(selectUsers);
      if (response) {
        yield put({
          type: 'updateState',
          payload: { userList: Array.isArray(response) ? response : [] },
        });
      }
    },
    // 获得bu下拉信息
    *selectBus(_, { call, put }) {
      const { response } = yield call(selectBus);
      if (response) {
        yield put({
          type: 'updateState',
          payload: { buList: Array.isArray(response) ? response : [] },
        });
      }
    },
    // 客户下拉
    *selectCust(_, { call, put }) {
      const { response } = yield call(selectCust);
      if (response) {
        yield put({
          type: 'updateState',
          payload: { custList: Array.isArray(response) ? response : [] },
        });
      }
    },
    // 产品下拉
    *selectProd(_, { call, put }) {
      const { response } = yield call(selectProduct);
      if (response) {
        yield put({
          type: 'updateState',
          payload: { prodList: Array.isArray(response) ? response : [] },
        });
      }
    },
    // 根据销售大类获取销售小类
    *updateSaleType2({ payload }, { call, put }) {
      const { response } = yield call(queryCascaderUdc, {
        defId: 'TSK:SALE_TYPE2',
        parentDefId: 'TSK:SALE_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { saleType2Data: Array.isArray(response) ? response : [] },
        });
      }
    },
    *save({ payload }, { put, call, select }) {
      const { formData, page } = yield select(({ userOppsCreate }) => userOppsCreate);
      formData.productIds =
        formData.productIds && formData.productIds.length ? formData.productIds.join(',') : null;
      if (formData.id) {
        // 编辑的保存方法
        const { status, response } = yield call(update, formData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response && response.ok) {
          if (response.datum.errorCode) {
            createMessage({ type: 'error', description: response.datum.errorCode });
          } else {
            createMessage({ type: 'success', description: '保存成功' });
            // closeThenGoto(`/sale/management/${page}`);
          }
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      } else {
        // 新增的保存方法
        const { status, response } = yield call(create, formData);
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (response && response.ok) {
          if (response.datum.errorCode) {
            createMessage({ type: 'error', description: response.datum.errorCode });
          } else {
            createMessage({ type: 'success', description: '保存成功' });
            // 线索转商机时，商机新建成功后，将线索状态置为关闭，关闭原因是已转商机
            if (formData.leadsId) {
              yield call(closeLead, { id: formData.leadsId, reason: '01' });
            }
            closeThenGoto(
              `/sale/management/oppsedit?id=${response.datum.id}&mode=update&tab=basic&page=opps`
            );
          }
        } else {
          createMessage({ type: 'error', description: '保存失败' });
        }
      }
    },
    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        return response;
      }
      return {};
    },
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...formDataModal },
          mode: 'create',
        },
      });
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    // 修改form表单字段内容，将数据保存到state
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
  },
};
