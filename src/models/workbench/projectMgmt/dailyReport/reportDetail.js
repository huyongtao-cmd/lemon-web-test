import {
  projectPlanListRq,
  projectPlanDetailRq,
  projectMemberPageRq,
  dailyIncreaseRq,
  dailyReportDetailRq,
  dailyOverallRq,
  dailyDetailRq,
  dailyPlanDetailRq,
} from '@/services/workbench/project';
import {
  customSelectionListByKey, // 自定义选择项
  systemSelectionListByKey,
} from '@/services/production/system';
import router from 'umi/router';
import createMessage from '@/components/core/AlertMessage';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/production/stringUtil';
import { isEmpty } from 'ramda';

const defaultState = {
  formData: {
    executeStatus: 'TO_BE_STARTED',
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'DESCRIPTION',
  dataListSelected: [],
  dataListSelectedDel: [],
  modalformdata: {},
  visible: false,
  memberGroupList: [],
  projectPlanTotal: 0,
  projectPlanList: [],
  projectMemberList: [], //所選關連計劃的成員list
  projectAllMemberList: [], //項目所有成員的list
  phaseList: [],
  relatedPlanList: [],
  relatedPlanDelList: [],
  relatedRowSelectionSelected: [],
  executeStatusList: [],
  resDataSource: [],
};
export default {
  namespace: 'reportDetail',

  state: defaultState,

  effects: {
    *updateRelatedPlanList({ payload }, { call, put, select }) {
      yield put({
        type: 'updateState',
        payload: { relatedPlanList: payload },
      });
    },

    // 拉去UDC数据
    *queryUdcFun({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(systemSelectionListByKey, payload);

      yield put({
        type: 'updateState',
        payload: { executeStatusList: data },
      });

      return data;
    },

    *updateProjectMemberList({ payload }, { call, put, select }) {
      yield put({
        type: 'updateState',
        payload: { projectMemberList: payload },
      });
    },

    // 项目成员
    *projectMemberPage({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(projectMemberPageRq, payload);
      const { dataListSelected } = yield select(({ reportDetail }) => reportDetail);
      const tt = dataListSelected.map(v => v.id);

      yield put({
        type: 'updateState',
        payload: {
          projectAllMemberList: Array(data.rows)
            ? data.rows.map(v => {
                if (tt.includes(v.id)) {
                  return { ...v, ...dataListSelected.filter(item => item.id === v.id)[0] };
                }
                return v;
              })
            : [],
        },
      });

      return Array(data.rows)
        ? data.rows.map(v => {
            if (tt.includes(v.id)) {
              return { ...v, ...dataListSelected.filter(item => item.id === v.id)[0] };
            }
            return v;
          })
        : [];
    },

    // 项目计划列表
    *projectPlanList({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(projectPlanListRq, payload);

      yield put({
        type: 'updateState',
        payload: { projectPlanList: data },
      });

      return data;
    },
    // 项目计划编辑
    *dailyIncrease({ payload }, { call, put, select }) {
      const { ...params } = payload;

      let data = {};
      if (!fromQs().id) {
        const { data: datum } = yield outputHandle(dailyIncreaseRq, params, 'reportDetail/success');
        data = datum;
        message({ type: 'success' });

        if (data.id) {
          const { id } = data;
          const { projectId, phaseId } = fromQs();
          router.push(
            `/workTable/projectMgmt/noticeList/reportDetail?id=${id}&projectId=${projectId}&phaseId=${phaseId}&sourceType=REPORT&scene=DAILY_REPORT&mode=EDIT`
          );
        } else {
          createMessage({ type: 'error', description: '后端未返回主数据Id' });
        }
      } else {
        const { data: datum } = yield outputHandle(dailyOverallRq, params, 'reportDetail/success');
        data = datum;
        message({ type: 'success' });

        if (params.commitFlag) {
          closeThenGoto('/workTable/projectMgmt/noticeList');
        } else {
          yield put({
            type: 'dailyPlanDetail',
            payload: {
              id: fromQs().id,
            },
          });
        }
      }
      return data;
    },

    // 综合详情
    *dailyDetail({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(dailyDetailRq, payload);
      return data;
    },

    // 报告详情
    *dailyReportDetail({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(dailyReportDetailRq, payload);

      yield put({
        type: 'updateForm',
        payload: {
          ...data,
          commitUser: Array.from(new Set([data.pmResId, data.inchargeBuResId])),
          remarkReport: data.remarkPlan,
        },
      });

      const { memberViews = [], planViews = [] } = data;
      yield put({
        type: 'updateState',
        payload: {
          // dataListSelected: Array.isArray(memberViews)
          //   ? memberViews.map(v => ({ ...v, id: v.projectMemberId }))
          //   : [],
          relatedPlanList: Array.isArray(planViews)
            ? planViews.map((item, index) => ({
                ...item,
                sortNo: index + 1,
                progress: item.executeStatus === 'FINISHED' ? 100 : item.progress || 0,
              }))
            : [],
        },
      });

      return data;
    },

    // 计划详情-作为报告初始值
    *dailyPlanDetail({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(dailyPlanDetailRq, payload);

      const {
        scheduleConfigurableField1,
        scheduleConfigurableField2,
        scheduleConfigurableField3,
        scheduleConfigurableField4,
        scheduleConfigurableField5,
        scheduleConfigurableField6,
        scheduleConfigurableField7,
      } = data;
      yield put({
        type: 'updateForm',
        payload: {
          ...data,
          commitUser: Array.from(new Set([data.pmResId, data.inchargeBuResId])),
          reportConfigurableField1: scheduleConfigurableField1,
          reportConfigurableField2: scheduleConfigurableField2,
          reportConfigurableField3: scheduleConfigurableField3,
          reportConfigurableField4: scheduleConfigurableField4,
          reportConfigurableField5: scheduleConfigurableField5,
          reportConfigurableField6: scheduleConfigurableField6,
          reportConfigurableField7: scheduleConfigurableField7,
          remarkReport: data.remarkPlan,
        },
      });

      const { memberViews = [], planViews = [] } = data;
      yield put({
        type: 'updateState',
        payload: {
          // dataListSelected: Array.isArray(memberViews)
          //   ? memberViews.map(v => ({
          //     ...v,
          //     id: v.projectMemberId,
          //     reportConfigurableField1: v.scheduleConfigurableField1,
          //     reportConfigurableField2: v.scheduleConfigurableField2,
          //     reportConfigurableField3: v.scheduleConfigurableField3,
          //   }))
          //   : [],
          relatedPlanList: Array.isArray(planViews)
            ? planViews.map((item, index) => ({
                ...item,
                sortNo: index + 1,
                progress: item.executeStatus === 'FINISHED' ? 100 : 0,
              }))
            : [],
        },
      });

      return data;
    },
    // 成员组别
    *getMemberGroup({ payload }, { call, put, select }) {
      const { data = [] } = yield outputHandle(customSelectionListByKey, payload);
      yield put({
        type: 'updateState',
        payload: {
          memberGroupList: data.map(item => ({
            ...item,
            value: item.selectionValue,
            title: item.selectionName,
          })),
        },
      });
      return data.map(item => ({
        ...item,
        value: item.selectionValue,
        title: item.selectionName,
      }));
    },

    // 获取配置字段
    *getPageConfig({ payload }, { call, put, select }) {
      const { status, response } = yield call(businessPageDetailByNo, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            pageConfig: response.configInfo || {},
          },
        });
        return response;
      }
      return {};
    },

    *init({ payload }, { put, select }) {
      const { id, copy = false } = payload;
      if (!id) {
        return;
      }
      const { data } = yield outputHandle(projectPlanDetailRq, { id });
      // 当为复制时,处理id为null
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      yield put({
        type: 'updateState',
        payload: {
          formData: { ...data, ...copyObj },
        },
      });
    },

    *success({ payload }, { put, select }) {
      // 弹出操作成功,操作失败无需写代码,outputHandle已处理
      message({ type: 'success' });

      // 页面变为详情模式，更新数据
      yield put({
        type: 'updateState',
        payload: {
          formMode: 'DESCRIPTION',
        },
      });

      // 赋值
      yield put({
        type: 'init',
        payload,
      });
    },
  },

  reducers: {
    ...commonModelReducers(defaultState),

    // updateFormForEditTable(state, { payload }) {
    //   const { formData } = state;
    //   const name = Object.keys(payload)[0];
    //   const element = payload[name];
    //   let newFormData;
    //   if (Array.isArray(element)) {
    //     element.forEach((ele, index) => {
    //       if (!isNil(ele)) {
    //         newFormData = update(formData, { [name]: { [index]: { $merge: ele } } });
    //       }
    //     });
    //   } else {
    //     newFormData = { ...formData, ...payload };
    //   }

    //   return {
    //     ...state,
    //     formData: newFormData,
    //   };
    // },
  },
};
