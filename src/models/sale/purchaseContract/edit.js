import { closeThenGoto } from '@/layouts/routerControl';
import { linkagePurchaseSupplier, linkagePurchaseBu } from '@/services/user/Contract/sales';
import { getContractFlowNo } from '@/pages/sale/purchaseContract/constConfig';
import {
  purchaseSave,
  purchaseSubmit,
  purchaseEdit,
  purchaseChangeBypurchaseId,
  purchaseChangeBypurChangeId,
  purchaseChangeSubmit,
  purchaseOverByOverId,
  purchaseOverSubmit,
  purchaseContractMilestone,
  purchaseContractNode,
  selectOuByOuId,
  selectPackage,
  selectProjectByTaskId,
} from '@/services/sale/purchaseContract/purchaseContract';
import { procurDemandDetailRq } from '@/services/user/Contract/purchaseDemandDeal';
import { channelCostConDetailRq, subDetailRq } from '@/services/user/Contract/ChannelFee';
import {
  selectAbOus,
  selectAllAbOu,
  selectUsersWithBu,
  getProductClass,
} from '@/services/gen/list';
import { selectUsers } from '@/services/sys/user';
import { selectBus } from '@/services/org/bu/bu';
import { launchFlowFn } from '@/services/sys/flowHandle';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { queryUserPrincipal } from '@/services/gen/user';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import moment from 'moment';
import { add, genFakeId, mul } from '@/utils/mathUtils';
import { flatten } from '@/utils/arrayUtils';

const defaultFormData = {
  contractNo: null,
  contractName: null,
  platType: 'INTERNAL',
  purchaseType: null,
  businessType: 'BUSINESS_EMPTY',
  acceptanceType: null,
  purchaseLegalName: null,
  purchaseLegalNo: null,
  purchaseBuId: null,
  purchaseInchargeResId: null,
  purchaseInchargeResName: null,
  supplierLegalName: null,
  supplierLegalNo: null,
  signDate: moment().format('YYYY-MM-DD'),
  applicationDate: moment().format('YYYY-MM-DD'),
  currCode: 'CNY',
  amt: null,
  taxRate: null,
  taxAmt: null,
  remark: null,
  relatedSalesContract: null,
  relatedSalesContractName: null,
  relatedAgreement: null,
  demandNo: null,
  relatedProjectId: null,
  relatedProjectName: null,
  relatedTask: null,
  invoice: null,
  invoiceName: null,
  payMethod: null,
  createUserId: null,
  createTime: null,
  contractStatus: null,
  contractSource: null,
  contractSourceNo: null,
  activateDate: null,
  overWhy: null,
  overTime: null,
  preDocResId: null,
};

export default {
  namespace: 'salePurchaseEdit',
  state: {
    formData: defaultFormData,
    originalFormData: {},
    paymentList: [],
    purchaseList: [],
    originalPaymentList: [],
    originalPurchaseList: [],
    paymentDeletedKeys: [],
    purchaseDeleteKeys: [],
    invoiceArr: [],
    taskArr: [],
    productClassrArr: [],
    milestoneArr: [],
    contractNodeArr: [],
    purchaseLegalArr: [],
    purchaseBuArr: [],
    purchaseInchargeResArr: [],
    abOusArr: [],
    allAbOusArr: [],
    projectArr: [],
    user: {},
    pageConfig: {},
  },
  effects: {
    *sceneCommon({ payload }, { call, put, all }) {
      if (payload.purchaseType === 'CONTRACT') {
        if (payload.businessType) {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: `PURCHASE_CONTRACT_MANAGEMENT_SAVE:${payload.businessType}`,
            },
          });
        } else {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:CONTRACT',
            },
          });
        }
      } else if (payload.purchaseType === 'PROJECT') {
        if (payload.businessType) {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: `PURCHASE_CONTRACT_MANAGEMENT_SAVE:${payload.businessType}`,
            },
          });
        } else {
          yield put({
            type: `getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:PROJECT',
            },
          });
        }
      } else if (payload.purchaseType) {
        yield put({
          type: `getPageConfig`,
          payload: {
            pageNo: `PURCHASE_CONTRACT_MANAGEMENT_SAVE:${payload.purchaseType}`,
          },
        });
      } else {
        yield put({
          type: `getPageConfig`,
          payload: {
            pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE',
          },
        });
      }
      if (payload.relatedTask && payload.acceptanceType) {
        yield put({
          type: 'selectMileStone',
          payload: {
            taskId: payload.relatedTask,
            acceptanceType: payload.acceptanceType,
          },
        });
      }
      if (payload.relatedSalesContract) {
        yield put({
          type: 'selectContractNode',
          payload: {
            contractId: payload.relatedSalesContract,
          },
        });
      }
    },

    // ??????????????? - ???????????????????????????????????????
    *subDetail({ payload }, { call, put }) {
      const { contractId, ...newPayload } = payload;
      const { status, response } = yield call(subDetailRq, { contractId });
      if (status === 100) {
        // ??????????????????
        return;
      }
      if (response && response.ok) {
        const { datum = {} } = response;

        yield put({
          type: 'updateForm',
          payload: {
            platType: 'EXTERNAL',
            purchaseType: 'PROJECT', // ?????????????????? - ????????????
            businessType: fromQs().businessType, // ????????????
            purchaseLegalName: datum.mainContractName, // ????????????
            purchaseLegalId: datum.mainContractOuId, // ??????ID
            purchaseLegalNo: datum.mainContractAbNo, // ?????????
            signDate: moment().format('YYYY-MM-DD'), // ????????????
            applicationDate: moment().format('YYYY-MM-DD'), // ????????????
            currCode: 'CNY', // ??????
            relatedSalesContractName: datum.contarctName, // ??????????????????
            relatedSalesContractId: datum.id, // ????????????ID
            relatedSalesContract: datum.id, // ????????????ID????????????????????????????????????
            relatedProjectName: datum.projName, // ????????????
            relatedProjectId: datum.projId, // ??????ID
            // purchaseBuId: extInfo.baseBuId, // ??????BUId
            // purchaseBuName: extInfo.baseBuName, // ??????BUName
            // purchaseInchargeResId: extInfo.resId, // ???????????????Id
            // purchaseInchargeResName: extInfo.resName, // ?????????????????????
            ...newPayload,
          },
        });
      } else {
        createMessage({
          type: 'error',
          description: response.reason || '???????????????????????????????????????',
        });
      }
    },
    // ?????????????????????????????????????????????????????????
    *queryChannelDetails({ payload }, { call, put }) {
      const { status, response } = yield call(channelCostConDetailRq, payload);
      if (status === 100) {
        // ??????????????????
        return;
      }
      if (response && response.ok) {
        const { channelCostConDEntities, ...newFormData } = response.datum;
        const tt = flatten(channelCostConDEntities.map(v => v.children)).filter(v => v);

        const selectedTT = tt.filter(v =>
          fromQs()
            .selectedSortNo.split(',')
            .includes(v.sortNo)
        );

        yield put({
          type: 'updateState',
          payload: {
            paymentList: selectedTT.map(v => ({
              ...v,
              paymentAmt: v.amt,
              contractNode: v.receivingNode,
              paymentStage: `${v.receivingNodeName || ''}??????`,
              channelCostConId: v.id,
              purchaseType: 'CONTRACT',
              id: genFakeId(-1),
            })),
            purchaseList: selectedTT.map(v => ({
              ...v,
              relatedProductId: 38,
              relatedProductName: '?????????????????????',
              classId: 128,
              classIdName: '????????????',
              // subClassId: v.subClassId,
              // subClassIdName: v.subClassName,
              quantity: 1, // ???????????????1
              taxPrice: v.netPay, // ??????--> ????????????
              // taxRate: v.taxRate, // ??????
              taxAmt: v.netPay, // ???????????? --> ????????????
              taxNotAmt: v.amt, // ??????????????? --> ???????????????
              channelCostConId: v.id,
              note: `${v.channelCostRem || ''}???${v.workTypeName || ''}????????????`,
              purchaseType: 'CONTRACT',
              id: genFakeId(-1),
            })),
          },
        });
        const ttLen = selectedTT.map(v => v.taxRate).sort((x, y) => (x - y > 0 ? 1 : -1));
        yield put({
          type: 'updateForm',
          payload: {
            // ...newFormData,
            // amt: newFormData.demandTotalAmo,
            // businessType: newFormData.demandType,
            relatedSalesContractName: newFormData.contractName, // ????????????????????????
            relatedSalesContract: newFormData.contractId, // ??????????????????id
            // demandNo: newFormData.demandNo, // ????????????
            relatedProjectName: newFormData.custProj,
            relatedProjectId: newFormData.projectId,
            currCode: 'CNY', // ?????????????????????
            taxRate:
              // eslint-disable-next-line no-nested-ternary
              ttLen.length === 1
                ? `${ttLen[0]}%`
                : ttLen.length === 2
                  ? `${ttLen.join('%~')}%`
                  : `${ttLen[0]}%~${ttLen[ttLen.length - 1]}%`, // ??????
            taxAmt: selectedTT.map(v => v.taxCost).reduce((x, y) => add(x || 0, y || 0)), // ??????
            amt: selectedTT.map(v => v.netPay).reduce((x, y) => add(x || 0, y || 0)),
            purchaseType: 'CONTRACT',
            // contractName: `${newFormData.contractName || ''}??????????????????`, // [????????????].[??????????????????]+????????????????????????
            // ???????????????
            purchaseInchargeResId: Number(newFormData.salesmanResId), // [????????????].???????????????
            // ?????????
            // supplierLegalName: tt[0]?.supplierName, // ???????????????  [????????????].????????????.???????????????
            // supplierLegalNo: tt[0]?.legalAbNo, // ??????????????????  [????????????].????????????.???????????????

            // ????????????
            purchaseLegalName: newFormData.ouName, // [????????????].??????BU[BU?????????].????????????
            purchaseLegalId: newFormData.ouId, // [????????????].??????BU[BU?????????].????????????
            purchaseLegalNo: newFormData.abNo, // [????????????].??????BU[BU?????????].????????????

            // ??????BU
            purchaseBuId: newFormData.signBuId, // [????????????].??????BU
            purchaseBuName: newFormData.signBuName, // [????????????].??????BU

            // invoice: tt[0]?.supplierId, // ?????????
          },
        });

        yield put({
          type: `getPageConfig`,
          payload: {
            pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:CONTRACT',
          },
        });
      } else {
        createMessage({
          type: 'error',
          description: response.reason || '???????????????????????????????????????',
        });
      }
    },
    // ??????????????????????????????
    *querySubDetails({ payload }, { call, put }) {
      const { status, response } = yield call(procurDemandDetailRq, payload);
      if (status === 100) {
        // ??????????????????
        return;
      }
      if (response && response.ok) {
        const { procurDemandDViews, ...newFormData } = response.datum;
        const selectedProcurDemandDViews = procurDemandDViews.filter(v =>
          fromQs()
            .selectedSortNo.split(',')
            .includes(v.sortNo)
        );
        yield put({
          type: 'updateState',
          payload: {
            purchaseList: selectedProcurDemandDViews.map(v => ({
              ...v,
              relatedProductId: v.buProdId,
              relatedProductName: v.buProdName,
              classId: v.classId,
              classIdName: v.className,
              subClassId: v.subClassId,
              subClassIdName: v.subClassName,
              quantity: v.demandNum,
              // taxPrice: v.taxPrice, // ??????
              // taxRate: v.taxRate, // ??????
              // taxAmt: v.taxAmt, // ????????????
              taxNotAmt: v.taxNotamt, // ???????????????
              procurDemandId: v.id,
              note: v.demandSaid,
              purchaseType: 'CONTRACT',
              id: genFakeId(-1),
            })),
          },
        });
        const procurDemandDViewsLen = selectedProcurDemandDViews
          .map(v => v.taxRate)
          .sort((x, y) => (x - y > 0 ? 1 : -1));
        yield put({
          type: 'updateForm',
          payload: {
            // ...newFormData,
            // amt: newFormData.demandTotalAmo,
            businessType: newFormData.demandType,
            relatedSalesContractName: newFormData.contractName, // ????????????????????????
            relatedSalesContract: newFormData.contractId, // ??????????????????id
            demandNo: newFormData.demandNo, // ????????????
            relatedProjectName: newFormData.custProj,
            relatedProjectId: newFormData.projectId,
            taxRate:
              // eslint-disable-next-line no-nested-ternary
              procurDemandDViewsLen.length === 1
                ? `${procurDemandDViewsLen[0]}%`
                : procurDemandDViewsLen.length === 2
                  ? `${procurDemandDViewsLen.join('%~')}%`
                  : `${procurDemandDViewsLen[0]}%~${
                      procurDemandDViewsLen[procurDemandDViewsLen.length - 1]
                    }%`, // ??????
            taxAmt: selectedProcurDemandDViews
              .map(v => mul(v.taxAmt, v.taxRate))
              .reduce((x, y) => add(x || 0, y || 0)), // ??????
            amt: selectedProcurDemandDViews
              .map(v => v.taxAmt)
              .reduce((x, y) => add(x || 0, y || 0)),
            purchaseType: 'CONTRACT',
            // contractName: `${selectedProcurDemandDViews[0]?.supplierName}??????`, // [????????????].[??????????????????]+[????????????].?????????????????????+" ??????"
            // ???????????????
            purchaseInchargeResId: newFormData.edemandResId, // [????????????].???????????????
            // ?????????
            supplierLegalName: selectedProcurDemandDViews[0]?.supplierName, // ???????????????  [????????????].????????????.???????????????
            supplierLegalNo: selectedProcurDemandDViews[0]?.legalAbNo, // ??????????????????  [????????????].????????????.???????????????

            // ????????????
            purchaseLegalName: newFormData.ouName, // ????????????  [????????????].??????BU[BU?????????].????????????
            purchaseLegalId: newFormData.ouId, // ????????????  [????????????].??????BU[BU?????????].????????????
            purchaseLegalNo: newFormData.legalAbNo, // ?????????????????????  [????????????].??????BU[BU?????????].????????????

            // ??????BU
            purchaseBuId: newFormData.signBuId, // ??????BU [????????????].??????BU
            purchaseBuName: newFormData.signBuName, // ??????BU [????????????].??????BU

            currCode: selectedProcurDemandDViews[0]?.symbol, // ????????????
            invoice: selectedProcurDemandDViews[0]?.supplierId, // ?????????
          },
        });

        yield put({
          type: `getPageConfig`,
          payload: {
            pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:CONTRACT',
          },
        });
      } else {
        createMessage({
          type: 'error',
          description: response.reason || '??????????????????????????????',
        });
      }
    },
    /* ???????????????????????? */
    *queryEdit({ payload }, { call, put, all }) {
      const { response } = yield call(purchaseEdit, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
            originalFormData: response,
            paymentList: Array.isArray(response.purchasePaymentPlanViews)
              ? response.purchasePaymentPlanViews
              : [],
            purchaseList: Array.isArray(response.purchaseDetailsViews)
              ? response.purchaseDetailsViews
              : [],
            originalPaymentList: Array.isArray(response.purchasePaymentPlanViews)
              ? response.purchasePaymentPlanViews
              : [],
            originalPurchaseList: Array.isArray(response.purchaseDetailsViews)
              ? response.purchaseDetailsViews
              : [],
          },
        });
        // ?????????????????????????????????
        yield put({
          type: 'sceneCommon',
          payload: response,
        });
      }
    },

    /* ???????????????????????????????????????id */
    *queryChangeByPurchaseId({ payload }, { call, put, all }) {
      const { response } = yield call(purchaseChangeBypurchaseId, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum.purchaseContractView,
            originalFormData: response.datum.oldPurchaseContractView,
            paymentList: Array.isArray(response.datum.purchaseContractView.purchasePaymentPlanViews)
              ? response.datum.purchaseContractView.purchasePaymentPlanViews
              : [],
            purchaseList: Array.isArray(response.datum.purchaseContractView.purchaseDetailsViews)
              ? response.datum.purchaseContractView.purchaseDetailsViews
              : [],
            originalPaymentList: Array.isArray(
              response.datum.oldPurchaseContractView.purchasePaymentPlanViews
            )
              ? response.datum.oldPurchaseContractView.purchasePaymentPlanViews
              : [],
            originalPurchaseList: Array.isArray(
              response.datum.oldPurchaseContractView.purchaseDetailsViews
            )
              ? response.datum.oldPurchaseContractView.purchaseDetailsViews
              : [],
          },
        });
        // ?????????????????????????????????
        yield put({
          type: 'sceneCommon',
          payload: response?.datum?.purchaseContractView || {},
        });
      }
    },

    /* ?????????????????????????????????????????????id */
    *queryChangeByChangeId({ payload }, { call, put, all }) {
      const { response } = yield call(purchaseChangeBypurChangeId, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response.datum.purchaseContractView,
            originalFormData: response.datum.oldPurchaseContractView,
            paymentList: Array.isArray(response.datum.purchaseContractView.purchasePaymentPlanViews)
              ? response.datum.purchaseContractView.purchasePaymentPlanViews
              : [],
            purchaseList: Array.isArray(response.datum.purchaseContractView.purchaseDetailsViews)
              ? response.datum.purchaseContractView.purchaseDetailsViews
              : [],
            originalPaymentList: Array.isArray(
              response.datum.oldPurchaseContractView.purchasePaymentPlanViews
            )
              ? response.datum.oldPurchaseContractView.purchasePaymentPlanViews
              : [],
            originalPurchaseList: Array.isArray(
              response.datum.oldPurchaseContractView.purchaseDetailsViews
            )
              ? response.datum.oldPurchaseContractView.purchaseDetailsViews
              : [],
          },
        });

        // ?????????????????????????????????
        yield put({
          type: 'sceneCommon',
          payload: response?.datum?.purchaseContractView || {},
        });
      }
    },

    *queryOverByOverId({ payload }, { call, put, all }) {
      const { response } = yield call(purchaseOverByOverId, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            formData: response,
            originalFormData: response,
            paymentList: Array.isArray(response.purchasePaymentPlanViews)
              ? response.purchasePaymentPlanViews
              : [],
            purchaseList: Array.isArray(response.purchaseDetailsViews)
              ? response.purchaseDetailsViews
              : [],
            originalPaymentList: Array.isArray(response.purchasePaymentPlanViews)
              ? response.purchasePaymentPlanViews
              : [],
            originalPurchaseList: Array.isArray(response.purchaseDetailsViews)
              ? response.purchaseDetailsViews
              : [],
          },
        });

        // ?????????????????????????????????
        yield put({
          type: 'sceneCommon',
          payload: response || {},
        });
      }
    },

    *save({ payload }, { call, put, select }) {
      const { response } = yield call(purchaseSave, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '????????????' });
        closeThenGoto(`/sale/purchaseContract/List?refresh=${moment().valueOf()}`);
        // yield put({
        //   type: 'queryEdit',
        //   payload: response.datum.id,
        // });
      } else {
        createMessage({
          type: 'error',
          description: `????????????,???????????????${response.reason}` || '????????????',
        });
      }
    },

    *submit({ payload }, { call, put, select }) {
      const { response } = yield call(purchaseSubmit, payload);
      if (response && response.ok) {
        // payload.purchaseType === 'CONTRACT' ? (defkey = 'TSK_S06') : (defkey = 'TSK_S07');

        // switch (payload.businessType) {
        //   case 'RENT': {
        //     // ????????????

        //     defkey = 'TSK_S12';
        //     break;
        //   }
        //   case 'SUNDRY': {
        //     // ????????????

        //     defkey = 'TSK_S13';
        //     break;
        //   }

        //   default:
        //     break;
        // }

        // ?????????????????????Key
        const { purchaseType, businessType } = payload;
        const defkey = getContractFlowNo(purchaseType, businessType);
        console.warn(purchaseType + '-' + businessType, '???????????????Key:', defkey);

        if (defkey) {
          // ????????????????????????
          const { response: responseFlow } = yield call(launchFlowFn, {
            defkey,
            value: {
              id: response.datum.id,
            },
          });
          if (responseFlow && responseFlow.ok) {
            createMessage({ type: 'success', description: '????????????' });
            closeThenGoto(`/user/flow/process?type=procs&refresh=${moment().valueOf()}`);
          } else {
            createMessage({
              type: 'error',
              description: `??????????????????????????????${responseFlow.reason}`,
            });
          }
        } else {
          createMessage({
            type: 'error',
            description: `???????????????????????????????????????????????????Key???`,
          });
        }
      } else {
        createMessage({ type: 'error', description: `??????????????????????????????${response.reason}` });
      }
    },

    *retrySubmit({ payload }, { call, put, select }) {
      const { response } = yield call(purchaseSubmit, payload);
      if (response) {
        createMessage({ type: 'success', description: '????????????' });
        closeThenGoto(`/user/flow/process?type=procs&refresh=${moment().valueOf()}`);
      } else {
        createMessage({ type: 'error', description: `??????????????????????????????${response.reason}` });
      }
    },

    *changeSubmit({ payload }, { call, put, select }) {
      let defkey = '';
      const { response } = yield call(purchaseChangeSubmit, payload);
      if (response && response.ok) {
        payload.purchaseContractView.purchaseType === 'CONTRACT'
          ? (defkey = 'TSK_S08')
          : (defkey = 'TSK_S10');
        const { response: responseFlow } = yield call(launchFlowFn, {
          defkey,
          value: {
            id: response.datum.changeFormData.id,
          },
        });
        if (responseFlow && responseFlow.ok) {
          createMessage({ type: 'success', description: '????????????' });
          closeThenGoto(`/user/flow/process?type=procs&refresh=${moment().valueOf()}`);
        } else {
          createMessage({
            type: 'error',
            description: `????????????,???????????????${responseFlow.reason}`,
          });
        }
      } else {
        createMessage({ type: 'error', description: `????????????,???????????????${response.reason}` });
      }
    },

    *retrychangeSubmit({ payload }, { call, put, select }) {
      const { response } = yield call(purchaseChangeSubmit, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '????????????' });
        closeThenGoto(`/user/flow/process?type=procs&refresh=${moment().valueOf()}`);
      } else {
        createMessage({ type: 'error', description: `????????????,???????????????${response.reason}` });
      }
    },

    *linkageBu({ payload }, { call, put, select }) {
      const { status, response } = yield call(linkagePurchaseBu, payload);
      const res = response.datum || {};
      return res;
    },

    *linkageSupplier({ payload }, { call, put }) {
      const { response } = yield call(linkagePurchaseSupplier, payload);
      const res = response.datum || {};
      if (response.ok) {
        if (res.buId) {
          yield put({
            type: 'updateForm',
            payload: {
              supplierLegalNo: res.supplierLegalNo,
              supplierLegalName: res.supplierLegalName,
            },
          });
        }
        yield put({
          type: 'updateForm',
          payload: {
            supplierId: payload,
            supplierBuId: res.buId,
          },
        });
      }
      return res;
    },

    *selectAbOus({ payload }, { call, put }) {
      const { response } = yield call(selectAbOus, payload);
      yield put({
        type: 'updateState',
        payload: {
          abOusArr: response || [],
        },
      });
    },

    *selectAllAbOu({ payload }, { call, put }) {
      const { response } = yield call(selectAllAbOu, payload);
      yield put({
        type: 'updateState',
        payload: {
          allAbOusArr: response || [],
        },
      });
    },

    *selectUsers({ payload }, { call, put }) {
      const { response } = yield call(selectUsersWithBu, payload);
      yield put({
        type: 'updateState',
        payload: {
          purchaseInchargeResArr: response || [],
        },
      });
    },

    *selectBus({ payload }, { call, put }) {
      const { response } = yield call(selectBus, payload);
      yield put({
        type: 'updateState',
        payload: {
          purchaseBuArr: response || [],
        },
      });
    },

    // *selectProject({ payload }, { call, put }) {
    //   const { response } = yield call(selectProject, payload);
    //   yield put({
    //     type: 'updateState',
    //     payload: {
    //       projectArr: response || [],
    //     },
    //   });
    // },

    // *selectTask({ payload }, { call, put }) {
    //   const { response } = yield call(selectTaskByProjIds, payload);
    //   yield put({
    //     type: 'updateState',
    //     payload: {
    //       taskArr: response || [],
    //     },
    //   });
    // },

    *selectPackage({ payload }, { call, put }) {
      const { response } = yield call(selectPackage, payload);
      yield put({
        type: 'updateState',
        payload: {
          taskArr: response || [],
        },
      });
    },

    *selectProjectByTaskId({ payload }, { call, put }) {
      const { response } = yield call(selectProjectByTaskId, payload);
      return response;
    },

    *selectMileStone({ payload }, { call, put }) {
      const { response } = yield call(purchaseContractMilestone, payload);
      yield put({
        type: 'updateState',
        payload: {
          milestoneArr: response || [],
        },
      });
    },

    *selectContractNode({ payload }, { call, put }) {
      const { response } = yield call(purchaseContractNode, payload);
      yield put({
        type: 'updateState',
        payload: {
          contractNodeArr: response || [],
        },
      });
    },

    *selectOuByOuId({ payload }, { call, put }) {
      const { response } = yield call(selectOuByOuId, payload);
      return response;
    },

    *getProductClass({ payload }, { call, put }) {
      const { response } = yield call(getProductClass, payload);
      yield put({
        type: 'updateState',
        payload: {
          productClassrArr: response || [],
        },
      });
    },

    *fetchPrincipal(_, { call, put }) {
      const { response } = yield call(queryUserPrincipal);
      // ????????????????????????
      yield put({
        type: 'updateState',
        payload: {
          user: response,
        },
      });
      return response;
    },

    // ??????????????????
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      const { formData } = yield select(({ salePurchaseEdit }) => salePurchaseEdit);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo,
          },
        });
        const { pageBlockViews } = response.configInfo;
        const pageField = pageBlockViews.find(
          item => item.blockKey === 'PURCHASE_CONTRACT_MANAGEMENT'
        );
        if (pageField !== undefined) {
          const { pageFieldViews } = pageField;
          const acceptanceType = pageFieldViews.find(item => item.fieldKey === 'acceptanceType');
          if (
            acceptanceType !== undefined &&
            acceptanceType.fieldDefaultValue &&
            !formData.acceptanceType
          ) {
            yield put({
              type: 'updateForm',
              payload: {
                acceptanceType: acceptanceType.fieldDefaultValue,
              },
            });
          }
        }
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    clear(state, { payload }) {
      return {
        ...state,
        formData: defaultFormData,
        originalFormData: {},
        paymentList: [],
        purchaseList: [],
        originalPaymentList: [],
        originalPurchaseList: [],
        paymentDeletedKeys: [],
        purchaseDeleteKeys: [],
        invoiceArr: [],
        taskArr: [],
        productClassrArr: [],
        milestoneArr: [],
        contractNodeArr: [],
        purchaseLegalArr: [],
        purchaseBuArr: [],
        purchaseInchargeResArr: [],
        abOusArr: [],
        allAbOusArr: [],
        projectArr: [],
        user: {},
        pageConfig: {},
      };
    },
  },
};
