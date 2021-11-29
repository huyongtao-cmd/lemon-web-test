import React, { Component, createRef } from 'react';
import { Popover } from 'antd';
import classnames from 'classnames';
import styles from './index.less';

class OverPopper extends Component {
  constructor(props) {
    super(props);
    this.dom = createRef();
  }

  state = {
    overflow: false,
    style: {},
  };

  componentDidMount() {
    const { line = 4 } = this.props;
    if (this.dom.current.clientHeight < this.dom.current.scrollHeight) {
      const { lineHeight, width } = window.getComputedStyle(this.dom.current);
      const height = lineHeight.split('px')[0] * line;
      const style = {
        width,
        height,
      };
      this.setState({
        overflow: true,
        style,
      });
    }
  }

  renderPopper = () => {
    const { children, popover } = this.props;
    const { style } = this.state;
    return popover ? (
      <Popover
        placement="topLeft"
        trigger="click"
        content={children}
        overlayStyle={{ width: style.width }}
        {...popover}
      >
        <span className={classnames(styles.faker, styles.hasPopper)} />
      </Popover>
    ) : (
      <span className={styles.faker} />
    );
  };

  newMethod = popover =>
    popover ? (
      <Popover placement="topLeft" trigger="hover" {...popover}>
        <span className={styles.faker} />
      </Popover>
    ) : (
      <span className={styles.faker} />
    );

  render() {
    const { children, line = 4 } = this.props;
    const { overflow, style } = this.state;
    return (
      <div className={styles.overPopper} style={{ WebkitLineClamp: line, ...style }} ref={this.dom}>
        {children}
        {!overflow ? null : this.renderPopper()}
      </div>
    );
  }
}

export default OverPopper;
