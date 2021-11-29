import React from 'react';
import {Input,Icon} from 'antd';
import {localeString} from './Locale';

import styles from './style/allow-clear.less';

interface Props {
  value?: string, // 值
  disabled?: boolean, // 是否可编辑
  onChange?(value:any):void, // change 事件
  placeholder?: string, // 占位符
  [propName: string] : any, // 其它属性
}

/**
 * 1. 隐藏的输入框
 */
class BaseInputHidden extends React.Component<Props,any> {

  static defaultProps?: object;


  render() {
    const {
      value,
      disabled,
      onChange= ()=>{},
      ...rest
    } = this.props;



    return (
      <Input
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        type="hidden"
        {...rest}
      />
    );
  }

}

BaseInputHidden.defaultProps = {
};

export default BaseInputHidden;
