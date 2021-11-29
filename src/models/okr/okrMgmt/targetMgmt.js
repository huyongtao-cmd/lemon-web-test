import {
  objectiveListRq,
  objectiveSupListRq,
  objectiveEditRq,
  objectiveDetailRq,
  objectiveDelRq,
  implementListRq,
  targetMapRq,
  keyResultDetailRq,
  keyresultUpdateDetailRq,
  kRUpdateRq,
  commentInsertRq,
  commentSelectRq,
  commentSelectDetailRq,
  commentLikeRq,
  flowSubmit,
  objectiveWorkPlanListRq,
  objectiveWorkPlanChntDetailsRq,
  objectiveWorkPlanChntCreateRq,
  objectiveWorkPlanChntUpdateRq,
  objectiveWorkLogSaveUriRq,
  objtempRq,
  targetPathMapRq,
  isPreRq,
  updateObjectiveCat,
} from '@/services/okr/okrMgmt';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { queryUserPrincipal } from '@/services/gen/user';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { isEmpty, isNil } from 'ramda';
import { genFakeId } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';

const defaultSearchForm = {};
const defaultFormData = {
  objectiveStatus: 'CREATE',
  publicTag: 'false',
  supObjectiveMsg: {},
  objectSpeakFlag: 0,
  objectSpeakFlagSubmit: 0,
  activeKey: 'msgBoard',
  rangeBu: [],
  rangeRes: [],
  isPresobjectRes: false,
  isPres: false,
};

const defaultWorkPlanFormData = {
  planStatus: 'PLAN',
};

const defaultGradeTypeFormData = {
  gradeType: 'LINEAR',
};

export default {
  namespace: 'targetMgmt',
  state: {
    // 实施周期数据
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    dataSource: [],
    formData: defaultFormData,
    formDataView: defaultFormData,
    catData: {},
    // 实施周期目标数据
    targetList: [],
    targetTotal: 0,
    implementList: [],
    objectiveList: [],
    objectiveProgList: [],
    keyresultList: [],
    keyresultListView: [],
    keyresultWorkPlanList: [],
    keyresultWorkPlanListDel: [],
    keyresultListDel: [],
    targetMapList: [],
    targetMapFormData: {},
    // 关键目标修改
    keyResultFormData: {},
    twKrprogView: [], // 关键目标更新日志
    gradeTypeFormData: defaultGradeTypeFormData, // 打分规则数据
    gradeTypeList: [], // 打分规则列表
    gradeTypeListDel: [], // 打分规则删除列表
    // 工作计划
    workPlanList: [],
    workPlanFromData: defaultWorkPlanFormData,
    workPlanTotal: 0,
    // 指导与评价
    commentList: [],
    commentLogList: [],
    // 相关人员
    resDataSource: [],
    // 目标实现路径
    targetPathList: [],
    visible: false,
    pageConfig: {},
  },

  effects: {
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
            createUserId: resId,
          },
        });
      } else {
        createMessage({ type: 'error', description: '获取登录资源信息失败' });
      }
    },
    *isPre({ payload }, { call, put }) {
      const { status, response } = yield call(isPreRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateForm',
            payload: {
              isPres: !isNil(response.datum) ? response.datum : false,
            },
          });
          return { ...defaultFormData, ...response.datum };
        }
        createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
      return {};
    },
    *targetPathMap({ payload }, { call, put }) {
      const { status, response } = yield call(targetPathMapRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          return !isEmpty(response.datum) ? response.datum : {};
        }
        createMessage({ type: 'error', description: response.reason || '查询失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '查询失败' });
      return {};
    },
    *submitFlow({ payload }, { put, call, select }) {
      const { status, response } = yield call(flowSubmit, payload);
      if (status === 200 && response.ok) {
        // createMessage({ type: 'success', description: '线索提交成功' });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '流程发起失败' });
      return {};
    },
    *commentLike({ payload }, { call, put, select }) {
      const { status, response } = yield call(commentLikeRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          return response;
        }
        return {};
      }
      return {};
    },
    *commentSelectDetail({ payload }, { call, put }) {
      const { status, response } = yield call(commentSelectDetailRq, payload);
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              commentList: Array.isArray(response.datum.findOkrObjectComment)
                ? response.datum.findOkrObjectComment
                : [],
              commentLogList: Array.isArray(response.datum.findOkrObjectTem)
                ? response.datum.findOkrObjectTem
                : [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '查询目标动态失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '查询目标动态失败' });
      }
    },
    *commentInsert({ payload }, { call, put, select }) {
      const { status, response } = yield call(commentInsertRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          createMessage({ type: 'success', description: '发布成功' });
          return response;
        }
        createMessage({ type: 'error', description: response.reason || '发布失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '发布失败' });
      return {};
    },
    *commentSelect({ payload }, { call, put }) {
      const { status, response } = yield call(commentSelectRq, payload);
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              commentLogList: Array.isArray(response.datum) ? response.datum : [],
              commentList: Array.isArray(response.datum)
                ? response.datum.filter(v => v.objectComment)
                : [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '查询目标动态失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '查询目标动态失败' });
      }
    },
    *kRUpdate({ payload }, { call, put, select }) {
      const { keyResultFormData } = yield select(({ targetMgmt }) => targetMgmt);
      const { status, response } = yield call(kRUpdateRq, keyResultFormData);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *keyresultUpdateDetail({ payload }, { call, put }) {
      const { status, response } = yield call(keyresultUpdateDetailRq, payload);
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              keyResultFormData: response.datum,
              twKrprogView: Array.isArray(response.datum.twKrprogView)
                ? response.datum.twKrprogView
                : [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
      }
    },
    *keyResultDetail({ payload }, { call, put }) {
      const { status, response } = yield call(keyResultDetailRq, payload);
      if (status === 200) {
        if (response.ok) {
          yield put({
            type: 'updateState',
            payload: {
              keyResultFormData: response.datum,
              twKrprogView: Array.isArray(response.datum.twKrprogView)
                ? response.datum.twKrprogView
                : [],
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
      }
    },
    *getWorkPlanDetail({ payload }, { call, put }) {
      const { status, response } = yield call(objectiveWorkPlanChntDetailsRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          // 做了一个简单的优化:解决当 response.datum 为 null 时的报错
          const {
            dateFrom = '',
            dateTo = '',
            reportedResId = [],
            relevantResId = [],
          } = response.datum;
          yield put({
            type: 'updateWorkPlanForm',
            payload: {
              ...response.datum,
              dates: [dateFrom, dateTo],
              reportedResId:
                !isNil(reportedResId) && !isEmpty(reportedResId)
                  ? reportedResId.split(',').map(v => Number(v))
                  : [],
              relevantResId:
                !isNil(relevantResId) && !isEmpty(relevantResId)
                  ? relevantResId.split(',').map(v => Number(v))
                  : [],
            },
          });
          return response.datum;
        }
        createMessage({ type: 'error', description: response.reason || '获取详细信息失败' });
      }
      return {};
    },
    *targetMap({ payload }, { call, put }) {
      const { status, response } = yield call(targetMapRq, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            targetMapList: response,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询目标树失败' });
      }
    },
    *queryDetailView({ payload }, { call, put }) {
      const { status, response } = yield call(objectiveDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          const { rangeBu, rangeRes } = response.datum;
          yield put({
            type: 'updateState',
            payload: {
              formDataView: {
                ...defaultFormData,
                ...response.datum,
                rangeBu: !isNil(rangeBu) ? rangeBu.split(',').map(v => Number(v)) : [],
                rangeRes: !isNil(rangeRes) ? rangeRes.split(',').map(v => Number(v)) : [],
              },
              keyresultListView: Array.isArray(response.datum.twOkrKeyresultView)
                ? response.datum.twOkrKeyresultView.map(v => ({ ...v, id: genFakeId(-1) }))
                : [],
            },
          });
          return { ...defaultFormData, ...response.datum };
        }
        createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
      return {};
    },
    *queryDetail({ payload }, { call, put }) {
      const { status, response } = yield call(objectiveDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        if (response.ok) {
          const { rangeBu, rangeRes } = response.datum;
          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...defaultFormData,
                ...response.datum,
                rangeBu: !isNil(rangeBu) ? rangeBu.split(',').map(v => Number(v)) : [],
                rangeRes: !isNil(rangeRes) ? rangeRes.split(',').map(v => Number(v)) : [],
              },
              keyresultList: Array.isArray(response.datum.twOkrKeyresultView)
                ? response.datum.twOkrKeyresultView.map(v => ({ ...v, id: genFakeId(-1) }))
                : [],
              keyresultWorkPlanList: Array.isArray(response.datum.twOkrWorkPlanView)
                ? response.datum.twOkrWorkPlanView
                : [],
            },
          });
          return { ...defaultFormData, ...response.datum };
        }
        createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
        return {};
      }
      createMessage({ type: 'error', description: response.reason || '查询目标详情失败' });
      return {};
    },
    *queryWorkPlanDetail({ payload }, { call, put }) {
      const { status, response } = yield call(objectiveWorkPlanListRq, payload);
      if (status === 200) {
        const { rows, total } = response;
        const d = 'funcddd';
        yield put({
          type: 'updateState',
          payload: {
            workPlanList: Array.isArray(rows) ? rows : [],
            workPlanTotal: total,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *queryImplementList({ payload }, { call, put }) {
      const { status, response } = yield call(implementListRq, payload);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        const { rows } = response;
        yield put({
          type: 'updateState',
          payload: {
            implementList: Array.isArray(rows) ? rows : [],
          },
        });
        const tt = Array.isArray(rows)
          ? rows.filter(v => moment().isAfter(v.beginDate) && moment().isBefore(v.endDate))[0] || {}
          : {};
        yield put({
          type: 'updateState',
          payload: {
            // eslint-disable-next-line no-nested-ternary
            targetMapFormData: !isEmpty(tt) ? tt : !isEmpty(rows) ? rows[0] : {},
          },
        });
        // eslint-disable-next-line no-nested-ternary
        return !isEmpty(tt) ? tt : !isEmpty(rows) ? rows[0] : {};
      }
      createMessage({ type: 'error', description: response.reason || '查询失败' });
      return {};
    },
    *queryObjectiveList({ payload }, { call, put }) {
      const { status, response } = yield call(objectiveListRq, payload);
      if (status === 200) {
        const { rows } = response;
        yield put({
          type: 'updateState',
          payload: {
            objectiveList: Array.isArray(rows) ? rows : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *queryObjectiveSupList({ payload }, { call, put }) {
      const { status, response } = yield call(objectiveSupListRq, payload);
      if (status === 200) {
        const { datum } = response;
        yield put({
          type: 'updateState',
          payload: {
            objectiveProgList: Array.isArray(datum)
              ? datum.filter(v => v.id !== Number(fromQs().id))
              : [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *query({ payload }, { call, put }) {
      const { status, response } = yield call(objectiveListRq, payload);
      if (status === 200) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
        yield put({
          type: 'updateSearchForm',
          payload: {
            selectedRowKeys: [],
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '查询失败' });
      }
    },
    *delete({ payload }, { call, put, select }) {
      const { status, response } = yield call(objectiveDelRq, payload);
      if (status === 200) {
        if (response && response.ok) {
          createMessage({ type: 'success', description: '删除成功' });
          const { searchForm } = yield select(({ targetMgmt }) => targetMgmt);
          yield put({
            type: 'query',
            payload: searchForm,
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '删除失败' });
        }
      }
    },
    *submit({ payload }, { call, put, select }) {
      const { formData, keyresultList, keyresultListDel, keyresultWorkPlanList } = yield select(
        ({ targetMgmt }) => targetMgmt
      );
      const { rangeRes, rangeBu } = formData;

      formData.rangeBu = Array.isArray(rangeBu) ? rangeBu.join(',') : '';
      formData.rangeRes = Array.isArray(rangeRes) ? rangeRes.join(',') : '';
      formData.deleteGradeKeys = Array.isArray(keyresultListDel) ? keyresultListDel.join(',') : '';
      formData.twOkrKeyresultEnetity = keyresultList;

      formData.twOkrWorkPlanEnetity = keyresultWorkPlanList;

      const { status, response } = yield call(objectiveEditRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *newSubmit({ payload }, { call, put, select }) {
      const { formData, keyresultList, keyresultListDel, keyresultWorkPlanList } = yield select(
        ({ targetMgmt }) => targetMgmt
      );
      const { rangeRes, rangeBu } = formData;

      formData.rangeBu = Array.isArray(rangeBu) ? rangeBu.join(',') : '';
      formData.rangeRes = Array.isArray(rangeRes) ? rangeRes.join(',') : '';

      formData.deleteKeys = keyresultListDel;
      formData.twOkrKeyresultEnetity = keyresultList;

      formData.twOkrWorkPlanEnetity = keyresultWorkPlanList;

      const { status, response } = yield call(objtempRq, { ...formData, ...payload });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      return {};
    },
    *workPlanInsert({ payload }, { call, put, select }) {
      const { dates, relevantResId, ...params } = payload;
      if (Array.isArray(dates) && dates[0] && dates[1]) {
        [params.dateFrom, params.dateTo] = dates;
      }
      params.relevantResId = Array.isArray(relevantResId) ? relevantResId.join(',') : '';
      const { status, response } = yield call(objectiveWorkPlanChntCreateRq, params);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      yield put({
        type: 'cleanWorkPlanModal',
        payload: {},
      });
      return {};
    },
    *workPlanUpdate({ payload }, { call, put, select }) {
      const { dates, relevantResId, ...params } = payload;
      if (Array.isArray(dates) && dates[0] && dates[1]) {
        [params.dateFrom, params.dateTo] = dates;
      }
      params.relevantResId = Array.isArray(relevantResId) ? relevantResId.join(',') : '';
      const { status, response } = yield call(objectiveWorkPlanChntUpdateRq, params);
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        return response;
      }
      yield put({
        type: 'cleanWorkPlanModal',
        payload: {},
      });
      return {};
    },

    *workLogSave({ payload }, { call, put, select }) {
      const { workPlanFromData } = yield select(({ targetMgmt }) => targetMgmt);
      const params = [
        {
          ...payload,
          workPlanId: workPlanFromData.id,
          workPlan: workPlanFromData.taskName,
        },
      ];
      const { status, response } = yield call(objectiveWorkLogSaveUriRq, {
        entityList: params,
        delIds: [],
      });
      if (status === 100) {
        // 主动取消请求
        return {};
      }
      if (status === 200) {
        yield put({
          type: 'cleanWorkPlanModal',
          payload: {},
        });
        return response;
      }
      return {};
    },
    *clean(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: defaultFormData,
          searchForm: {
            ...defaultSearchForm,
            selectedRowKeys: [],
          },
          implementList: [],
          objectiveList: [],
          keyresultList: [],
          keyresultListDel: [],
          commentList: [],
          commentLogList: [],
          keyresultWorkPlanList: [],
        },
      });
    },
    *cleanView(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formDataView: defaultFormData,
          keyresultListView: [],
        },
      });
    },
    *cleanTargetList(_, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          searchForm: {
            ...defaultSearchForm,
            selectedRowKeys: [],
          },
          list: [],
          total: 0,
        },
      });
    },
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resDataSource: list,
        },
      });
    },
    *updateObjectiveCat({ payload }, { call, put, select }) {
      const { status, response } = yield call(updateObjectiveCat, payload);
      if (status === 200 && response.ok) {
        const { searchForm } = yield select(({ targetMgmt }) => targetMgmt);
        yield put({
          type: 'query',
          payload: searchForm,
        });
      } else {
        createMessage({ type: 'warn', description: response.reason });
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
    updateForm(state, { payload }) {
      const { formData } = state;
      const newFormData = { ...formData, ...payload };
      return {
        ...state,
        formData: newFormData,
      };
    },
    updateCat(state, { payload }) {
      const { catData } = state;
      const newFormData = { ...catData, ...payload };
      return {
        ...state,
        catData: newFormData,
      };
    },
    updateFormView(state, { payload }) {
      const { formDataView } = state;
      const newFormData = { ...formDataView, ...payload };
      return {
        ...state,
        formDataView: newFormData,
      };
    },
    updateKRForm(state, { payload }) {
      const { keyResultFormData } = state;
      const newFormData = { ...keyResultFormData, ...payload };
      return {
        ...state,
        keyResultFormData: newFormData,
      };
    },
    updateGradeTypeForm(state, { payload }) {
      const { gradeTypeFormData } = state;
      const newFormData = { ...gradeTypeFormData, ...payload };
      return {
        ...state,
        gradeTypeFormData: newFormData,
      };
    },
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
    updateWorkPlanForm(state, { payload }) {
      const { workPlanFromData } = state;
      const newFormData = { ...workPlanFromData, ...payload };
      return {
        ...state,
        workPlanFromData: newFormData,
      };
    },
    cleanWorkPlanModal(state, { payload }) {
      return {
        ...state,
        workPlanFromData: { planStatus: 'PLAN' },
      };
    },
  },
};
