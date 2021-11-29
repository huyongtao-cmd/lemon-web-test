import {
  offerAndResRq,
  notSubmitListRq,
  getOfferAndResDetailsRq,
  entryItemListRq,
  itAdminRq,
  findBuRq,
  checkResultRq,
  changeStatueRq,
  checkItemResultListRq,
  findCapaRq,
  findJobIsUsedRq,
  closeFlowForTask6Rq,
  salesBuRq,
  getOldSaleBuRq,
  resAbilityRq,
  saveEntityAbilityRq,
  offerEntryMyCapasetRq,
} from '@/services/plat/res/resprofile';
import { getCapacityListRq } from '@/services/user/probation/probation';
import {
  queryCapaTree,
  queryCapaTreeDetail,
  queryCapaTreeDetailWithText,
} from '@/services/plat/capa/capa';
import { closeFlowRq } from '@/services/user/flow/flow';
import router from 'umi/router';
import { getViewConf, pushFlowTask, cancelFlow } from '@/services/gen/flow';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { queryCascaderUdc } from '@/services/gen/app';
import { selectBuMultiCol, offerApplyRq } from '@/services/org/bu/bu';
import { selectFilterRole } from '@/services/sys/system/datapower';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { isEmpty, isNil } from 'ramda';
import { createConfirm } from '@/components/core/Confirm';
import { stringify } from 'qs';
import moment from 'moment';
import { queryCapaSetList } from '@/services/plat/capa/train';

export default {
  namespace: 'offerAndResFlow',

  state: {
    formData: {},
    type2Data: [],
    resData: [],
    resDataSource: [],
    baseBuData: [],
    baseBuDataSource: [],
    oldSaleBuBuDataSource: [],
    roleData: [],
    notSubmitList: [],
    findJobIsUsedList: [],
    dataSource: [],
    eqvaRatioList: [],
    defaultFormData: {
      apprStatus: 'NOTSUBMIT',
      pResData: {},
      baseBuObj: {},
    },
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {
      buttons: [],
      panels: {
        disabledOrHidden: {},
      },
    },
    entryResInfoChk: [],
    type2: [],
    jobClass2: [],

    capaTreeDataDetail: [],
    capaTreeDataDetailTotal: 0,
    capaTreeData: [],
    dataList: [],
    dataListDel: [],
    capacityList: [],
    capacityListSelected: [],
    capacityListSelectedDelId: [],
    deleteKeys: [],
    capaSetList: [],
  },

  effects: {
    *saveEntityAbility({ payload }, { call, put, select }) {
      const {
        formData,
        dataList,
        dataListDel,
        capacityListSelected,
        capacityListSelectedDelId,
      } = yield select(({ offerAndResFlow }) => offerAndResFlow);
      formData.twResCapaEntity = dataList;
      formData.delCapa = dataListDel;
      formData.twResCapasetEntity = capacityListSelected;
      formData.delCapaset = capacityListSelectedDelId;

      const { status, response } = yield call(saveEntityAbilityRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: response.reason || '账号开通成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '提交失败' });
      }
    },
    // 根据resId拉取单项能力、复合能力
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
    // *getCapacityList({ payload }, { call, put }) {
    //   const { status, response } = yield call(offerEntryMyCapasetRq, payload);
    //   if (status === 100) {
    //     // 主动取消请求
    //     return {};
    //   }
    //   if (status === 200) {
    //     if (response.ok) {
    //       yield put({
    //         type: 'updateState',
    //         payload: {
    //           capacityList: Array.isArray(response.datum) ? response.datum : [],
    //         },
    //       });
    //       return response;
    //     }
    //   }
    //   createMessage({ type: 'error', description: response.reason || '获取复合能力列表失败' });
    //   return {};
    // },
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
          payload: { jobClass2: Array.isArray(response) ? response : [] },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: { jobClass2: [] },
        });
      }
    },
    // 查内部资源对应的资源类型二
    *typeChange({ payload }, { call, put }) {
      const { response } = yield call(queryCascaderUdc, {
        defId: 'RES:RES_TYPE2',
        parentDefId: 'RES:RES_TYPE1',
        parentVal: 'INTERNAL_RES',
      });
      if (response) {
        yield put({
          type: 'updateState',
          payload: { type2: Array.isArray(response) ? response : [] },
        });
      }
    },
    *closeFlowForTask6({ payload }, { call, put, select }) {
      const { status, response } = yield call(closeFlowForTask6Rq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '流程关闭成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程关闭失败' });
      }
    },
    *findJobIsUsed({ payload }, { call, put }) {
      const { response } = yield call(findJobIsUsedRq);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          findJobIsUsedList: list,
        },
      });
    },
    *findCapa({ payload }, { call, put }) {
      const { status, response } = yield call(findCapaRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '检查是否存在复合能力失败' });
      return {};
    },
    *checkresultList({ payload }, { call, put }) {
      const { status, response } = yield call(checkItemResultListRq, payload);
      if (status === 200 && response.ok) {
        const list = Array.isArray(response.datum) ? response.datum : [];
        yield put({
          type: 'updateState',
          payload: {
            entryResInfoChk: list.filter(v => v.chkCalss === 'ENTRY_RES_INFO_CHK'),
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '获取办理事项列表失败' });
      }
    },
    *closeFlow({ payload }, { call, put, select }) {
      const { status, response } = yield call(closeFlowRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '流程关闭成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程关闭失败' });
      }
    },
    *query({ payload }, { call, put, select }) {
      const defaultFormData = {
        apprStatus: 'NOTSUBMIT',
        resType: 'GENERAL',
        submit: 'true',
        password: 'password',
      };
      const { status: sts, response: resp } = yield call(getOfferAndResDetailsRq, payload);
      if (sts === 100) {
        // 主动取消请求
        return {};
      }
      if (sts === 200) {
        if (resp && resp.ok) {
          const data = resp.datum || {};
          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...defaultFormData,
                ...data,
                roleCode: data.roleCode ? data.roleCode.split(',') : [],
              },
              eqvaRatioList: data.eqvaList ? data.eqvaList : [],
            },
          });
          return {
            ...defaultFormData,
            ...data,
            roleCode: data.roleCode ? data.roleCode.split(',') : [],
          };
        }
        createMessage({ type: 'warn', description: resp.reason || '获取详细信息失败' });
        return {};
      }
      createMessage({ type: 'warn', description: resp.reason || '获取详细信息失败' });
      return {};
    },

    *submit({ payload }, { call, put, select }) {
      const { formData, eqvaRatioList } = yield select(({ offerAndResFlow }) => offerAndResFlow);
      const {
        preEnrollDate,
        birthday,
        enrollDate,
        regularDate,
        contractSignDate,
        contractExpireDate,
        probationBeginDate,
        probationEndDate,
        apprStatus,
        baseBuId: baseObj,
        internDate,
      } = formData;
      const { id: resIds } = fromQs();
      if (preEnrollDate && typeof preEnrollDate !== 'string') {
        formData.preEnrollDate = preEnrollDate.format('YYYY-MM-DD');
      }
      if (birthday && typeof birthday !== 'string') {
        formData.birthday = birthday.format('YYYY-MM-DD');
      }
      if (enrollDate && typeof enrollDate !== 'string') {
        formData.enrollDate = enrollDate.format('YYYY-MM-DD');
      }
      if (regularDate && typeof regularDate !== 'string') {
        formData.regularDate = regularDate.format('YYYY-MM-DD');
      }
      if (contractSignDate && typeof contractSignDate !== 'string') {
        formData.contractSignDate = contractSignDate.format('YYYY-MM-DD');
      }
      if (contractExpireDate && typeof contractExpireDate !== 'string') {
        formData.contractExpireDate = contractExpireDate.format('YYYY-MM-DD');
      }
      if (probationBeginDate && typeof probationBeginDate !== 'string') {
        formData.probationBeginDate = probationBeginDate.format('YYYY-MM-DD');
      }
      if (probationEndDate && typeof probationEndDate !== 'string') {
        formData.probationEndDate = probationEndDate.format('YYYY-MM-DD');
      }
      if (internDate && typeof internDate !== 'string') {
        formData.internDate = internDate.format('YYYY-MM-DD');
      }
      const { isFlag, taskKey } = payload;
      let params = {};
      if (isFlag) {
        params = {
          resId: resIds,
          ...formData,
          eqvaList: [...eqvaRatioList],
          taskKey,
        };
      } else {
        params = {
          resId: resIds,
          ...formData,
        };
      }
      const { status, response } = yield call(offerAndResRq, params);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        yield put({
          type: 'pushFlowTask',
          payload,
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '提交失败' });
      }
    },

    /**
     * 1、保存表单信息
     * 2、查找改该独立BU是否存在
     * 3、若不存在则跳转到新建BU页面新建BU
     * 4、新建完成后前端推流程
     */
    *createBuSubmit({ payload }, { call, put, select }) {
      const { formData, capaSetList } = yield select(({ offerAndResFlow }) => offerAndResFlow);
      const {
        preEnrollDate,
        birthday,
        enrollDate,
        regularDate,
        contractSignDate,
        contractExpireDate,
        probationBeginDate,
        probationEndDate,
        apprStatus,
        baseBuId: baseObj,
        resId,
        jobCapaSetLevelDId, // 复合能力
        internDate,
      } = formData;
      const { id: resIds } = fromQs();
      if (preEnrollDate && typeof preEnrollDate !== 'string') {
        formData.preEnrollDate = preEnrollDate.format('YYYY-MM-DD');
      }
      if (birthday && typeof birthday !== 'string') {
        formData.birthday = birthday.format('YYYY-MM-DD');
      }
      if (enrollDate && typeof enrollDate !== 'string') {
        formData.enrollDate = enrollDate.format('YYYY-MM-DD');
      }
      if (regularDate && typeof regularDate !== 'string') {
        formData.regularDate = regularDate.format('YYYY-MM-DD');
      }
      if (contractSignDate && typeof contractSignDate !== 'string') {
        formData.contractSignDate = contractSignDate.format('YYYY-MM-DD');
      }
      if (contractExpireDate && typeof contractExpireDate !== 'string') {
        formData.contractExpireDate = contractExpireDate.format('YYYY-MM-DD');
      }
      if (probationBeginDate && typeof probationBeginDate !== 'string') {
        formData.probationBeginDate = probationBeginDate.format('YYYY-MM-DD');
      }
      if (probationEndDate && typeof probationEndDate !== 'string') {
        formData.probationEndDate = probationEndDate.format('YYYY-MM-DD');
      }
      if (internDate && typeof internDate !== 'string') {
        formData.internDate = internDate.format('YYYY-MM-DD');
      }
      if (jobCapaSetLevelDId) {
        const filterList = capaSetList.filter(item => item.id === Number(jobCapaSetLevelDId));
        formData.jobCapaSetLevelId = filterList.length > 0 ? filterList[0].valSphd1 : null; // 能力级别
        formData.jobCapaSetId = filterList.length > 0 ? filterList[0].valSphd2 : null; // 能力级别
      } else {
        formData.jobCapaSetLevelId = null;
        formData.jobCapaSetId = null;
      }
      const { status, response } = yield call(offerAndResRq, {
        resId: resIds,
        ...formData,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      const { resType } = formData;
      if (resType === 'SALES_BU') {
        if (response.ok) {
          yield put({
            type: 'findBu',
            payload,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
      } else {
        const { remark } = payload;
        const { id, taskId } = fromQs();
        yield put({
          type: 'offerApply',
          payload: {
            id,
            procTaskId: taskId,
            procRemark: remark,
          },
        });
      }
    },

    *offerApply({ payload }, { call, put, select }) {
      const { status, response } = yield call(offerApplyRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: response.reason || '提交成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },

    *pushFlowTask({ payload }, { call, put }) {
      const { taskId } = fromQs();
      const { status: apprSts, response } = yield call(pushFlowTask, taskId, payload);
      if (apprSts === 200 && response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程创建失败' });
      }
    },
    *entryItemList({ payload }, { call, put }) {
      const { status, response } = yield call(entryItemListRq, payload);

      if (status === 200 && response.ok) {
        const list = Array.isArray(response.datum) ? response.datum : [];
        yield put({
          type: 'updateState',
          payload: {
            dataSource: list,
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '入职事项列表获取失败' });
      return {};
    },
    *itAdmin({ payload }, { call, put, select }) {
      const { formData } = yield select(({ offerAndResFlow }) => offerAndResFlow);
      const { status, response } = yield call(itAdminRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      const { emailAddr, accessLevel, ...newPayload } = payload;
      if (response.ok) {
        createMessage({ type: 'success', description: response.reason || '账号开通成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '提交失败' });
      }
    },

    *findBu({ payload }, { call, put, select }) {
      const {
        formData: { resId },
      } = yield select(({ offerAndResFlow }) => offerAndResFlow);
      const { id, taskId } = fromQs();
      const { status, response } = yield call(findBuRq, { buId: id });
      const { remark } = payload;
      const urls = getUrl();
      const offerFrom = stringify({ offerFrom: urls });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          const { datum } = response;
          if (!datum) {
            createConfirm({
              content: '入职资源为独立销售BaseBu，需要先创建新的BU作为该资源的BU，是否继续加？',
              onOk: () =>
                router.push(
                  `/org/bu/create?id=${id}&taskId=${taskId}&remark=${remark}&from=/hr/res/profile/list/OfferAndResDetails&${offerFrom}`
                ),
            });
          } else {
            yield put({
              type: 'orgbuCreate/offerApply',
              payload: {
                id,
                procTaskId: taskId,
                procRemark: remark,
              },
            });
          }
        }
      }
    },

    *checkResult({ payload }, { call, put, select }) {
      const { dataSource } = payload;
      const { status, response } = yield call(checkResultRq, dataSource);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        const { id } = fromQs();
        const { remark, result } = payload;
        yield put({
          type: 'pushFlowTask',
          payload: {
            remark,
            result,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '提交失败' });
      }
    },

    *changeStatue({ payload }, { call, put, select }) {
      const { status, response } = yield call(changeStatueRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        const { id } = fromQs();
        yield put({
          type: 'entryItemList',
          payload: {
            twofferId: id,
          },
        });
        createMessage({ type: 'success', description: '处理成功' });
      } else {
        createMessage({ type: 'error', description: response.reason || '提交失败' });
      }
    },

    *noSubmit({ payload }, { call, put }) {
      const { status, response } = yield call(notSubmitListRq);
      const list = Array.isArray(response.datum) ? response.datum : [];
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
    *oldSaleBu({ payload }, { call, put }) {
      const { response } = yield call(getOldSaleBuRq, payload);
      const list = Array.isArray(response.datum) ? response.datum : [];
      yield put({
        type: 'updateState',
        payload: {
          oldSaleBuBuDataSource: list,
        },
      });
      // yield put({
      //   type: 'updateForm',
      //   payload: { oldSaleBu: '', oldSaleBuName: '' },
      // });
    },
    *cleanDate({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {},
          type2Data: [],
          resData: [],
          resDataSource: [],
          baseBuData: [],
          baseBuDataSource: [],
          oldSaleBuBuDataSource: [],
          roleData: [],
          notSubmitList: [],
          findJobIsUsedList: [],
          dataSource: [],
          entryResInfoChk: [],
          type2: [],
          capaTreeDataDetail: [],
          capaTreeDataDetailTotal: 0,
          capaTreeData: [],
          dataList: [],
          dataListDel: [],
          capacityList: [],
          capacityListSelected: [],
          capacityListSelectedDelId: [],
          jobClass2: [],
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
