import React from 'react';
import {InputNumber,Icon} from 'antd';
import {localeString} from './Locale';

import  './style/input-number.less';


interface Props {
  value?: number, // 值
  onChange?(value:any):void, // change事件
  disabled?: boolean; // 是否可编辑
  maxLength?: number, // 最大长度
  allowClear?: boolean, // 允许清除
  placeholder?: string, // 占位符
  [propName: string] : any, // 其它属性
}

/**
 * 1. 增加了默认最大长度为 15
 * 2.
 */
class BaseInputNumber extends React.Component<Props,any> {

  static defaultProps?: object;

  render() {
    const {
      value,
      onChange= ()=>{},
      maxLength,
      disabled,
      placeholder = disabled?"":localeString({localeNo:'portal:component:input:placeholder:baseInputNumber',defaultMessage:'请输入'}),
      ...rest
    } = this.props;



    return (
      <InputNumber
        className="tw-input-number"
        value={value}
        disabled={disabled}
        onChange={value => onChange(value)}
        maxLength={maxLength}
        placeholder={placeholder}
        {...rest}
      />
    );
  }

}

BaseInputNumber.defaultProps = {
  maxLength: 15, // 可输入最大长度
};

export default BaseInputNumber;
