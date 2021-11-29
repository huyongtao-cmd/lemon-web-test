import moment from 'moment';
import { formatDT } from '@/utils/tempUtils/DateTime';
import createMessage from '@/components/core/AlertMessage';
import {
  queryVacationListMethod,
  saveVacationMethod,
  saveJdeExportMethod,
} from '@/services/sys/baseinfo/vacation';

/**
 * 获取一年默认的假期数据
 * @param year  年份,比如:2019
 * @returns {Array}
 */
const wrapDefaultYear = year => {
  const datas = [];
  const dateStart = moment({ year });
  const dateEnd = dateStart.clone().add('year', 1);
  const days = (dateEnd.unix() - dateStart.unix()) / (60 * 60 * 24);
  dateStart.add('day', -1);
  for (let i = 0; i < days; i += 1) {
    const dateYmd = formatDT(dateStart.add('day', 1));
    const dateObj = {};
    dateObj[dateYmd] = 8;
    datas.push(dateObj);
  }
  return datas;
};

export default {
  namespace: 'vacation',
  state: {
    year: moment(),
    datas: wrapDefaultYear(moment().year()),
    notConfigFlag: 0,
  },

  /**
   * 异步处理,通过调用reducers间接修改state
   */
  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(queryVacationListMethod, payload.year.get('y'));
      if (response && response.length > 0) {
        yield put({
          type: 'updateState',
          payload: {
            datas: response,
            notConfigFlag: 0,
          },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: {
            datas: wrapDefaultYear(payload.year.get('y')),
            notConfigFlag: 1,
          },
        });
      }
    },
    *save({ payload }, { call, select }) {
      const { datas } = yield select(({ vacation }) => vacation);
      const { response } = yield call(saveVacationMethod, datas);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },
  },

  /**
   * 同步处理,所有state的变更都必须通过reducers
   */
  reducers: {
    /**
     * 更新表格数据
     * @param state
     * @param action
     * @returns {{}}
     */
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },

    /**
     * 修改年份
     * @param state
     * @param action
     * @returns {{year}}
     */
    updateYear(state, action) {
      return {
        ...state,
        year: action.payload.year,
      };
    },

    /**
     * 修改一天工作小时数
     * @param state
     * @param action
     * @returns {{year}}
     */
    updateHours(state, action) {
      const { datas } = state;
      const date = moment(action.payload.date);
      const days = date.dayOfYear();
      const obj = {};
      obj[formatDT(date)] = action.payload.hours;
      datas[days - 1] = obj;
      return {
        ...state,
        datas,
      };
    },
  },
};
