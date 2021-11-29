import React, {ReactElement} from 'react';

import {Modal as AntModal, Input, Icon, Button,} from 'antd';


interface Props {
  title?: React.ReactNode | string; // 标题
  width?: string | number; // 宽度
  visible?: boolean; // 是否显示
  [propName: string]: any, // 其它属性

}

/**
 * 弹出框组件
 */
class Modal  extends React.Component<Props, any> {

  static defaultProps?: object;

  render() {
    const {
      title,
      width,
      visible,
      children,
      ...rest
    } = this.props;

    return (
      <AntModal
        visible={visible}
        title={title}
        width={width}
        {...rest}
      >
        {children}
      </AntModal>
    );
  }

}

Modal.defaultProps = {
  width: '80%',
};

export default Modal;
