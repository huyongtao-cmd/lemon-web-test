import React, { Component } from 'react';
import { request } from '@/utils/networkUtils';
import { toQs } from '@/utils/stringUtils';
import api from '@/api';
import EvalTemplate from './EvalTemplate';

const { evald, settleEval } = api.eval;

class EvalModal extends Component {
  state = {
    list: [],
  };

  componentDidMount() {
    const { sourceId, options } = this.props;
    if (sourceId) {
      this.fetchTemplate({ ...options, sourceId });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      this.fetchTemplate(snapshot);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // 异步的，最开始没有拉到单据业务，不知道是否要显示评价
    const { sourceId, options } = this.props;
    if (prevProps.sourceId !== sourceId && !!sourceId) {
      return { ...options, sourceId };
    }
    return null;
  }

  fetchTemplate = async options => {
    const { evalClass, evalType, sourceId } = options;
    const { status, response } = await request.get(toQs(settleEval, { evalClass, evalType }));
    if (status === 200 && response.ok) {
      const getInfo = await request.get(toQs(evald, { evalClass, evalType, sourceId }));
      const { evalDesc = '' } = response.datum || {};
      if (getInfo.status === 200 && getInfo.response.ok) {
        const { evalItemEntities: list, evalerResName, evaledResName, evalComment } =
          getInfo.response.datum || {};
        const desc = evalDesc.split(',');
        this.setState({
          list: Array.isArray(list) ? list : [],
          evalClass: desc[0],
          evalType: desc[1],
          evalerResName,
          evaledResName,
          evalComment,
        });
      } else {
        const desc = evalDesc.split(',');
        this.setState({
          evalClass: desc[0],
          evalType: desc[1],
        });
      }
    }
  };

  render() {
    const { isEval = false } = this.props;
    const { list, evalClass, evalType, evalerResName, evaledResName, evalComment } = this.state;

    return (
      <>
        {isEval ? (
          <EvalTemplate
            list={list}
            forms={{
              evalClass,
              evalType,
              evalerResName,
              evaledResName,
              evalComment,
            }}
          />
        ) : null}
      </>
    );
  }
}

export default EvalModal;
