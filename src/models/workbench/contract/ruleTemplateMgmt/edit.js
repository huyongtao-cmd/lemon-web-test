import {
  rulesTemplateSaveRq,
  rulesTemplateOverallRq,
  rulesTemplateDetailRq,
} from '@/services/workbench/contract';
import {
  customSelectionListByKey, // 自定义选择项
  customSelectionCascader, // 自定义选择项级联选择
} from '@/services/production/system';
import { isEmpty, isNil } from 'ramda';
import router from 'umi/router';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { fromQs } from '@/utils/production/stringUtil';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/production/mathUtils';

const defaultState = {
  formData: {
    ruleDetail: [],
    isDisabled: true, // true是有效，false是无效
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  deleteKeys: [],
  associatedObjectClass1List: [],
  associatedObjectClass2List: [],
};
export default {
  namespace: 'ruleTemplateEdit',

  state: defaultState,

  effects: {
    *queryAssociatedObjectClass2({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(customSelectionCascader, payload);

      yield put({
        type: 'updateState',
        payload: {
          associatedObjectClass2List: data.map(item => ({
            ...item,
            value: item.selectionValue,
            title: item.selectionName,
          })),
        },
      });
    },

    *queryAssociatedObjectClass1({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(customSelectionListByKey, { key: payload });

      yield put({
        type: 'updateState',
        payload: {
          associatedObjectClass1List: data.map(item => ({
            ...item,
            value: item.selectionValue,
            title: item.selectionName,
          })),
        },
      });
    },

    *queryDetails({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(rulesTemplateDetailRq, payload);

      yield put({
        type: 'updateForm',
        payload: {
          ...data,
          ruleDetail: Array.isArray(data.twRulesTemplatedList) ? data.twRulesTemplatedList : [],
        },
      });

      // 拉取关联对象、关联对象1、关联对象2对应数据
      if (data.associatedObjectExtVarchar1) {
        yield put({
          type: 'queryAssociatedObjectClass1',
          payload: data.associatedObjectExtVarchar1,
        });
        if (data.associatedObjectClass1) {
          yield put({
            type: 'queryAssociatedObjectClass2',
            payload: {
              key: data.associatedObjectExtVarchar1,
              cascaderValues: data.associatedObjectClass1,
            },
          });
        }
      }
    },

    *rulesTemplateOverall({ payload }, { call, put, select }) {
      const { ruleDetail, deleteKeys, ...restParams } = payload;

      restParams.ids = deleteKeys;

      const { data } = yield outputHandle(
        rulesTemplateOverallRq,
        restParams,
        'ruleTemplateEdit/success'
      );

      message({ type: 'success' });

      // if (!fromQs().id) {
      //   router.push(`/workTable/contractMgmt/ruleTemplateMgmt/edit?id=${data.id}`);
      // } else {
      //   yield put({
      //     type: 'queryDetails',
      //     payload: {
      //       id: fromQs().id,
      //     },
      //   });
      // }

      // 修改页面保存以后跳转至合同模板管理
      router.push(`/plat/projectTemp/ruleTemplateMgmt?refresh=${genFakeId(-1)}`);

      return data;
    },

    *rulesTemplateSave({ payload }, { call, put, select }) {
      const { ruleDetail, deleteKeys, ...restParams } = payload;

      restParams.ids = deleteKeys;

      const { data } = yield outputHandle(
        rulesTemplateSaveRq,
        restParams,
        'ruleTemplateEdit/success'
      );

      message({ type: 'success' });

      // if (!fromQs().id) {
      //   router.push(`/workTable/contractMgmt/ruleTemplateMgmt/edit?id=${data.id}`);
      // } else {
      //   yield put({
      //     type: 'queryDetails',
      //     payload: {
      //       id: fromQs().id,
      //     },
      //   });
      // }

      // 新增页面保存以后跳转至合同模板管理
      router.push(`/plat/projectTemp/ruleTemplateMgmt?refresh=${genFakeId(-1)}`);

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

    *init({ payload }, { put, select }) {
      const { id, copy = false } = payload;
      if (!id) {
        return;
      }
      const { data } = yield outputHandle(rulesTemplateDetailRq, { id });
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
