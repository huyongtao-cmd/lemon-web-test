import { ruleSave, ruleEdit, ruleDetail } from '@/services/plat/attendance/attendance';
import { selectUsersInJob } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import { map } from 'ramda';
import router from 'umi/router';
import { closeThenGoto } from '@/layouts/routerControl';

const defalut = {
  formData: {
    attendanceResIds: [],
    reportToRes: [],
  },
  attendanceSiteEntity: [],
  attendanceNormalDateEntity: [],
  attendanceNormalDateSpecialEntity: [],
  dataList: [],
  total: 0,
  btnCanUse: true,
};

export default {
  namespace: 'platAttendanceRuleEdit',

  state: {
    ...defalut,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response } = yield call(ruleDetail, payload);
      if (response.ok) {
        const { datum = {} } = response;
        const {
          attendanceResIds,
          reportToRes,
          attendanceSiteEntity,
          attendanceNormalDateEntity,
          attendanceNormalDateSpecialEntity,
        } = datum;
        yield put({
          type: 'updateState',
          payload: {
            formData: {
              ...datum,
              attendanceResIds: attendanceResIds ? map(v => +v, attendanceResIds.split(',')) : [],
              reportToRes: reportToRes ? map(v => +v, reportToRes.split(',')) : [],
            },
            attendanceSiteEntity: Array.isArray(attendanceSiteEntity) ? attendanceSiteEntity : [],
            attendanceNormalDateEntity: Array.isArray(attendanceNormalDateEntity)
              ? attendanceNormalDateEntity
              : [],
            attendanceNormalDateSpecialEntity: Array.isArray(attendanceNormalDateSpecialEntity)
              ? attendanceNormalDateSpecialEntity
              : [],
          },
        });
      }
    },

    *clean(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          formData: {
            attendanceResIds: [],
            reportToRes: [],
          },
          attendanceSiteEntity: [],
          attendanceNormalDateEntity: [],
          attendanceNormalDateSpecialEntity: [],
          dataList: [],
          total: 0,
          btnCanUse: true,
        },
      });
    },

    *save({ payload }, { call, put }) {
      const { response } = yield call(ruleSave, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto('/hr/attendanceMgmt/attendance/rule');
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
      yield put({
        type: 'updateState',
        payload: {
          btnCanUse: true,
        },
      });
    },

    *edit({ payload }, { call, put }) {
      const { response } = yield call(ruleEdit, payload);
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        closeThenGoto('/hr/attendanceMgmt/attendance/rule');
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
      yield put({
        type: 'updateState',
        payload: {
          btnCanUse: true,
        },
      });
    },

    *selectUser(_, { call, put }) {
      const { response } = yield call(selectUsersInJob);
      response.forEach(v => {
        // eslint-disable-next-line
        v['title'] = v.name || '未知姓名';
        // eslint-disable-next-line
        v['key'] = v.id;
        // eslint-disable-next-line
        v['receiverBuName'] = v.receiverBuName || '未知部门';
        // eslint-disable-next-line
        v['baseCityName'] = v.baseCityName || '未知base地';
      });
      yield put({
        type: 'updateState',
        payload: {
          userList: response,
        },
      });
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
