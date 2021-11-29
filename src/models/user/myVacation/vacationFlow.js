import {
  vacationResDetailRq,
  vacationApplyRq,
  vacationFlowDetailRq,
  vacationFlowRq,
} from '@/services/user/myVacation/vacationFlow';
import { closeFlowRq } from '@/services/user/flow/flow';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { queryUserPrincipal } from '@/services/gen/user';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { closeThenGoto } from '@/layouts/routerControl';
import { getViewConf } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { isEmpty, isNil } from 'ramda';
import moment from 'moment';
import { sub, genFakeId } from '@/utils/mathUtils';

export default {
  namespace: 'vacationFlow',

  state: {
    formData: {},
    resData: [],
    baseBuData: [],
    dataSource: [],
    resVacationList: [],
    recentResVacationList: [],
    detailEntityList: [],
    delList: [],
    flowForm: {
      remark: undefined,
      dirty: false,
    },
    fieldsConfig: {
      buttons: [],
      panels: {
        disabledOrHidden: {},
      },
    },
  },

  effects: {
    *submit({ payload }, { call, put, select }) {
      const { formData, detailEntityList, delList } = yield select(
        ({ vacationFlow }) => vacationFlow
      );

      const { date } = formData;
      if (Array.isArray(date) && !isEmpty(date.filter(v => isNil(v) || isEmpty(v)))) {
        createMessage({ type: 'warn', description: '请选择请假开始结束日期' });
        return;
      }
      if (Array.isArray(date) && date[0] && date[1]) {
        // eslint-disable-next-line
        formData.startDate = date[0];
        // eslint-disable-next-line
        formData.endDate = date[1];
      }

      // 判断只有调休和年假需要勾选剩余假期
      const { maxDays, vacationDays, vacationId, vacationType, selectedVacationType } = formData;
      if (vacationType === 'ANNUAL' || vacationType === 'IN_LIEU') {
        if (!vacationId) {
          createMessage({ type: 'warn', description: '请选择一条剩余假期' });
          return;
        }
        // if (selectedVacationType !== vacationType) {
        //   createMessage({ type: 'warn', description: '勾选剩余假期类型与所选假期类型不一致' });
        //   return;
        // }
        // if (Number(vacationDays) > Number(maxDays)) {
        //   createMessage({ type: 'warn', description: '请假天数不能超过所选剩余假期可用天数' });
        //   return;
        // }
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

      const parmars = { ...formData, detailEntityList: detailArr, delList, ...payload };

      const { status, response } = yield call(vacationFlowRq, parmars);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '操作成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程审批失败' });
      }
    },
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(vacationFlowDetailRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response && response.ok) {
          const data = response.datum || {};
          const { startDate, endDate } = data.resVacationApply;
          yield put({
            type: 'updateForm',
            payload: {
              ...data.resVacationApply,
              date: [startDate, endDate],
              selectedVacationType: !isEmpty(
                data.resVacationList.filter(v => v.id === data.resVacationApply.vacationId)
              )
                ? data.resVacationList.filter(v => v.id === data.resVacationApply.vacationId)[0]
                    .vacationType
                : null,
              vacationEndDate:
                data.resVacationApply.detailViewList[
                  data.resVacationApply.detailViewList.length - 1
                ].vdate,
              vacationDeadLine: !isEmpty(
                data.resVacationList.filter(v => v.id === data.resVacationApply.vacationId)
              )
                ? data.resVacationList.filter(v => v.id === data.resVacationApply.vacationId)[0]
                    .expirationDate
                : null,
            },
          });

          // 将返回的请假明细转为所需要的格式
          const daysArr = data.resVacationApply.detailViewList;
          const monthsArr = [];
          const monthDiff = moment(moment(endDate).format('YYYY-MM')).diff(
            moment(moment(startDate).format('YYYY-MM')),
            'months'
          );
          for (let i = 0; i <= monthDiff; i += 1) {
            const Emonth = moment(moment(startDate).format('YYYY-MM'))
              .add(i, 'month')
              .format('YYYY-MM');
            const tt = genFakeId();
            const arr1 = daysArr.filter(v => v.vmonth === Emonth);
            arr1.forEach(v => {
              // eslint-disable-next-line no-param-reassign
              v.keyId = `${tt}-${genFakeId()}`;
            });

            monthsArr.push({
              keyId: tt,
              Emonth,
              Edays: daysArr
                .filter(v => v.vmonth === Emonth)
                .reduce((x, y) => x + Number(y.vdays), 0)
                .toFixed(1),
              children1: arr1,
            });
          }

          yield put({
            type: 'updateState',
            payload: {
              resVacationList: data.resVacationList,
              detailEntityList: monthsArr,
              recentResVacationList: data.recentResVacationList,
            },
          });
        } else {
          createMessage({
            type: 'error',
            description: response.reason || '获取详细信息失败',
          });
        }
      }
    },
    *fetchConfig({ payload }, { call, put }) {
      const { status, response } = yield call(getViewConf, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsConfig: isEmpty(response)
              ? {
                  buttons: [],
                  panels: {
                    disabledOrHidden: {},
                  },
                }
              : response,
            flowForm: {
              remark: undefined,
              dirty: false,
            },
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || 'config获取失败' });
      return {};
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
    *closeFlow({ payload }, { call, put, select }) {
      const { status, response } = yield call(closeFlowRq, payload);
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        createMessage({ type: 'success', description: '流程关闭成功' });
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      } else {
        createMessage({ type: 'error', description: response.reason || '流程关闭失败' });
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
