import { Icon, Popover } from 'antd';
import React from 'react';
import { connect } from 'dva';

// import styles from './index.less';

@connect(({ loading, global }) => ({
  loading,
  showHelp: global.showHelp,
}))
class HintHelper extends React.PureComponent {
  render() {
    const { children, showHelp, hasExtraHelpIndicator = null, ...restProps } = this.props;
    if (showHelp) {
      return (
        <>
          <Popover {...restProps} className="cursor-help">
            {children}
            {hasExtraHelpIndicator && (
              <Icon
                className="m-l-1"
                type="info-circle-o"
                theme="filled"
                style={{ color: '#f50' }}
              />
            )}
          </Popover>
        </>
      );
    }
    return children;
  }
}

export default HintHelper;
