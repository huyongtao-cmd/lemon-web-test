import React, { Component } from 'react';
import { Icon, Popover } from 'antd';
// import PropTypes from 'prop-types';
import { BlockPicker } from 'react-color';

import styles from './index.less';

class ColorPic extends Component {
  stopPropagation = event => {
    event.stopPropagation();
  };

  onChange = color => {
    const { onChange } = this.props;
    onChange(color.hex);
  };

  renderContent = color => (
    <BlockPicker
      className={styles.colorArrow}
      color={color}
      onChangeComplete={this.onChange}
      colors={[
        'black',
        'red',
        'yellow',
        'orange',
        'pink',
        'green',
        '#D9E3F0',
        '#dce775',
        '#ff8a65',
        '#ba68c8',
      ]}
    />
  );

  render() {
    const { color } = this.props;
    return (
      <div className="rdw-inline-wrapper" title="font-color" aria-label="rdw-color-picker">
        <Popover
          className="rdw-option-wrapper"
          aria-selected="false"
          size="small"
          content={this.renderContent(color)}
          overlayClassName={styles.popover}
        >
          <Icon style={{ backgroundColor: color, marginTop: '5px' }} type="font-colors" />
        </Popover>
      </div>
    );
  }
}

export default ColorPic;
