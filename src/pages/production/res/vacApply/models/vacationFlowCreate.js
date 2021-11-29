import {
  vacationResDetailRq,
  vacationApplyRq,
} from '@/services/production/res/vacation/vacationFlow';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { queryUserPrincipal } from '@/services/gen/user';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { customSelectionListByKey } from '@/services/production/system';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { isNil, isEmpty } from 'ramda';
import moment from 'moment';
import { outputHandle } from '@/utils/production/outputUtil';

export default {
  namespace: 'vacationFlowCreateNew',

  state: {
    formData: {},
    resData: [],
    baseBuData: [],
    dataSource: [],
    resVacationList: [],
    recentResVacationList: [],
    detailEntityList: [],
  },

  effects: {
    *fetchInternalOuList({ payload }, { put, select }) {
      const {
        user: { extInfo = {} },
        formData: { chargeCompany, id },
      } = yield select(({ user, vacationFlowCreateNew }) => ({
        ...user,
        ...vacationFlowCreateNew,
      }));
      const output = yield outputHandle(customSelectionListByKey, {
        key: 'CUS:INTERNAL_COMPANY',
      });
      const list = output.data.map(item => ({
        ...item,
        value: item.selectionValue,
        title: item.selectionName,
      }));
      if (!chargeCompany) {
        let chargeCompany2;
        const chargeCompanyList = list.filter(item => item.extVarchar1 === extInfo.ouAbNo);
        if (chargeCompanyList && chargeCompanyList.length > 0) {
          chargeCompany2 = chargeCompanyList[0].value;
        }
        yield put({
          type: 'updateForm',
          payload: {
            company: chargeCompany2,
          },
        });
      }
    },
    *queryUserPrincipal({ payload }, { call, put, select }) {
      const { status, response } = yield call(queryUserPrincipal);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (!response.extInfo) {
          createMessage({ type: 'warn', description: '未获得账号资源ID,请联系系统管理员！' });
          return;
        }
        const { resId, resName, ouId, baseBuId } = response.extInfo || {};

        yield put({
          type: 'queryResDetail',
          payload: { resId },
        });
        yield put({
          type: 'updateForm',
          payload: {
            apprResId: isNil(resId) ? undefined : resId + '',
            resId,
            apprResName: resName,
            ouId,
            buId: baseBuId,
            apprDate: moment().format('YYYY-MM-DD'),
            submit: 'true',
          },
        });
      } else {
        createMessage({ type: 'error', description: '获取资源信息失败' });
      }
    },
    *queryResDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(vacationResDetailRq, payload);
      const { formData } = yield select(({ vacationFlowCreateNew }) => vacationFlowCreateNew);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response && response.ok) {
          const data = response.data || {};
          const { apprResId, apprDate, apprResName, ...newFormData } = data.resVacationApply;
          yield put({
            type: 'updateForm',
            payload: { ...newFormData, ...formData },
          });
          yield put({
            type: 'updateState',
            payload: {
              resVacationList: data.resVacationList,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取资源详情失败' });
        }
      }
    },

    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resData: list,
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
        },
      });
    },
    *clean({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {},
          detailEntityList: [],
        },
      });
    },
    *submit({ payload }, { call, put, select }) {
      const { formData, detailEntityList, resVacationList } = yield select(
        ({ vacationFlowCreateNew }) => vacationFlowCreateNew
      );
      const { date } = formData;
      if (Array.isArray(date) && date[0] && date[1]) {
        // eslint-disable-next-line
        formData.startDate = date[0];
        // eslint-disable-next-line
        formData.endDate = date[1];
      }
      // 将请假明细转为一维数组
      let detailArr = [];
      detailEntityList.forEach(item => {
        detailArr = detailArr.concat(item.children1);
      });

      // 请假天数以0.5天为最小单位
      const errorArr = detailArr.filter(v => v.vdays % 0.5 !== 0);
      if (!isEmpty(errorArr)) {
        createMessage({ type: 'warn', description: '请假明细以0.5天为最小单位' });
        return;
      }

      // 请假结束日期，不能大于所选假期有效期
      const { vacationDeadLine } = formData;
      const vacationEndDate = detailArr[detailArr.length - 1].vdate;
      if (vacationDeadLine && vacationEndDate) {
        if (moment(vacationEndDate).isAfter(moment(vacationDeadLine))) {
          createMessage({
            type: 'warn',
            description: `请假日期不能超过所选假期的有效期${vacationDeadLine}`,
          });
          return;
        }
      }

      const { id, ...newFormData } = formData;
      const parmars = { ...newFormData, detailEntityList: detailArr };

      // 判断只有调休和年假需要勾选剩余假期
      const {
        maxDays,
        vacationDays,
        vacationId,
        vacationType,
        selectedVacationType,
        canUseDayItem = {},
      } = formData;
      const { startDate, expirationDate } = canUseDayItem;
      if (vacationType === 'ANNUAL') {
        if (!resVacationList.length) {
          createMessage({ type: 'warn', description: '当前无可用年假' });
          return;
        }
        if (!vacationId) {
          createMessage({ type: 'warn', description: '请选择一条剩余假期' });
          return;
        }

        // if (selectedVacationType !== vacationType) {
        //   createMessage({ type: 'warn', description: '勾选剩余假期类型与所选假期类型不一致' });
        //   return;
        // }
        // 检验改为后端可配置化检验
        if (Number(vacationDays) > Number(maxDays)) {
          createMessage({ type: 'warn', description: '请假天数不能超过所选剩余假期可用天数' });
          return;
        }
        if (startDate) {
          let flag = true;
          resVacationList.filter(v => v.vacationType === formData.vacationType).map(i => {
            if (
              moment(expirationDate).isAfter(moment(i.expirationDate)) &&
              (moment(i.expirationDate).isAfter(moment(formData.startDate)) ||
                i.expirationDate === formData.startDate) &&
              moment(formData.endDate).isAfter(moment(i.expirationDate))
            ) {
              flag = false;
              createConfirm({
                content: `${i.vacationYear}年度假期可分开申请使用，您确定继续提交该申请？`,
                onOk: () => {
                  vacationApplyRq(parmars).then(res => {
                    const { status, response } = res;
                    if (status === 100) {
                      // 主动取消请求
                      return;
                    }
                    if (response.ok) {
                      createMessage({ type: 'success', description: '操作成功' });
                      closeThenGoto(`/user/flow/process?type=procs`);
                    } else {
                      createMessage({
                        type: 'error',
                        // eslint-disable-next-line
                        description: response.data || '流程提交失败',
                      });
                    }
                  });
                },
              });
            } else if (
              moment(expirationDate).isAfter(moment(i.expirationDate)) &&
              (moment(i.expirationDate).isAfter(moment(formData.startDate)) ||
                i.expirationDate === formData.startDate)
            ) {
              flag = false;
              createMessage({
                type: 'warn',
                description: `请优先选择${i.vacationYear}年度的假期`,
              });
            }
            return true;
          });
          if (!flag) {
            return;
          }
        }
      }
      const { status, response } = yield call(vacationApplyRq, parmars);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        closeThenGoto(`/user/flow/process?type=procs`);
      } else {
        createMessage({
          type: 'error',
          // eslint-disable-next-line
          description: response.data || '流程提交失败',
        });
      }
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
