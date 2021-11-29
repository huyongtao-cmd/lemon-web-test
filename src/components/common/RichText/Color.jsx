import React, { Component } from 'react';
import { Icon, Popover } from 'antd';
// import PropTypes from 'prop-types';
import { BlockPicker } from 'react-color';

import styles from './index.less';

class ColorPic extends Component {
  // static propTypes = {
  //   expanded: PropTypes.bool,
  //   onExpandEvent: PropTypes.func,
  //   onChange: PropTypes.func,
  //   currentState: PropTypes.object,
  // };

  stopPropagation = event => {
    event.stopPropagation();
  };

  onChange = color => {
    const { onChange } = this.props;
    onChange('color', color.hex);
  };

  renderContent = () => {
    const {
      currentState: { color },
    } = this.props;
    return (
      <BlockPicker className={styles.colorArrow} color={color} onChangeComplete={this.onChange} />
    );
  };

  render() {
    const { expanded, onExpandEvent } = this.props;
    return (
      <div className="rdw-inline-wrapper" title="font-color" aria-label="rdw-color-picker">
        <Popover
          className="rdw-option-wrapper"
          aria-selected="false"
          // title="font-color"
          size="small"
          onClick={onExpandEvent}
          content={this.renderContent()}
          visible={expanded}
          overlayClassName={styles.popover}
        >
          <Icon type="font-colors" />
        </Popover>
      </div>
    );
  }
}

export default ColorPic;
