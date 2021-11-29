import {
  getFlowModelHandle,
  saveNodeConfigHandle,
  getLatestProcessHandle,
  getBusinessBtnHandle,
  changeAutoApprove,
} from '@/services/sys/flowUpgrade';
import createMessage from '@/components/core/AlertMessage';

export default {
  namespace: 'flowUpgradeFlowConfig',
  state: {
    modelList: [],
    process: {},
    btns: [],
    config: '',
    initialBtns: [],
    initialConfig: '',
    disableBtn: true,
    item: {},
  },

  effects: {
    *queryModel({ payload }, { call, put }) {
      const { response } = yield call(getFlowModelHandle, payload);
      if (response && response.ok) {
        yield put({ type: 'updateState', payload: { modelList: response.datum } });
      } else {
        createMessage({ type: 'error', description: response.reason });
      }
    },
    *queryLatestProcess({ payload }, { call, put }) {
      const { response } = yield call(getLatestProcessHandle, payload);
      if (response && response.ok) {
        yield put({ type: 'updateState', payload: { process: response.datum } });
      } else {
        createMessage({ type: 'error', description: response.reason });
      }
    },
    *queryBusinessBtn({ payload }, { call, put }) {
      const { response } = yield call(getBusinessBtnHandle, payload.defKey, payload.taskKey);
      if (response && response.ok) {
        const { config, btns } = response.datum;
        btns.forEach((item, index) => {
          // eslint-disable-next-line no-param-reassign
          item.index = index + 1;
          return item;
        });
        // const temp = [{ index: 1, btnKey: 'FLOW_PASS', btnName: '按钮名', btnType: 'FLOW_PASS', btnDesc: '描述内容' }];
        yield put({
          type: 'updateState',
          payload: {
            config,
            btns,
            initialBtns: btns,
            initialConfig: config,
            disableBtn: false,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason });
      }
    },
    *save({ payload }, { call, put, select }) {
      const { btns, config } = yield select(({ flowUpgradeFlowConfig }) => flowUpgradeFlowConfig);
      const { item, key, id } = payload;
      const obj = {};
      obj.btns = btns;
      obj.config = config;
      obj.taskKey = item.key;
      obj.taskName = item.name;
      if (!btns.every(btn => btn.btnType && btn.btnKey && btn.btnName)) {
        createMessage({ type: 'warn', description: '请填写所有必填项' });
        return;
      }
      if (!obj.config) {
        createMessage({ type: 'warn', description: '请生成初始化配置' });
        return;
      }
      const res = yield call(getLatestProcessHandle, id);
      if (res.response && res.response.ok) {
        const { datum } = res.response;
        obj.remark = datum.resourceName;
        obj.versionTag = datum.versionTag;
      }
      if (obj.taskKey && obj.taskName) {
        const { response } = yield call(saveNodeConfigHandle, key, obj);
        if (response && response.ok) {
          createMessage({ type: 'success', description: '保存成功' });
          yield put({
            type: 'queryBusinessBtn',
            payload: {
              defKey: key,
              taskKey: item.key,
            },
          });
        } else {
          createMessage({ type: 'error', description: response.reason });
        }
      } else {
        createMessage({ type: 'warn', description: '请选择节点' });
      }
    },
    *resetConfig({ payload }, { call, put, select }) {
      const { btns, process, config } = yield select(
        ({ flowUpgradeFlowConfig }) => flowUpgradeFlowConfig
      );
      const obj = {};
      obj.taskKey = payload;
      obj.version = process.versionTag;
      const types = [];
      btns.forEach(item => {
        if (!types.includes(item.btnType)) {
          types.push(item.btnType);
        }
      });
      const udc = {
        FLOW_COMMIT: '提交',
        FLOW_PASS: '通过',
        FLOW_RETURN: '退回',
        FLOW_COUNTERSIGN: '加签',
        FLOW_NOTICE: '会签',
        FLOW_NOTIFY: '知会',
      };
      const buttons = types.map(item => ({
        type: 'button',
        icon: 'check-square',
        key: item,
        title: `${udc[item]}`,
        className: item === 'FLOW_RETURN' ? 'tw-btn-error' : 'tw-btn-primary',
        branches: btns
          .filter(i => i.btnType === item)
          .map(j => ({ id: j.index, code: j.btnKey, name: j.btnName })),
      }));
      obj.buttons = buttons;
      yield put({ type: 'updateState', payload: { config: JSON.stringify(obj, null, 2) } });
    },
    *changeAutoAppr({ payload }, { call, put, select }) {
      const { response = {} } = yield call(changeAutoApprove, payload);
      if (!response.ok) {
        createMessage({ type: 'warn', description: `设置自动审批失败！${response.reason}` });
      }
      return response;
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
