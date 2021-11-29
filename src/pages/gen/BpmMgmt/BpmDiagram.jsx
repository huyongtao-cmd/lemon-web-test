import React, { Component } from 'react';
import { isEmpty } from 'ramda';
import BpmnViewer from 'bpmn-js';
import moveCanvas from 'diagram-js/lib/navigation/movecanvas';
import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toUrl } from '@/utils/stringUtils';
import styles from './BpmDiagram.less';
import variableMap from './variable';

const { model, logs } = api.bpmn;

class BpmDiagram extends Component {
  constructor(props) {
    super(props);
    this.state = {
      prcId: props.prcId || undefined,
    };
  }

  componentDidMount() {
    const { prcId } = this.state;
    this.fetchData(prcId);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      this.fetchData(snapshot);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { prcId = undefined } = this.props;
    if (prcId !== prevProps.prcId) {
      return prcId;
    }
    return null;
  }

  fetchData = async prcId => {
    const { status, response } = await request.get(toUrl(model, { id: prcId }));
    if (status === 200) {
      const xml = response;
      const data = await request.get(toUrl(logs, { id: prcId }));
      let logEvents = Array.isArray(data.response) ? data.response : [];
      if (logEvents.length && !isEmpty(logEvents.filter(log => log.logTime === null))) {
        const tail = logEvents.slice(logEvents.length - 1);
        const head = logEvents.slice(0, logEvents.length - 1);
        logEvents = tail.concat(head);
      }
      this.renderDiagram(this.canvas, xml, logEvents);
    }
  };

  paintTrace = (viewer, actions) => {
    const latest = actions.reverse();
    const canvas = viewer.get('canvas');
    latest.forEach(action => {
      const colorName = variableMap(action.result, 'less');
      canvas.addMarker(action.taskKey, colorName);
    });
  };

  renderDiagram = (containerDOM, xml, actions) => {
    const viewer = new BpmnViewer({
      container: containerDOM,
      additionalModules: [moveCanvas],
      height: 400,
    });

    viewer.importXML(xml, err => {
      if (err) {
        // eslint-disable-next-line
        console.log('[BPMN] error rendering', err);
      } else {
        // eslint-disable-next-line
        console.log('[BPMN] rendering bpmn xml');
        viewer.get('canvas').zoom('fit-viewport');
        this.paintTrace(viewer, actions);
        // return viewer;
      }
    });
  };

  render() {
    const { prcId } = this.state;
    return (
      <>
        {!prcId ? (
          <span>信息不足，未查询到流程信息</span>
        ) : (
          <div
            className={styles.bpmn}
            ref={el => {
              this.canvas = el;
            }}
          />
        )}
      </>
    );
  }
}

export default BpmDiagram;
