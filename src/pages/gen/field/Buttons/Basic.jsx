import React, { Component } from 'react';
import { Button as AntButton } from 'antd';
import { type as RamdaType } from 'ramda';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Bind, Debounce } from 'lodash-decorators';

class Button extends Component {
  static propTypes = {
    type: PropTypes.oneOf(['primary', 'info', 'success', 'error', 'warning', 'default']),
    size: PropTypes.oneOf(['small', 'default', 'large']),
  };

  static defaultProps = {
    type: 'default',
    size: 'large',
  };

  @Bind()
  @Debounce(600)
  handleClick(e) {
    const { onClick } = this.props;
    RamdaType(onClick) === 'Function' && onClick(e);
  }

  render() {
    const { children, className, type, onClick, size, ...restProps } = this.props;
    return (
      <AntButton
        className={classnames(`tw-btn-${type}`, className)}
        size={size}
        onClick={this.handleClick}
        {...restProps}
      >
        {children}
      </AntButton>
    );
  }
}

export default Button;
