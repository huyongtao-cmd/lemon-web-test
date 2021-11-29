import createMessage from '@/components/core/AlertMessage';
import { getRatioList, saveRatio } from '@/services/org/bu/eqvaRatio/eqvaRatio';
import { fromQs } from '@/utils/stringUtils';
import moment from 'moment';

export default {
  namespace: 'orgRatio',
  state: {
    dataList: [],
    delIds: [],
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { response, status } = yield call(getRatioList, payload);
      if (status === 100) {
        return;
      }
      if (!!response && response.ok) {
        yield put({
          type: 'orgEqvaRatio/updateState',
          payload: {
            ratio: {
              dataList: response.datum,
            },
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason });
      }
    },
    *saveRatio({ payload }, { call, put, select }) {
      const {
        ratio: { dataList, delIds },
        pageConfig,
      } = yield select(({ orgEqvaRatio }) => orgEqvaRatio);
      if ((!dataList || dataList.length === 0) && (!delIds || delIds.length === 0)) {
        createMessage({ type: 'info', description: '当量系数数据为空,不用保存!' });
        return;
      }

      // 必填校验
      if (
        pageConfig.pageBlockViews &&
        pageConfig.pageBlockViews.length > 2 &&
        dataList &&
        dataList.length > 0
      ) {
        const { pageFieldViews } = pageConfig.pageBlockViews[1];
        // 对象数据数据处理，可以直接通过pageFieldJson.eqvaRatio取出对应字段的配置
        const requiredField = pageFieldViews.filter(
          field => field.requiredFlag && field.visibleFlag && field.fieldMode === 'EDITABLE'
        );
        if (requiredField && requiredField.length > 0) {
          const nullRequiredField = requiredField.filter(
            field =>
              dataList.filter(
                row =>
                  (!row[field.fieldKey] && row[field.fieldKey] !== 0) ||
                  row[field.fieldKey].length === 0
              ).length > 0
          );
          if (nullRequiredField && nullRequiredField.length > 0) {
            createMessage({
              type: 'warn',
              description: `【当量系数】TAB中【${nullRequiredField[0].displayName}】字段不能为空！`,
            });
            return;
          }
        }

        // 开始日期不能晚于结束日期
        if (
          dataList.filter(d => !!d.endDate && moment(d.startDate).isAfter(moment(d.endDate)))
            .length > 0
        ) {
          createMessage({ type: 'warn', description: '开始日期不能晚于结束日期!' });
          return;
        }
      }
      const newDataList = dataList.map(d => ({
        ...d,
        startDate: moment(d.startDate).format('YYYY-MM-DD'),
        endDate: d.endDate && moment(d.endDate).format('YYYY-MM-DD'),
      }));
      const { status, response } = yield call(saveRatio, { dataList: newDataList, delIds });
      if (status === 100) {
        return;
      }
      if (response && response.ok) {
        createMessage({ type: 'success', description: '当量系数保存成功！' });
        yield put({
          type: 'orgEqvaRatio/updateState',
          payload: {
            ratio: {
              delIds: [],
            },
          },
        });
        const { buId, resId } = fromQs();
        yield put({
          type: 'query',
          payload: {
            buId,
            resId,
          },
        });
      } else {
        createMessage({ type: 'error', description: '当量系数保存失败！' + response.reason || '' });
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
  },
};
