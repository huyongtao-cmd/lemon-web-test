import {
  getResultsByProjRq,
  checkresultSaveRq,
  checkresultRq,
  evalInfoRq,
  extrApplyRq,
  evalSaveRq,
  getPointRq,
  salesBuRq,
  getCapacityListRq,
} from '@/services/user/project/project';
import {
  queryResEnrollInfo,
  saveResApplyList,
  checkExtrApplyAbAccRq,
  getResApplyListDetails,
  getResApplyListDetailsRq,
  getResApplyListRq,
  resAbilityRq,
  offerEntryMyCapasetRq,
} from '@/services/plat/res/resprofile';
import {
  queryCapaTree,
  queryCapaTreeDetail,
  queryCapaTreeDetailWithText,
} from '@/services/plat/capa/capa';
import { closeFlowRq } from '@/services/user/flow/flow';
import { getViewConf } from '@/services/gen/flow';
import { queryReasonList } from '@/services/user/timesheet/timesheet';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectUsers, selectUsersAll } from '@/services/sys/user';
import createMessage from '@/components/core/AlertMessage';
import { selectFilterRole } from '@/services/sys/system/datapower';
import { isEmpty, isNil } from 'ramda';
import { getUrl } from '@/utils/flowToRouter';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import moment from 'moment';
import { queryUserPrincipal } from '@/services/gen/user';
import { queryCascaderUdc } from '@/services/gen/app';
import { queryCapaSetList } from '@/services/plat/capa/train';

export default {
  namespace: 'extrApplyflowCreate',
  state: {
    resDataSource: [],
    baseBuDataSource: [],
    projList: [],
    formData: {},
    resultChkList: [], // 结项检查事项
    evalInfoList: [], // 项目成员评价
    getPointList: [], // 销售、领导对项目经理评价信息获取评价主题信息
    getPointItemList: [], // 销售、领导对项目经理评价信息获取评价点信息
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {
      buttons: [],
      chkClass: null,
      evalType: null,
      panels: {
        disabledOrHidden: {},
      },
    },
    defaultFormData: {
      apprStatus: 'NOTSUBMIT',
      pResData: {},
      baseBuObj: {},
    },
    type2: [],
    jobClass2List: [],
    capaSetList: [],
    capaTreeDataDetail: [],
    capaTreeDataDetailTotal: 0,
    capaTreeData: [],
    dataList: [],
    dataListDel: [],
    capacityList: [],
    capacityListSelected: [],
    capacityListSelectedDelId: [],
  },

  effects: {
    *resAbility({ payload }, { call, put, select }) {
      const { status, response } = yield call(resAbilityRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          const { capaList, capaSetList } = response.datum;
          yield put({
            type: 'updateState',
            payload: {
              dataList: Array.isArray(capaList) ? capaList : [],
              capacityListSelected: Array.isArray(capaSetList) ? capaSetList : [],
            },
          });
          return {};
        }
        createMessage({ type: 'warn', description: response.reason || '获取资源能力失败' });
        return {};
      }
      createMessage({ type: 'warn', description: response.reason || '获取资源能力失败' });
      return {};
    },
    // 复合能力
    *getCapacityList({ payload }, { call, put }) {
      const { status, response } = yield call(offerEntryMyCapasetRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              capacityList: Array.isArray(response.datum) ? response.datum : [],
            },
          });
          return response;
        }
      }
      createMessage({ type: 'error', description: response.reason || '获取复合能力列表失败' });
      return {};
    },

    // 获取适用复合能力下拉数据来源
    *getCapaSetList({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryCapaSetList);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            capaSetList: response.datum || [],
          },
        });
      }
    },

    *queryCapaTreeDataDetail({ payload }, { call, put, select }) {
      let { capaTreeDataDetailTotal, capaTreeDataDetail } = yield select(
        ({ platCapaSetCreate }) => platCapaSetCreate
      );
      const { id = [] } = payload;

      for (let i = 0; i < id.length; i += 1) {
        const idLength = id[i] ? id[i].split('-').length : 0;
        if (idLength > 2) {
          const { response } = yield call(queryCapaTreeDetail, { id: id[i] });
          if (response.datum && Array.isArray(response.datum)) {
            const capaTreeDataDetailItem = response.datum.map(item => {
              // eslint-disable-next-line no-param-reassign
              item.children = undefined;
              return item;
            });
            capaTreeDataDetail = capaTreeDataDetail.concat(capaTreeDataDetailItem);
            capaTreeDataDetailTotal = capaTreeDataDetail.length;
          }
        }
      }

      yield put({
        type: 'updateState',
        payload: {
          capaTreeDataDetail,
          capaTreeDataDetailTotal,
        },
      });
    },

    *queryCapaTreeDataDetailWithText({ payload }, { call, put, select }) {
      let { capaTreeDataDetailTotal, capaTreeDataDetail } = yield select(
        ({ platCapaSetCreate }) => platCapaSetCreate
      );
      const { id = [], text } = payload;
      if (id.length === 0) {
        const { response } = yield call(queryCapaTreeDetailWithText, { text });
        if (response.datum && Array.isArray(response.datum)) {
          const capaTreeDataDetailItem = response.datum.map(item => {
            // eslint-disable-next-line no-param-reassign
            item.children = undefined;
            return item;
          });
          capaTreeDataDetail = capaTreeDataDetail.concat(capaTreeDataDetailItem);
          capaTreeDataDetailTotal = capaTreeDataDetail.length;
        }
      } else {
        for (let i = 0; i < id.length; i += 1) {
          const idLength = id[i] ? id[i].split('-').length : 0;
          if (idLength > 2) {
            const { response } = yield call(queryCapaTreeDetailWithText, { id: id[i], text });
            if (response.datum && Array.isArray(response.datum)) {
              const capaTreeDataDetailItem = response.datum.map(item => {
                // eslint-disable-next-line no-param-reassign
                item.children = undefined;
                return item;
              });
              capaTreeDataDetail = capaTreeDataDetail.concat(capaTreeDataDetailItem);
              capaTreeDataDetailTotal = capaTreeDataDetail.length;
            }
          }
        }
      }

      yield put({
        type: 'updateState',
        payload: {
          capaTreeDataDetail,
          capaTreeDataDetailTotal,
        },
      });
    },
    *queryCapaTreeData({ payload }, { call, put }) {
      const { response } = yield call(queryCapaTree);

      if (response && response.ok && Array.isArray(response.datum)) {
        const loopTreeData = data => {
          const newData = data.map(item => {
            // eslint-disable-next-line no-param-reassign
            item.title = item.text;
            // eslint-disable-next-line no-param-reassign
            item.key = item.id;
            if (Array.isArray(item.children) && item.children.length > 0) {
              // eslint-disable-next-line no-param-reassign
              item.child = item.children.map(cItem => {
                // eslint-disable-next-line no-param-reassign
                cItem.title = cItem.text;
                // eslint-disable-next-line no-param-reassign
                cItem.key = cItem.id;
                return cItem;
              });
            }
            return item;
          });
          return newData;
        };

        yield put({
          type: 'updateState',
          payload: {
            capaTreeData: loopTreeData(response.datum),
          },
        });
      }
    },
    // 岗位分类一 -> 岗位分类二
    *updateListType2({ payload }, { call, put }) {
      if (!payload) {
        return;
      }
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:JOB_TYPE2',
        parentDefId: 'RES:JOB_TYPE1',
        parentVal: payload,
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { jobClass2List: Array.isArray(response) ? response : [] },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: { jobClass2List: [] },
        });
      }
    },
    // 查外部资源对应的资源类型二
    *typeChange({ payload }, { call, put }) {
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:RES_TYPE2',
        parentDefId: 'RES:RES_TYPE1',
        parentVal: 'EXTERNAL_RES',
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { type2: Array.isArray(response) ? response : [] },
        });
      }
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: isEmpty(response)
              ? {
                  buttons: [],
                  panels: {
                    disabledOrHidden: {},
                  },
                }
              : response,
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || 'config获取失败' });
      return {};
    },
    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(getResApplyListRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response && response.ok) {
          const data = response.datum || {};
          yield put({
            type: 'updateForm',
            payload: {
              ...data,
            },
          });
          yield put({
            type: 'updateState',
            payload: {
              dataList:
                response.datum && Array.isArray(response.datum.capaList)
                  ? response.datum.capaList
                  : [],
              capacityListSelected:
                response.datum && Array.isArray(response.datum.capaSetList)
                  ? response.datum.capaSetList
                  : [],
            },
          });
          return data;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        return {};
      }
      return {};
    },

    *submit({ payload }, { call, put, select }) {
      const {
        formData,
        dataList,
        dataListDel,
        capacityListSelected,
        capacityListSelectedDelId,
        capaSetList,
      } = yield select(({ extrApplyflowCreate }) => extrApplyflowCreate);
      const { jobCapaSetLevelDId } = formData;
      formData.twResCapaEntity = dataList;
      formData.delCapa = dataListDel;
      formData.twResCapasetEntity = capacityListSelected;
      formData.delCapaset = capacityListSelectedDelId;
      if (jobCapaSetLevelDId) {
        const filterList = capaSetList.filter(item => item.id === Number(jobCapaSetLevelDId));
        formData.jobCapaSetLevelId = filterList.length > 0 ? filterList[0].valSphd1 : null; // 能力级别
        formData.jobCapaSetId = filterList.length > 0 ? filterList[0].valSphd2 : null; // 能力级别
      } else {
        formData.jobCapaSetLevelId = null;
        formData.jobCapaSetId = null;
      }
      const { status, response } = yield call(saveResApplyList, { ...formData, ...payload });

      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const url = getUrl().replace('edit', 'view');
          closeThenGoto(url);
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    *fourthNodeSubmit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ extrApplyflowCreate }) => extrApplyflowCreate);
      const { status, response } = yield call(checkExtrApplyAbAccRq, { ...formData, ...payload });

      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '操作成功' });
          const url = getUrl().replace('edit', 'view');
          closeThenGoto(url);
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    *noSubmit({ payload }, { call, put }) {
      const { status, response } = yield call(selectUsersAll);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          notSubmitList: list,
        },
      });
    },

    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resData: list,
          resDataSource: list,
        },
      });
    },

    *bu({ payload }, { call, put }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuData: list,
          baseBuDataSource: list,
        },
      });
      yield put({
        type: 'updateForm',
        payload: { baseBuId: '', baseBuName: '' },
      });
    },

    *salesBu({ payload }, { call, put }) {
      const { response } = yield call(salesBuRq);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuData: list,
          baseBuDataSource: list,
        },
      });
      yield put({
        type: 'updateForm',
        payload: { baseBuId: '', baseBuName: '' },
      });
    },

    *role({ payload }, { call, put }) {
      const { response } = yield call(selectFilterRole, payload);
      yield put({
        type: 'updateState',
        payload: {
          roleData: Array.isArray(response) ? response : [],
        },
      });
    },
  },

  *extrApplyflowCreateDetails({ payload }, { call, put }) {
    const { status, response } = yield call(getResApplyListDetailsRq, payload);
    if (status === 100) {
      // 主动取消请求
      return;
    }
    if (status === 200) {
      if (response.ok) {
        yield put({
          type: 'updateForm',
          payload: {
            ...response.datum,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
    } else {
      createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
    }
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
  },
};
