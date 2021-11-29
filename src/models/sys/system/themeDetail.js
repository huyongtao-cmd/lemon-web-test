/* eslint-disable prefer-const */
/* eslint-disable array-callback-return */
import createMessage from '@/components/core/AlertMessage';
import {
  abilityCreate,
  queryThemeAbility,
  deleteAbility,
  queryThemeProcess,
  updateThemeProcess,
  queryByReportById,
  queryReportDataById,
  saveReportSource,
  updateReportDataSource,
  getThemeById,
} from '@/services/user/Product/theme';

export default {
  namespace: 'systemProductDetail',
  state: {
    abilityMapList: [], // 能力地图列表
    selectedAbilityItem: '', // 被选中的能力地图Item
    processList: [], // 流程列表
    Xdata1: [], // 第一个报表X轴数据
    Ydata1: [], // 第一个报表Y轴数据
    Xdata2: [], // 第二个报表X轴数据
    Ydata2: [], // 第二个报表Y轴数据
    XAxis: [], // 数据维护列表的columns
    YAxis: [], // 数据维护列表的data
    dataSource1: [], // 数据维护的数据源
    dataSource2: [], // 数据维护的数据源
    themeItem: {}, // 主题信息
  },

  effects: {
    *abilityCreate({ payload }, { call, put }) {
      const { response } = yield call(abilityCreate, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        yield put({
          type: 'abilityQuery',
          payload: {
            id: payload.themeId,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
    },
    // 能力地图查询
    *abilityQuery({ payload }, { call, put }) {
      const { id } = payload;
      const { response } = yield call(queryThemeAbility, { id });
      const { datum } = response;
      yield put({
        type: 'updateState',
        payload: {
          abilityMapList: datum,
        },
      });
    },

    // 能力地图 删除能力
    *deleteAbility({ payload }, { call, put, select }) {
      const { abilityMapList } = yield select(({ systemProductDetail }) => systemProductDetail);
      const { id } = payload;
      const { response } = yield call(deleteAbility, id);
      if (response.ok) {
        createMessage({ type: 'success', description: '删除成功' });
        const newAbilityMapList = [];
        abilityMapList.map(item => {
          if (item.id !== id) {
            newAbilityMapList.push(item);
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            abilityMapList: newAbilityMapList,
            selectedAbilityItem: '',
          },
        });
        return response;
      }
      createMessage({ type: 'error', description: response.reason || '删除失败' });
      return false;
    },

    // 获取主题流程
    *processQuery({ payload }, { call, put, select }) {
      const { id } = payload;
      const { response } = yield call(queryThemeProcess, { id });
      if (response.ok) {
        const { datum } = response;

        const newDatum = datum.map((item, index) =>
          Object.assign({}, item, {
            id: index,
          })
        );
        yield put({
          type: 'updateState',
          payload: {
            processList: newDatum,
          },
        });
      }
    },

    // 保存流程新增或修改
    *saveThemeFlow({ payload }, { call, put, select }) {
      const { processList } = yield select(({ systemProductDetail }) => systemProductDetail);
      const { id } = payload;
      // 给数据增加 proNum和nodeNum
      const newProcessList = processList.map((item, index) => {
        const newItem = Object.assign({}, item, {
          proNum: index + 1,
        });
        if (newItem.procDtls) {
          newItem.procDtls = newItem.procDtls.map((_, i) =>
            Object.assign({}, _, {
              nodeNum: i + 1,
            })
          );
        }
        return newItem;
      });
      const { response } = yield call(updateThemeProcess, id, newProcessList);
      if (response.ok) {
        createMessage({ type: 'success', description: response.reason || '保存成功' });
      } else {
        createMessage({ type: 'error', description: response.reason || '保存失败' });
      }
      yield put({
        type: 'processQuery',
        payload: {
          id,
        },
      });
    },

    // 获取主题报表信息
    *queryByReportById({ payload }, { call, put }) {
      const { id } = payload;
      const { response } = yield call(queryByReportById, id);
      const { datum } = response;
      let Xdata1 = [];
      let Ydata1 = [];
      let Xdata2 = [];
      let Ydata2 = [];
      if (response.ok) {
        response.datum.map((_, index) => {
          if (_.location === '1') {
            Xdata1 = _.columns.filter(item => item.axisDir === 'X');
            Ydata1 = _.columns.filter(item => item.axisDir === 'Y');
          }
          if (_.location === '2') {
            Xdata2 = _.columns.filter(item => item.axisDir === 'X');
            Ydata2 = _.columns.filter(item => item.axisDir === 'Y');
          }
        });
      }
      // console.log('X轴', Xdata1);
      // console.log('Y轴', Ydata1);

      yield put({
        type: 'updateState',
        payload: {
          Xdata1,
          Ydata1,
          Xdata2,
          Ydata2,
        },
      });
    },
    // 获取主题报表数据
    *queryReportDataById({ payload }, { call, put }) {
      const { id } = payload;
      const { response } = yield call(queryReportDataById, id);
      let XAxis1 = [];
      let YAxis1 = [];
      let dataSource1 = [];
      let XAxis2 = [];
      let YAxis2 = [];
      let dataSource2 = [];
      let reportId1 = '';
      let reportId2 = '';
      if (response.ok) {
        response.datum.map((_, index) => {
          if (_.location === '1') {
            let temX1 = [];
            let temY1 = [];
            _.columns.map(item => {
              temX1.push(item.xaxisLabel);
              temY1.push(item.yaxisLabel);
            });
            reportId1 = _.reportId;
            XAxis1 = Array.from(new Set(temX1));
            YAxis1 = Array.from(new Set(temY1));
            YAxis1.map(k => {
              let obj = {};
              _.columns.map(item => {
                if (k === item.yaxisLabel) {
                  obj[item.xaxisLabel] = item.value;
                  obj.id = item.yaxisLabel;
                }
              });
              dataSource1.push(obj);
            });
          }
          if (_.location === '2') {
            let temX2 = [];
            let temY2 = [];
            _.columns.map(item => {
              temX2.push(item.xaxisLabel);
              temY2.push(item.yaxisLabel);
            });
            reportId2 = _.reportId;
            XAxis2 = Array.from(new Set(temX2));
            YAxis2 = Array.from(new Set(temY2));
            YAxis2.map(k => {
              let obj = {};
              _.columns.map(item => {
                if (k === item.yaxisLabel) {
                  obj[item.xaxisLabel] = item.value;
                  obj.id = item.yaxisLabel;
                }
              });
              dataSource2.push(obj);
            });
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            reportId1,
            reportId2,
            XAxis1,
            XAxis2,
            YAxis1,
            YAxis2,
            dataSource1,
            dataSource2,
          },
        });
      }
    },

    // 报表保存或者新增
    *reportDataSave({ payload }, { call, put }) {
      const { themeId, reportId, params, location } = payload;
      if (reportId === '') {
        // 新增
        const { response } = yield call(saveReportSource, themeId, location, params);
        if (response.ok) {
          createMessage({ type: 'success', description: response.reason || '保存成功' });
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
      } else {
        // 更新
        const { response } = yield call(
          updateReportDataSource,
          themeId,
          reportId,
          location,
          params
        );
        if (response.ok) {
          createMessage({ type: 'success', description: response.reason || '保存成功' });
        } else {
          createMessage({ type: 'error', description: response.reason || '保存失败' });
        }
      }
      yield put({ type: 'queryByReportById', payload: { id: themeId } });
      yield put({ type: 'queryReportDataById', payload: { id: themeId } });
    },
    *getThemeById({ payload }, { call, put }) {
      const { id } = payload;
      const { response } = yield call(getThemeById, id);
      if (response.ok) {
        const { datum } = response;
        const newPanelTitle = datum.panelTitle.split(',');
        yield put({
          type: 'updateState',
          payload: {
            themeItem: { ...datum, newPanelTitle },
          },
        });
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
    selectedAbilityItem(state, { payload }) {
      return {
        ...state,
        selectedAbilityItem: payload,
      };
    },
  },
};
