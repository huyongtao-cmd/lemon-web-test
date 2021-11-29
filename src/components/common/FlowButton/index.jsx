import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';

@connect(({ dispatch, flowButton }) => ({
  dispatch,
  flowButton,
}))
class FLowButtonInfo extends PureComponent {
  // const FLowButtonInfo = ({ commitprops, passProps, returnProps }) => (
  commitFlowFn = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'flowButton/commitFlowHandle',
      payload: {
        ...params,
      },
    });
    dispatch({
      type: 'flowButton/updateState',
      payload: {
        btnCanUse: false,
      },
    });
  };

  pushFlowFn = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'flowButton/pushFlowHandle',
      payload: {
        ...params,
      },
    });
    dispatch({
      type: 'flowButton/updateState',
      payload: {
        btnCanUse: false,
      },
    });
  };

  render() {
    const {
      commitprops,
      passProps,
      returnProps,
      flowButton: { btnCanUse = true },
      showButton,
      moreButton,
    } = this.props;
    const {
      COMMIT = false,
      PASS = false,
      RETURN = false,
      COUNTERSIGN = false,
      NOTICE = false,
      NOTIFY = false,
    } = showButton;
    return (
      <div>
        {COMMIT && (
          <Button
            key="COMMIT"
            disabled={!btnCanUse}
            className="tw-btn-primary"
            size="large"
            icon="save"
            onClick={() => this.commitFlowFn(commitprops)}
          >
            提交
          </Button>
        )}
        {PASS && (
          <Button
            key="PASS"
            disabled={!btnCanUse}
            className="tw-btn-primary"
            size="large"
            icon="check-square"
            onClick={() => this.pushFlowFn(passProps)}
          >
            通过
          </Button>
        )}
        {RETURN && (
          <Button
            key="RETURN"
            disabled={!btnCanUse}
            className="tw-btn-error"
            size="large"
            icon="close-square"
            onClick={() => this.pushFlowFn(returnProps)}
          >
            拒绝
          </Button>
        )}
        {COUNTERSIGN && (
          <Button
            key="COUNTERSIGN"
            disabled={!btnCanUse}
            className="tw-btn-primary"
            size="large"
            // onClick={() => this.pushFlowFn(returnProps)}
          >
            加签
          </Button>
        )}
        {NOTICE && (
          <Button
            key="NOTICE"
            disabled={!btnCanUse}
            className="tw-btn-primary"
            size="large"
            // onClick={() => this.pushFlowFn(returnProps)}
          >
            会签
          </Button>
        )}
        {NOTIFY && (
          <Button
            key="NOTIFY"
            disabled={!btnCanUse}
            className="tw-btn-primary"
            size="large"
            // onClick={() => this.pushFlowFn(returnProps)}
          >
            知会
          </Button>
        )}
        {moreButton}
      </div>
    );
  }
}

export default FLowButtonInfo;
