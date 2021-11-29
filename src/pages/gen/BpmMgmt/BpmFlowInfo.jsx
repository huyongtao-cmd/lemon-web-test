import React, { Component } from 'react';
import { isEmpty, isNil } from 'ramda';
import api from '@/api';
import { request } from '@/utils/networkUtils';
import { toUrl } from '@/utils/stringUtils';

const { versionItemByProcId } = api.bpm;
class BpmFlowInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      prcId: props.prcId || undefined,

      infoText: '',
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
    const { status, response } = await request.get(toUrl(versionItemByProcId, { procId: prcId }));
    if (status === 200) {
      const { ok, datum } = response;
      if (ok) {
        this.setState({
          infoText: isEmpty(datum) || isNil(datum) ? '' : datum.procExplain,
        });
      }
    }
  };

  render() {
    const { prcId, infoText } = this.state;
    return (
      <>
        {!prcId ? (
          <span>信息不足，未查询到流程信息</span>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: infoText }} />
        )}
      </>
    );
  }
}

export default BpmFlowInfo;
