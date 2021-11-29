import { vacationApplyList, vacationApplyDetailRq } from '@/services/production/res/vacation';
import createMessage from '@/components/core/AlertMessage';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import moment from 'moment';
import { sub, genFakeId } from '@/utils/mathUtils';

const defaultSearchForm = {};

export default {
  namespace: 'vacationApplyNew',
  state: {
    list: [],
    total: 0,
    searchForm: defaultSearchForm,
    resDataSource: [],
    baseBuDataSource: [],
    formData: {
      resVacationApply: {},
      recentResVacationList: [],
      resVacationList: [],
    },
    attachments: [],
    hrattachments: [],
    addattachments: [],
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { date, ...params } = payload;
      if (Array.isArray(date) && date[0] && date[1]) {
        [params.vdateStart, params.vdateEnd] = date;
      }
      const { response } = yield call(vacationApplyList, params);
      if (response) {
        const { rows, total } = response;
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(rows) ? rows : [],
            total,
          },
        });
      }
    },
    *bu({ payload }, { call, put }) {
      const { response } = yield call(selectBuMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          baseBuDataSource: list,
        },
      });
    },
    *res({ payload }, { call, put }) {
      const { response } = yield call(selectUserMultiCol);
      const list = Array.isArray(response) ? response : [];
      yield put({
        type: 'updateState',
        payload: {
          resData: list,
          resDataSource: list,
        },
      });
    },
    *queryDetail({ payload }, { call, put, select }) {
      const { status, response } = yield call(vacationApplyDetailRq, payload);
      const data = response.data || {};
      const { startDate, endDate } = data.resVacationApply;
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (status === 200) {
        if (response.ok) {
          const { attachments = [], hrattachments = [], addattachments = [] } = data;
          const attachment = attachments.map(item => item.id);
          const hrAttachment = hrattachments.map(item => item.id);
          const addAttachment = addattachments.map(item => item.id);
          yield put({
            type: 'updateState',
            payload: {
              formData: {
                ...response.data,
                attachment,
                hrAttachment,
                addAttachment,
              },
              attachments,
              hrattachments,
              addattachments,
            },
          });
          // 将返回的请假明细转为所需要的格式
          const daysArr = data.resVacationApply.detailViewList;
          const monthsArr = [];
          const monthDiff = sub(moment(endDate).month(), moment(startDate).month());
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
              detailEntityList: monthsArr,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason || '获取详情失败' });
        }
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateSearchForm(state, { payload }) {
      const { searchForm } = state;
      const newFormData = { ...searchForm, ...payload };
      return {
        ...state,
        searchForm: newFormData,
      };
    },
    cleanSearchForm(state, action) {
      return {
        ...state,
        searchForm: {
          ...defaultSearchForm,
          selectedRowKeys: [],
        },
        list: [],
        total: 0,
      };
    },
  },
};
