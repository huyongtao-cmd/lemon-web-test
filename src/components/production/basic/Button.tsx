import React from 'react';

import {Button as AntButton} from 'antd';
import {ButtonSize,} from "antd/lib/button";

import styles from './style/button.less';

interface Props {
  type?: 'default' | 'primary' | 'info' | 'danger'; // 按钮类型
  icon?: string; // 图标
  size?: ButtonSize; // 按钮大小
  loading?: boolean; // 加载状态
  onClick?: React.MouseEventHandler<any>; // 点击事件
  disabled?: boolean, // 是否可点击

  [propName: string] : any, // 其它属性

}

/**
 * 1. 按钮的封装,处理了样式
 */
class Button extends React.Component<Props,any> {

  static defaultProps?: object;

  render() {
    const {
      type,
      size,
      children,
      onClick,
      icon,
      ...rest
    } = this.props;
    let className = styles[`prod-btn-${type}`];

    return (
      <AntButton
        className={className}
        size={size}
        onClick={onClick}
        icon={icon}
        {...rest}
      >
        {children}
      </AntButton>
    );
  }

}

Button.defaultProps = {
  type: 'default',
  size: 'default',
};

export default Button;
