import { closeThenGoto } from '@/layouts/routerControl';
import {
  purchaseDetail,
  purchaseChangeDetailByChangeId,
  purchaseOverDetailByOverId,
  purchaseOverSubmit,
} from '@/services/sale/purchaseContract/purchaseContract';
import { getViewConf } from '@/services/gen/flow';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

export default {
  namespace: 'salePurchaseDetail',
  state: {
    detailData: {
      contractDetailPurchaseView: {},
      projectPurchaseView: {},
      purchaseDetailsViews: [],
      purchasePaymentPlanViews: [],
    },
    fieldsConfig: {
      taskKey: '',
    },
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    pageConfig: {},
    closeReason: '',
  },
  effects: {
    /* 获取采购合同详情 */
    *queryDetail({ payload }, { call, put, select }) {
      const { response } = yield call(purchaseDetail, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            detailData: response,
          },
        });
        if (response.purchaseType === 'CONTRACT') {
          if (response.businessType === 'SERVICES_TRADE') {
            yield put({
              type: `getPageConfig`,
              payload: {
                pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:SERVICES_TRADE',
              },
            });
          } else if (response.businessType === 'PRODUCT_TRADE') {
            yield put({
              type: `getPageConfig`,
              payload: {
                pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:PRODUCT_TRADE',
              },
            });
          } else if (response.businessType === 'CHANNEL_COST') {
            yield put({
              type: `getPageConfig`,
              payload: {
                pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:CHANNEL_COST',
              },
            });
          } else {
            yield put({
              type: `getPageConfig`,
              payload: {
                pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:CONTRACT',
              },
            });
          }
        } else if (response.purchaseType === 'MARKET') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:MARKET',
            },
          });
        } else if (response.purchaseType === 'RESEARCH') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:RESEARCH',
            },
          });
        } else if (response.purchaseType === 'ADMINISTRATIVE') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:ADMINISTRATIVE',
            },
          });
        } else if (response.purchaseType === 'MANAGEMENT') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:MANAGEMENT',
            },
          });
        } else if (response.purchaseType === 'RESOURCE') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:RESOURCE',
            },
          });
        } else if (response.purchaseType === 'OTHER_TYPES') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:OTHER_TYPES',
            },
          });
        } else {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS',
            },
          });
        }
      }
    },

    *queryChangeDetailByChangeId({ payload }, { call, put, select }) {
      const { response } = yield call(purchaseChangeDetailByChangeId, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            detailData: response.datum.purchaseContractView,
          },
        });
        if (response.datum.purchaseContractView.purchaseType === 'CONTRACT') {
          if (response.datum.purchaseContractView.businessType === 'SERVICES_TRADE') {
            yield put({
              type: `getPageConfig`,
              payload: {
                pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:SERVICES_TRADE',
              },
            });
          } else if (response.datum.purchaseContractView.businessType === 'PRODUCT_TRADE') {
            yield put({
              type: `getPageConfig`,
              payload: {
                pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:PRODUCT_TRADE',
              },
            });
          } else if (response.datum.purchaseContractView.businessType === 'CHANNEL_COST') {
            yield put({
              type: `getPageConfig`,
              payload: {
                pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:CHANNEL_COST',
              },
            });
          } else {
            yield put({
              type: `getPageConfig`,
              payload: {
                pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:CONTRACT',
              },
            });
          }
        } else if (response.datum.purchaseContractView.purchaseType === 'MARKET') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:MARKET',
            },
          });
        } else if (response.datum.purchaseContractView.purchaseType === 'RESEARCH') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:RESEARCH',
            },
          });
        } else if (response.datum.purchaseContractView.purchaseType === 'ADMINISTRATIVE') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:ADMINISTRATIVE',
            },
          });
        } else if (response.datum.purchaseContractView.purchaseType === 'MANAGEMENT') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:MANAGEMENT',
            },
          });
        } else if (response.datum.purchaseContractView.purchaseType === 'RESOURCE') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:RESOURCE',
            },
          });
        } else if (response.datum.purchaseContractView.purchaseType === 'OTHER_TYPES') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:OTHER_TYPES',
            },
          });
        } else {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS',
            },
          });
        }
      }
    },

    *queryOverDetailByOverId({ payload }, { call, put, select }) {
      const { response } = yield call(purchaseOverDetailByOverId, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            detailData: response,
            closeReason: response.newOverWhy,
          },
        });
        if (response.purchaseType === 'CONTRACT') {
          if (response.businessType === 'SERVICES_TRADE') {
            yield put({
              type: `getPageConfig`,
              payload: {
                pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:SERVICES_TRADE',
              },
            });
          } else if (response.businessType === 'PRODUCT_TRADE') {
            yield put({
              type: `getPageConfig`,
              payload: {
                pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:PRODUCT_TRADE',
              },
            });
          } else if (response.businessType === 'CHANNEL_COST') {
            yield put({
              type: `getPageConfig`,
              payload: {
                pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:CHANNEL_COST',
              },
            });
          } else {
            yield put({
              type: `getPageConfig`,
              payload: {
                pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:CONTRACT',
              },
            });
          }
        } else if (response.purchaseType === 'MARKET') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:MARKET',
            },
          });
        } else if (response.purchaseType === 'RESEARCH') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:RESEARCH',
            },
          });
        } else if (response.purchaseType === 'ADMINISTRATIVE') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:ADMINISTRATIVE',
            },
          });
        } else if (response.purchaseType === 'MANAGEMENT') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:MANAGEMENT',
            },
          });
        } else if (response.purchaseType === 'RESOURCE') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:RESOURCE',
            },
          });
        } else if (response.purchaseType === 'OTHER_TYPES') {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS:OTHER_TYPES',
            },
          });
        } else {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_DETAILS',
            },
          });
        }
      }
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
      }
    },

    *retryCloseSubmit({ payload }, { call, put, select }) {
      const { response } = yield call(purchaseOverSubmit, payload);
      if (response) {
        createMessage({ type: 'success', description: '提交成功' });
        closeThenGoto(`/user/flow/process?type=procs&refresh=${moment().valueOf()}`);
      } else {
        createMessage({ type: 'error', description: `提交失败,错误原因：${response.reason}` });
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
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    clearDetailData(state, { payload }) {
      return {
        ...state,
        detailData: {
          contractDetailPurchaseView: {},
          projectPurchaseView: {},
          purchaseDetailsViews: [],
          purchasePaymentPlanViews: [],
        },
      };
    },
  },
};
