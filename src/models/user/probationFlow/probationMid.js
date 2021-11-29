import {
  findResById,
  getResultsRq,
  checkresultRq,
  saveMidRq,
  checkresultSaveRq,
  detailRq,
  evalGetPointRq,
  saveEvalsRq,
  getCapacityListRq,
} from '@/services/user/probation/probation';
import {
  queryCapaTree,
  queryCapaTreeDetail,
  queryCapaTreeDetailWithText,
} from '@/services/plat/capa/capa';
import { getViewConf } from '@/services/gen/flow';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { queryUserPrincipal } from '@/services/gen/user';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, isNil } from 'ramda';
import moment from 'moment';

export default {
  namespace: 'probationMid',

  state: {
    formData: {},
    resData: [],
    baseBuData: [],
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
    getPointList: [],
    getPointItemList: [],
    pResPointList: [],
    pResPointItemList: [],
    buPicPointList: [],
    buPicPointItemList: [],

    capaTreeDataDetail: [],
    capaTreeDataDetailTotal: 0,
    capaTreeData: [],
    dataList: [], // 单项能力
    dataListDelId: [], // 单项能力删除的Id
    capacityList: [],
    capacityListSelected: [], // 复合能力
    capacityListSelectedDelId: [], // 复合能力删除的Id
  },

  effects: {
    *getCapacityList({ payload }, { call, put }) {
      const { status, response } = yield call(getCapacityListRq, payload);
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
      createMessage({ type: 'error', description: response.reason || '评价详情保存失败' });
      return {};
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
    *evalSave({ payload }, { call, put }) {
      const { status, response } = yield call(saveEvalsRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          return response;
        }
      }
      createMessage({ type: 'error', description: response.reason || '评价详情保存失败' });
      return {};
    },
    *getPoint({ payload }, { call, put }) {
      const { status, response } = yield call(evalGetPointRq, payload);
      if (status === 200 && response.ok) {
        const list = Array.isArray(response.datum) ? response.datum : [];
        const pRes = list.filter(v => v.evalType === 'P_RES');
        const buPic = list.filter(v => v.evalType === 'BU_PIC');
        yield put({
          type: 'updateState',
          payload: {
            pResPointList: pRes,
            pResPointItemList: Array.isArray(pRes[0].itemList) ? pRes[0].itemList : [],
            buPicPointList: buPic,
            buPicPointItemList: Array.isArray(buPic[0].itemList) ? buPic[0].itemList : [],
          },
        });
      } else {
        createMessage({
          type: 'error',
          description: response.reason || '获取评审列表失败',
        });
      }
    },
    *flowDetail({ payload }, { call, put }) {
      const { status, response } = yield call(detailRq, payload);
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
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
    },
    *checkresultUpdate({ payload }, { call, put }) {
      const { status, response } = yield call(checkresultSaveRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '结项检查事项处理失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '结项检查事项处理失败' });
      return {};
    },
    *createSubmit({ payload }, { call, put, select }) {
      const { formData } = yield select(({ probationMid }) => probationMid);
      const { id, ...newParams } = formData;

      const { status, response } = yield call(saveMidRq, { ...newParams, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok) {
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
      return {};
    },
    *submit({ payload }, { call, put, select }) {
      const {
        formData,
        dataList,
        dataListDel,
        capacityListSelected,
        capacityListSelectedDelId,
      } = yield select(({ probationMid }) => probationMid);

      if (!isEmpty(dataList)) {
        formData.capaListIdsAdd = dataList.map(v => v.capaLevelId);
      }
      if (!isEmpty(dataListDel)) {
        formData.capaListIdsDel = dataListDel;
      }
      if (!isEmpty(capacityListSelected)) {
        formData.capaSetListIdsAdd = capacityListSelected.map(v => v.id);
      }
      if (!isEmpty(capacityListSelectedDelId)) {
        formData.capaSetListIdsDel = capacityListSelectedDelId;
      }

      // 除了评审结果为'不予转正'以外时，复合能力列表不能为空
      if (
        formData.buPicCheckResult &&
        formData.buPicCheckResult !== '4' &&
        isEmpty(capacityListSelected)
      ) {
        createMessage({ type: 'error', description: '复合能力列表不能为空！' });
        return {};
      }

      const { status, response } = yield call(saveMidRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (response.ok) {
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '保存失败' });
      return {};
    },
    *queryUserPrincipal({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        const { resId, resName } = response.extInfo || {};
        yield put({
          type: 'updateForm',
          payload: {
            applyResId: isNil(resId) ? undefined : resId + '',
            applyResName: resName,
            applyDate: moment().format('YYYY-MM-DD'),
            submit: 'true',
          },
        });
      } else {
        createMessage({ type: 'error', description: '获取资源信息失败' });
      }
    },
    *queryResDetail({ payload }, { call, put }) {
      const { status, response } = yield call(findResById, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response && response.ok) {
          const { apprStatus, ...data } = response.datum || {};
          yield put({
            type: 'updateForm',
            payload: {
              ...data,
              remark: null,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取离职资源详情失败' });
        }
      }
    },
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resData: list,
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
        },
      });
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
    *clean({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {},
          dataList: [],
          dataListDel: [],
          capacityList: {},
          capacityListSelected: [],
          capacityListSelectedDelId: [],
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
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
