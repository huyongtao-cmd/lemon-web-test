import {
  queryBuTree,
  findbuAcc,
  createLinmon,
  findButemplates,
  offerApplyRq,
} from '@/services/org/bu/bu';
import { businessPageDetailByNo } from '@/services/sys/system/pageConfig';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { queryUserPrincipal } from '@/services/gen/user';
import { getOfferAndResDetailsRq } from '@/services/plat/res/resprofile';
import { pushFlowTask } from '@/services/gen/flow';
import { isEmpty, isNil } from 'ramda';
import { getUrl } from '@/utils/flowToRouter';
import moment from 'moment';

export default {
  namespace: 'orgbuCreateLinmon',

  state: {
    createData: {
      buNo: null, // BU编号
      pid: null,
      buTmplId: null,
      tmplNo: null, // bu模板编号
      sumBuId: null, // 汇总BU
      buName: null,
      buType: null,
      beginPeriodId: null,
      currCode: null,
      inchargeResId: null,
      contactDesc: null,
      ouId: null, // 所属公司
      remark: null,

      regionCode: null,
      settleType: null, // 结算类别码
      buCat1: null,
      buCat2: null,
      buCat3: null,
      buCat4: null,
      buCat5: null,
      buCat6: null,
      buCat7: null,
      buCat8: null,
      buCat9: null,
      buCat10: null,
      buCat11: null,
      buCat12: null,
      buCat13: null,
      buCat14: null,
      buCat15: null,
      buCat16: null,
      buCat17: null,
      buCat18: null,
      buCat19: null,
      buCat20: null,

      // accTmplId: null,
      // buNo: null,
      // buStatus: null,
      // busiPeriodId: null,
      // finCalendarId: null,
      // finPeriodId: null,
      // id: null,
    },
    buTree: [],
    buTemplates: [],
    total: 0,
    pageConfig: {},
  },

  effects: {
    *create({ payload }, { call, put, select }) {
      const { createData } = yield select(({ orgbuCreateLinmon }) => orgbuCreateLinmon);
      if (createData.remark && createData.remark.length > 200) {
        createMessage({ type: 'error', description: '备注文字过长' });
        return;
      }
      if (createData && createData.buType === 'BM' && !createData.buNo) {
        createMessage({ type: 'warn', description: '请输入BU编号' });
        return;
      }
      // 为了做数据保存，把 tmplName、 pName 放在了 form 里面，看原来代码的意思是不要上传这个数据？这里就拿出来了。。
      const { tmplName, pName, sumBuName, ...restData } = createData;
      const { response, status } = yield call(createLinmon, restData);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: response.reason || '保存成功' });
        closeThenGoto('/workTable/buManage/master');
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    *offerApply({ payload }, { call, put, select }) {
      const { status, response } = yield call(offerApplyRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      const { offerFrom } = fromQs();
      if (response.ok) {
        createMessage({ type: 'success', description: response.reason || '提交成功' });
        const url = offerFrom.replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
        closeThenGoto(offerFrom);
      }
    },
    *pushFlowTask({ payload }, { call, put }) {
      const { taskId, offerFrom, remark } = fromQs();
      const { status: apprSts, response } = yield call(pushFlowTask, taskId, payload);
      if (apprSts === 200 && response.ok) {
        createMessage({ type: 'success', description: '提交成功' });
        const url = offerFrom.replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程创建失败' });
      }
    },
    *queryBuTree({ payload }, { call, put }) {
      const { response } = yield call(queryBuTree);
      yield put({
        type: 'updateState',
        payload: {
          buTree: Array.isArray(response) ? response : [],
        },
      });
    },

    *querySubjtemplates({ payload }, { call, put }) {
      const { response } = yield call(findButemplates, {
        ...payload,
        condition: payload.searchInputValue,
        tmplStatus: 'ACTIVE',
      });
      yield put({
        type: 'updateState',
        payload: {
          buTemplates: Array.isArray(response.rows) ? response.rows : [],
          total: response.total,
        },
      });
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
      };
      const { status: sts, response: resp } = yield call(getOfferAndResDetailsRq, payload);
      if (sts === 100) {
        // 主动取消请求
        return;
      }
      const { response: buTmpRes = {} } = yield call(findButemplates, { tmplType: 'SALES' }); // 查询销售类bu目标的id
      const { id: buTmplId, tmplName = '销售类BU', tmplType = 'SALES' } = buTmpRes?.rows[0];
      if (sts === 200) {
        if (resp && resp.ok) {
          const data = resp.datum || {};
          const {
            baseBuId: pid, // 父级Bu->入职资源的BaseBuId
            baseBuName: pName, // 父级Bu->入职资源的BaseBu
            baseBuId: sumBuId, // 汇总Bu->入职资源的BaseBuId
            baseBuName: sumBuName, // 汇总Bu->入职资源的BaseBu
            resId: inchargeResId, // 负责人->入职资源
            resName: inchargeResName, // 负责人->入职资源
            ouId, // 所属公司->入职资源的所属公司
          } = data;
          yield put({
            type: 'updateState',
            payload: {
              createData: {
                pid, // 父级Bu->入职资源的BaseBuId
                pName, // 父级Bu->入职资源的BaseBu
                buTmplId, // 模板名称->销售类BU ？？？？// 给bu模板一个初始值？
                tmplName, // 模板ID->销售类BU
                tmplType,
                sumBuId, // 汇总Bu->入职资源的BaseBuId
                sumBuName, // 汇总Bu->入职资源的BaseBu
                buType: 'BS', // Bu类型->销售BU
                // beginPeriodId: moment().format('YYYY-MM'), // 业务开始年期->当前年月
                inchargeResId, // 负责人->入职资源
                inchargeResName, // 负责人->入职资源
                ouId, // 所属公司->入职资源的所属公司
                settleType: 'EL', // 费用结算码类型->EL
                buCat6: 'NON_SALES_REGION', // 类别码6
                buCat7: '1', // 类别7默认是。是udc。不是固定id
              },
            },
          });
        } else {
          const message = resp.reason || '获取详细信息失败';
          createMessage({ type: 'warn', description: message });
        }
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
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateForm(state, { payload }) {
      const { createData } = state;
      const newFormData = { ...createData, ...payload };
      return {
        ...state,
        createData: newFormData,
      };
    },
    clearForm(state, { payload }) {
      return {
        ...state,
        createData: {},
      };
    },
  },
};
