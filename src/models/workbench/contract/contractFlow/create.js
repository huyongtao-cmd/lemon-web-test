import {
  pcontractSaveRq,
  pcontractSubmitRq,
  pcontractRelatedDocsRq,
  pcontractDetailRq,
  rulesTemplateRulesDetailRq,
} from '@/services/workbench/contract';
import moment from 'moment';
import router from 'umi/router';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { commonModelReducers } from '@/utils/production/modelUtils';
import { outputHandle, OutputProps } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/production/stringUtil';
import { genFakeId } from '@/utils/mathUtils';

const defaultState = {
  formData: {
    relateDocumentList: [],
    currCode: 'CNY',
    contractStatus: 'CREATE',
    createTime: moment().format('YYYY-MM-DD'),
    docDelIds: [],
    fileList: [],
    attach: undefined,
    scan: undefined,
    attachments: [],
    scans: [],
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'EDIT',
  pcontractRelatedDocsList: [],
  pcontractRelatedDocsTotal: 0,
  contractRulesList: [],
};
export default {
  namespace: 'contractFlowCreate',

  state: defaultState,

  effects: {
    *rulesTemplatePagingRq({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(rulesTemplateRulesDetailRq, payload);
      yield put({
        type: 'updateState',
        payload: {
          contractRulesList: Array.isArray(data)
            ? data.map(v => ({ ...v, id: genFakeId(-1) }))
            : [],
        },
      });
    },

    *queryDetails({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(pcontractDetailRq, payload);

      const tt = Array.isArray(data.twPItemsViews)
        ? data.twPItemsViews.map(v => ({
            ...v,
            key: `${v.id || ''}-${v.type || ''}`,
            // disabled: !!v.relatedContractId,
          }))
        : [];

      const { attachments = [], scans = [] } = data;
      const attach = attachments && attachments.map(item => item.id);
      const scan = scans && scans.map(item => item.id);
      yield put({
        type: 'updateForm',
        payload: {
          ...data,
          effectiveStartDate: [data.effectiveStartDate, data.effectiveEndDate],
          relateDocumentList: tt,
          relateDocumentDesc: tt.map(v => v.key || '').join(','),
          attach,
          scan,
          attachments,
          scans,
        },
      });

      yield put({
        type: 'updateState',
        payload: {
          contractRulesList: Array.isArray(data.contractRules) ? data.contractRules : [],
        },
      });
    },

    *pcontractSave({ payload }, { call, put, select }) {
      const {
        effectiveStartDate: date,
        relateDocumentList,
        contractRulesList,
        docDelIds,
        ...params
      } = payload;
      if (Array.isArray(date) && (date[0] || date[1])) {
        [params.effectiveStartDate, params.effectiveEndDate] = date;
      }

      params.twPItemsViews = relateDocumentList;
      params.rulesIds = contractRulesList;

      const { data } = yield outputHandle(pcontractSaveRq, params, 'contractFlowCreate/success');

      // 此操作致死，增加页面五秒空白时长，暂未找到原因
      // yield put({
      //   type: 'updateForm',
      //   payload: data,
      // });

      message({ type: 'success' });

      if (!fromQs().id) {
        router.push(`/workTable/contractMgmt/contractCreate?id=${data.id}`);
      } else {
        yield put({
          type: 'queryDetails',
          payload: {
            id: fromQs().id,
          },
        });
      }

      return data;
    },

    *pcontractSubmit({ payload }, { call, put, select }) {
      const {
        effectiveStartDate: date,
        relateDocumentList,
        contractRulesList,
        ...params
      } = payload;
      if (Array.isArray(date) && (date[0] || date[1])) {
        [params.effectiveStartDate, params.effectiveEndDate] = date;
      }

      params.twPItemsViews = relateDocumentList;
      params.rulesIds = contractRulesList;

      const { data } = yield outputHandle(pcontractSubmitRq, params);

      message({ type: 'success' });
      closeThenGoto(`/user/flow/process?type=procs`);
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

    *pcontractRelatedDocs({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(pcontractRelatedDocsRq, payload);
      const { rows, total } = data;

      yield put({
        type: 'updateState',
        payload: {
          pcontractRelatedDocsTotal: total,
        },
      });

      return Array.isArray(rows)
        ? rows.map(v => ({
            ...v,
            key: `${v.id || ''}-${v.type || ''}`,
            disabled: !!v.relatedContractId,
          }))
        : [];
    },

    *init({ payload }, { put, select }) {
      const { id, copy = false } = payload;
      if (!id) {
        return;
      }
      const { data } = yield outputHandle(pcontractDetailRq, { id });
      // 当为复制时,处理id为null
      const copyObj = {};
      if (copy) {
        copyObj.id = undefined;
      }
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            ...data,
            ...copyObj,
          },
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
  },
};
