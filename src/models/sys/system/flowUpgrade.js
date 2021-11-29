import {
  saveFlowHandle,
  getFlowHandle,
  unloadFlowhandel,
  getFlowInfoHandle,
  selectFlowRoleFn,
  getLineVarInfoFn,
  getLineVarInfoNewFn,
} from '@/services/sys/flowUpgrade';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { getPointTo, pointTo } from '@/services/sys/flowMgmt';
import { fromQs } from '@/utils/stringUtils';

const defaultSearchForm = {
  keyLike: undefined,
  nameLike: undefined,
};
const defaultBpmnInfo = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_08kjbbf" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="3.3.2">
  <bpmn:process id="Process_1mz8axj" isExecutable="true" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1mz8axj" />
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
export default {
  namespace: 'flowUpgrade',
  state: {
    searchForm: defaultSearchForm,
    list: [],
    total: undefined,
    bpmnInfo: defaultBpmnInfo,
    roleChoseModalShow: false,
  },

  effects: {
    *query({ payload }, { call, put }) {
      const { response, status } = yield call(getFlowHandle, payload);
      if (status === 200) {
        yield put({
          type: 'updateState',
          payload: {
            list: Array.isArray(response.rows) ? response.rows : [],
            total: response.total,
          },
        });
      }
    },

    *getFlow({ payload }, { call, put }) {
      const { response } = yield call(getFlowInfoHandle, payload);
      if (response && response.ok) {
        yield put({
          type: 'updateState',
          payload: {
            bpmnInfo: response.datum ? response.datum : defaultBpmnInfo,
          },
        });
        return true;
      }
      return false;
    },

    *getFlowTo({ payload }, { call, put }) {
      const { defId, taskKey } = payload;
      const { status } = yield call(getPointTo, defId, taskKey);
      if (status === 200) {
        // TODO: updateForm
      }
    },
    *flowTo({ payload }, { call, put }) {
      const { status } = yield call(selectFlowRoleFn, payload);
      if (status === 200) {
        return true;
      }
      return false;
    },

    *getLineInfo({ payload }, { call, put }) {
      const { flowid } = fromQs();
      const defKey = flowid && flowid.split(':')[0];
      const params = {
        defKey,
        taskKey: payload.taskKey,
      };
      const { response } = yield call(getLineVarInfoNewFn, params);
      if (response && response.ok) {
        return response.datum;
      }
      return [];
    },

    // 保存工作流
    *submit({ payload }, { call, select }) {
      const { response } = yield call(saveFlowHandle, payload);
      if (response && response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        const { deployId, id, key } = response.datum;
        closeThenGoto(
          `/sys/flowMen/UpgradeFlow/UpgradeFlowConfig?id=${deployId}&flowid=${id}&key=${key}`
        );
      } else {
        createMessage({ type: 'error', description: '保存失败' });
      }
    },

    *unload({ payload }, { call, put }) {
      // TODO: 以后会分成 弱删除 和 强删除，弱删除删不掉之后，弹窗告知是否要强制删除，因为在删除操作的时候，流程实例可能还在跑
      const { status } = yield call(unloadFlowhandel, payload.id);
      if (status === 200) {
        yield put({ type: 'query' });
      }
    },
    *clean({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          bpmnInfo: defaultBpmnInfo,
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
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, search }) => {});
    },
  },
};
