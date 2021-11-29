import { findOppoById } from '@/services/user/management/opportunity';
import { businessPageDetailByNos, businessPageDetailByNo } from '@/services/sys/system/pageConfig';

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
  currCode: null, // 币种
  currCodeName: '人民币', // 币种
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
  namespace: 'userOppsDetail',

  state: {
    formData: {
      ...formDataModal,
    },
    mode: 'create',
    page: 'opps',
    pageConfig: {},
    basicPageConfig: {},
    categoryPageConfig: {},
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
    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...formDataModal },
          mode: 'create',
        },
      });
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
    // 获取配置字段
    *getPageConfigs({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNos, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            basicPageConfig: response.configInfos
              ? response.configInfos.BUSINESS_EDIT_BASIC_INFORMATION
              : null,
            categoryPageConfig: response.configInfos
              ? response.configInfos.BUSINESS_EDIT_CATEGORY_CODE
              : null,
          },
        });
        return response;
      }
      return {};
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
