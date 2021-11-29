import React from 'react';
import {Input,Icon} from 'antd';
import {localeString} from './Locale';

interface Props {
  value?: number, // 值
  onChange?(value:any):void, // change事件
  disabled?: boolean; // 是否可编辑
  maxLength?: number, // 最大长度
  placeholder?: string, // 占位符
  [propName: string] : any, // 其它属性
}

/**
 * 1. 增加了默认最大长度为 500
 * 2.
 */
class BaseInputTextArea extends React.Component<Props,any> {

  static defaultProps?: object;

  render() {
    const {
      value,
      onChange= ()=>{},
      maxLength,
      disabled,
      placeholder = disabled?"":localeString({localeNo:'portal:component:input:placeholder:baseInputTextArea',defaultMessage:'请输入'}),
      ...rest
    } = this.props;



    return (
      <Input.TextArea
        value={value}
        disabled={disabled}
        onChange={({ target: { value } }) => onChange(value)}
        maxLength={maxLength}
        placeholder={placeholder}
        {...rest}
      />
    );
  }

}

BaseInputTextArea.defaultProps = {
  maxLength: 500, // 可输入最大长度
};

export default BaseInputTextArea;
