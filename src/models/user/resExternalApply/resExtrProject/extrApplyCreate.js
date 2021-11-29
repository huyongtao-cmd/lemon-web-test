import {
  projClosureApplySaveRq,
  projClosureApplyDetailsRq,
  getResultsByProjRq,
  checkresultSaveRq,
  checkresultRq,
  evalInfoRq,
  extrApplyRq,
  evalSaveRq,
  getPointRq,
  salesBuRq,
} from '@/services/user/project/project';
import {
  queryResEnrollInfo,
  saveResApplyList,
  getResApplyListRq,
} from '@/services/plat/res/resprofile';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
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
  namespace: 'extrApplyCreate',
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
    pageConfig: {},
    type2: [],
    jobClass2: [],
    capaSetList: [],
  },

  effects: {
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
    *query({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      const { resId, resName, jobGrade, baseBuName } = response.extInfo || {};
      const defaultFormData = {
        applyResId: isNil(resId) ? undefined : resId + '',
        applyResName: resName,
        applyDate: moment().format('YYYY-MM-DD'),
        apprStatus: 'NOTSUBMIT',
        resType: 'GENERAL',
        submit: 'true',
        ceoApprFlag: 'no',
        // periodFlag: 'LONG',
      };
      const { status: sts, response: resp } = yield call(queryResEnrollInfo, payload);
      if (sts === 100) {
        // 主动取消请求
        return;
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
                resType1: 'EXTERNAL_RES',
                resType2: data.resType1 === 'INTERNAL_RES' ? undefined : data.resType2,
                entryType: data.resStatus === 1 ? 'FIRST_TIME' : '',
              },
            },
          });
        } else {
          const message = resp.reason || '获取详细信息失败';
          createMessage({ type: 'warn', description: message });
        }
      }
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

    *submit({ payload }, { call, put, select }) {
      const { formData, capaSetList } = yield select(({ extrApplyCreate }) => extrApplyCreate);
      const { id: resIds } = fromQs();
      const { id, apprStatus, jobCapaSetLevelDId, ...newFormData } = formData;
      let jobCapaSetLevelId = null;
      let jobCapaSetId = null;
      if (jobCapaSetLevelDId) {
        const filterList = capaSetList.filter(item => item.id === Number(jobCapaSetLevelDId));
        jobCapaSetLevelId = filterList.length > 0 ? filterList[0].valSphd1 : null;
        jobCapaSetId = filterList.length > 0 ? filterList[0].valSphd2 : null;
      }
      const { status, response } = yield call(saveResApplyList, {
        resId: resIds,
        ...newFormData,
        jobCapaSetLevelDId,
        jobCapaSetLevelId,
        jobCapaSetId,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        closeThenGoto(`/user/flow/process?type=procs`);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程创建失败' });
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
