import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import update from 'immutability-helper';
import { isNil, isEmpty } from 'ramda';
import message from '@/components/production/layout/Message';
import { resSelectPaging } from '@/services/production/common/select';
import { projectMemberSaveRq, projectMemberOverallRq } from '@/services/workbench/project';
import { systemSelectionListByKey } from '@/services/production/system';

const defaultState = {
  formData: {},
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  visible: false,
  memberTypeList: [],
  tableInternalState: {},
  continueAddFlag: false,
  resourceList: [],
};
export default {
  namespace: 'projectMember',

  state: defaultState,

  effects: {
    *success({ payload }, { put, select }) {
      // 弹出操作成功,操作失败无需写代码,outputHandle已处理
      message({ type: 'success' });

      const {
        tableInternalState: { refreshData },
        continueAddFlag,
        formData: { memberType },
      } = yield select(({ projectMember }) => projectMember);
      if (continueAddFlag) {
        yield put({
          type: 'updateState',
          payload: {
            formData: {},
            visible: false,
          },
        });
        refreshData();
      } else {
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              memberType,
            },
          },
        });
      }
    },

    *getMemberType({ payload }, { put, select }) {
      const { data } = yield outputHandle(systemSelectionListByKey, payload);
      yield put({
        type: 'updateState',
        payload: {
          memberTypeList: Array.isArray(data) ? data : [],
        },
      });
    },

    *projectMemberEdit({ payload }, { call, put, select }) {
      const { ...params } = payload;

      let data = {};
      if (params.id) {
        const { data: datum } = yield outputHandle(
          projectMemberOverallRq,
          params,
          'projectMember/success'
        );
        data = datum || {};
      } else {
        const { data: datum } = yield outputHandle(
          projectMemberSaveRq,
          params,
          'projectMember/success'
        );
        data = datum || {};
      }

      message({ type: 'success' });

      return data;
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

    *ResourceId({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(resSelectPaging, payload);
      const resultOptions = data.rows.map(item => ({
        ...item,
        id: item.id,
        value: item.id,
        title: `${item.resNo}-${item.resName}`,
      }));
      yield put({
        type: 'updateState',
        payload: {
          resourceList: resultOptions,
        },
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
      if (Array.isArray(element)) {
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
  },
};
