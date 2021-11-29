import {
  pcontractSaveRq,
  pcontractSubmitRq,
  pcontractRelatedDocsRq,
  pcontractDetailRq,
} from '@/services/workbench/contract';
import { queryUserPrincipal } from '@/services/gen/user';
import { findResById } from '@/services/plat/businessCard/businessCard';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, isNil } from 'ramda';
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
    attachments: [],
    attach: undefined,
    scans: [],
    scan: undefined,
  },
  pageConfig: {
    pageBlockViews: [],
  },
  formMode: 'DESCRIPTION',
  pcontractRelatedDocsList: [],
  pcontractRelatedDocsTotal: 0,
  contractRulesList: [],
};
export default {
  namespace: 'contractListDetail',

  state: defaultState,

  effects: {
    *queryDetails({ payload }, { call, put, select }) {
      const { data } = yield outputHandle(pcontractDetailRq, payload);

      const tt = Array.isArray(data.twPItemsViews)
        ? data.twPItemsViews.map(v => ({
            ...v,
            key: `${v.id || ''}-${v.type || ''}`,
            // disabled: !!v.relatedContractId,
          }))
        : [];

      const { attachments, scans } = data;
      const attach = attachments.map(item => item.id);
      const scan = scans.map(item => item.id);
      yield put({
        type: 'updateForm',
        payload: {
          attach,
          scan,
          attachments,
          scans,
          ...data,
          effectiveStartDate:
            data.effectiveStartDate !== null &&
            data.effectiveEndDate !== null &&
            data.effectiveStartDate + '~' + data.effectiveEndDate,
          relateDocumentList: tt,
          relateDocumentDesc: tt.map(v => v.type + '-' + v.no + '-' + v.name || '').join(','),
        },
      });

      yield put({
        type: 'updateState',
        payload: {
          contractRulesList: Array.isArray(data.contractRules) ? data.contractRules : [],
        },
      });
    },

    // *queryDetails({ payload }, { call, put, select }) {
    //   const { data } = yield outputHandle(pcontractDetailRq, payload);

    //   yield put({
    //     type: 'updateForm',
    //     payload: {
    //       ...data,
    //       effectiveStartDate: [data.effectiveStartDate, data.effectiveEndDate],
    //       relateDocumentList: Array.isArray(data.twPItemsViews)
    //         ? data.twPItemsViews.map(v => ({
    //           ...v,
    //           key: `${v.id || ''}-${v.type || ''}`,
    //           disabled: !!v.relatedContractId,
    //         }))
    //         : [],
    //       contractRules: Array.isArray(data.contractRules) ? data.contractRules : [],
    //       relateDocumentDesc: Array.isArray(data.twPItemsViews)
    //         ? data.twPItemsViews.map(v => `${v.id || ''}-${v.type || ''}`).join(',')
    //         : '',
    //     },
    //   });
    // },

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
