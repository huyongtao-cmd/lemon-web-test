import {
  projectMemberPageRq,
  weeklyIncreaseRq,
  weeklyOverallRq,
  weeklyDetailRq,
} from '@/services/workbench/project';
import moment from 'moment';
import router from 'umi/router';
import createMessage from '@/components/core/AlertMessage';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/production/stringUtil';
import { genFakeId } from '@/utils/mathUtils';
import { isEmpty, isNil, omit, type } from 'ramda';
import update from 'immutability-helper';

const defaultState = {
  formData: {
    weeklyStatus: 'CREATE',
    actorsFinishWorkList: [],
    createTime: moment().format('YYYY-MM-DD hh:mm:ss'),
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'DESCRIPTION',
  projectMemberList: [],

  thisWeekWorkList: [],
  allDoneWorkList: [],

  actorsFinishWorkDeleteKeys: [],
  weeklyDetailViews: [], // 项目下演员完成度详情
};
export default {
  namespace: 'weeklyListDetails',

  state: defaultState,

  effects: {
    // 项目计划编辑
    *weeklyEdit({ payload }, { call, put, select }) {
      const { ...params } = payload;

      let data = {};
      if (!fromQs().id) {
        const { data: datum } = yield outputHandle(
          weeklyIncreaseRq,
          params,
          'weeklyListEdit/success'
        );
        data = datum;
        message({ type: 'success' });

        if (data.id) {
          const { id } = data;
          router.push(`/workTable/projectMgmt/weeklyList/edit?id=${id}&mode=EDIT`);
        } else {
          createMessage({ type: 'error', description: '后端未返回主数据Id' });
        }
      } else {
        const { data: datum } = yield outputHandle(
          weeklyOverallRq,
          params,
          'weeklyListEdit/success'
        );
        data = datum;
        message({ type: 'success' });

        yield put({
          type: 'weeklyDetail',
          payload: {
            id: fromQs().id,
          },
        });
      }
      return data;
    },
    // 项目计划详情
    *weeklyDetail({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(weeklyDetailRq, payload);

      const {
        detailView,
        reportDateFrom,
        reportDateTo,
        createTime,
        weeklyScheduleStatisticsField1 = 0,
        weeklyReportStatisticsField1 = 0,
        weeklyScheduleStatisticsField2 = 0,
        weeklyReportStatisticsField2 = 0,
        weeklyRemainingWork = '',
        totalScheduleStatisticsField1 = 0,
        totalReportStatisticsField1 = 0,
        totalScheduleStatisticsField2 = 0,
        totalReportStatisticsField2 = 0,
      } = data;
      yield put({
        type: 'updateForm',
        payload: {
          ...data,
          shootingDate: [reportDateFrom, reportDateTo],
          actorsFinishWorkList: detailView,
          createTime: moment(createTime).format('YYYY-MM-DD hh:mm:ss'),
        },
      });

      yield put({
        type: 'updateState',
        payload: {
          thisWeekWorkList: [
            {
              id: genFakeId(-1),
              weeklyScheduleStatisticsField1,
              weeklyReportStatisticsField1,
              weeklyScheduleStatisticsField2,
              weeklyReportStatisticsField2,
              weeklyRemainingWork,
            },
          ],
          allDoneWorkList: [
            {
              id: genFakeId(-1),
              totalScheduleStatisticsField1,
              totalReportStatisticsField1,
              totalScheduleStatisticsField2,
              totalReportStatisticsField2,
            },
          ],
          actorsFinishWorkList: [],
        },
      });

      return data;
    },

    // 项目成员
    *projectMemberPage({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(projectMemberPageRq, payload);
      yield put({
        type: 'updateState',
        payload: {
          projectMemberList: Array.isArray(data.rows)
            ? data.rows.map(item => ({
                ...item,
                value: item.id,
                title: item.memberName,
              }))
            : [],
        },
      });
      return Array.isArray(data.rows)
        ? data.rows.map(item => ({
            ...item,
            value: item.id,
            title: item.memberName,
          }))
        : [];
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
      const { data } = yield outputHandle(weeklyDetailRq, { id });
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

    updateFormForEditTable(state, { payload }) {
      const { formData } = state;
      const name = Object.keys(payload)[0];
      const element = payload[name];
      let newFormData;
      if (Array.isArray(element) && !element.filter(v => type(v) !== 'Object').length) {
        element.forEach((ele, index) => {
          if (!isNil(ele)) {
            newFormData = update(formData, { [name]: { [index]: { $merge: ele } } });
          }
        });
      } else {
        newFormData = { ...formData, ...payload };
      }

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
