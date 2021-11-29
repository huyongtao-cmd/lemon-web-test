import {
  expenseQuotaSaveRq,
  expenseQuotaOverallRq,
  expenseQuotaDetailRq,
  expenseQuotaDDetailRq,
  expenseQuotaDSaveRq,
  expenseQuotaDOverallRq,
  expenseQuotaDDeleteRq,
  relatedDimensionsRq,
} from '@/services/workbench/reimQuotaMgmt';
import {
  customSelectionListByKey, // 自定义选择项
  customSelectionCascader, // 自定义选择项级联选择
} from '@/services/production/system';
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

const defaultState = {
  formData: {
    quotaStatus: true,
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  dataList: [],
  modalformdata: {},
  visible: false,
  relatedDimensionsList: [],
  dimension1List: [],
  dimension2List: [],
};
export default {
  namespace: 'reimQuotaMgmtEdit',

  state: defaultState,

  effects: {
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

    *queryDimension2({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(customSelectionListByKey, payload);

      yield put({
        type: 'updateState',
        payload: {
          dimension2List: data.map(item => ({
            ...item,
            value: item.selectionValue,
            title: item.selectionName,
          })),
        },
      });
    },

    *queryDimension1({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(customSelectionListByKey, payload);

      yield put({
        type: 'updateState',
        payload: {
          dimension1List: data.map(item => ({
            ...item,
            value: item.selectionValue,
            title: item.selectionName,
          })),
        },
      });
    },

    *relatedDimensions({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(relatedDimensionsRq, payload);

      yield put({
        type: 'updateState',
        payload: {
          relatedDimensions: data,
        },
      });
    },

    *expenseQuotaDDelete({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(expenseQuotaDDeleteRq, payload);

      message({ type: 'success' });

      yield put({
        type: 'expenseQuotaDetail',
        payload: {
          id: fromQs().id,
        },
      });
    },

    *expenseQuotaDDetail({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(expenseQuotaDDetailRq, payload);
      yield put({
        type: 'updateState',
        payload: {
          dataList: Array.isArray(data) ? data : [],
        },
      });
    },

    *expenseQuotaDOverall({ payload }, { call, put, select }) {
      const { quotaDimension1Value, quotaDimension2Value, ...params } = payload;

      params.quotaDimension1Value = quotaDimension1Value && quotaDimension1Value.join(',');
      params.quotaDimension2Value = quotaDimension2Value && quotaDimension2Value.join(',');

      const { data } = yield outputHandle(
        expenseQuotaDOverallRq,
        params,
        'reimQuotaMgmtEdit/success'
      );

      message({ type: 'success' });

      yield put({
        type: 'updateState',
        payload: {
          visible: false,
        },
      });

      yield put({
        type: 'expenseQuotaDetail',
        payload: {
          id: fromQs().id,
        },
      });

      return data;
    },

    *expenseQuotaDSave({ payload }, { call, put, select }) {
      const { quotaDimension1Value, quotaDimension2Value, ...params } = payload;

      params.quotaDimension1Value = quotaDimension1Value && quotaDimension1Value.join(',');
      params.quotaDimension2Value = quotaDimension2Value && quotaDimension2Value.join(',');

      const { id } = payload;
      let data = {};
      if (id) {
        const { data: datum } = yield outputHandle(
          expenseQuotaDOverallRq,
          params,
          'reimQuotaMgmtEdit/success'
        );
        data = datum;
      } else {
        const { data: datum } = yield outputHandle(
          expenseQuotaDSaveRq,
          params,
          'reimQuotaMgmtEdit/success'
        );
        data = datum;
      }

      message({ type: 'success' });

      yield put({
        type: 'updateState',
        payload: {
          visible: false,
        },
      });

      yield put({
        type: 'expenseQuotaDetail',
        payload: {
          id: fromQs().id,
        },
      });

      return data;
    },

    *expenseQuotaSave({ payload }, { call, put, select }) {
      const { ...params } = payload;

      let data = {};
      if (!fromQs().id) {
        const { data: datum } = yield outputHandle(
          expenseQuotaSaveRq,
          params,
          'reimQuotaMgmtEdit/success'
        );
        data = datum;
        message({ type: 'success' });

        if (data.id) {
          router.push(`/workTable/reimburseMgmt/reimQuotaMgmt/edit?id=${data.id}`);
        } else {
          createMessage({ type: 'error', description: '后端未返回主数据Id' });
        }
      } else {
        const { data: datum } = yield outputHandle(
          expenseQuotaOverallRq,
          params,
          'reimQuotaMgmtEdit/success'
        );
        data = datum;
        message({ type: 'success' });

        yield put({
          type: 'expenseQuotaDetail',
          payload: {
            id: fromQs().id,
          },
        });

        //保存跳转至报销额度管理
        closeThenGoto(`/plat/financial/reimQuotaMgmt?refresh=${genFakeId(-1)}`);
      }
    },

    *expenseQuotaDetail({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(expenseQuotaDetailRq, payload);

      const { detailView, ...parmars } = data;
      yield put({
        type: 'updateForm',
        payload: parmars,
      });
      yield put({
        type: 'updateState',
        payload: {
          dataList: detailView,
        },
      });

      const { quotaVal1, quotaVal2 } = data;
      if (quotaVal1) {
        yield put({
          type: 'queryDimension1',
          payload: {
            key: quotaVal1,
          },
        });
      }

      if (quotaVal2) {
        yield put({
          type: 'queryDimension2',
          payload: {
            key: quotaVal2,
          },
        });
      }
    },

    *init({ payload }, { put, select }) {
      const { id, copy = false } = payload;
      if (!id) {
        return;
      }
      const { data } = yield outputHandle(expenseQuotaDetailRq, { id });
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

    updateFlowForm(state, { payload }) {
      const { flowForm } = state;
      const newFlowForm = { ...flowForm, ...payload };
      return {
        ...state,
        flowForm: newFlowForm,
      };
    },
    updateModalForm(state, { payload }) {
      const { modalformdata } = state;
      const newFormData = { ...modalformdata, ...payload };
      return {
        ...state,
        modalformdata: newFormData,
      };
    },
  },
};
