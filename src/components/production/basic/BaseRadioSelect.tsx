import React from 'react';
import {Radio } from 'antd';
import {CheckboxOptionType} from "antd/lib/checkbox";

interface Props {
  value?: boolean, // 值属性
  onChange?(value:any):void, // 值改变
  options?: Array<CheckboxOptionType>; //可选项
  disabled?:boolean; // 是否不可编辑
  [propName: string] : any, // 其它属性

}


/**
 * Radio选择
 * 1. 由于于高级查询不易集成,该输入项不作为查询条件
 * 2.
 */
class BaseRadioSelect extends React.Component<Props,any> {

  static defaultProps?: object;

  render() {
    const {
      value,
      onChange= ()=>{},
      disabled=false,
      options,
      ...rest
    } = this.props;

    return (
      <Radio.Group
        onChange={({ target: { value } }) => onChange(value)}
        value={value}
        disabled={disabled}
        options={options}
        {...rest}
      />
    );
  }

}

BaseRadioSelect.defaultProps = {

};

export default BaseRadioSelect;
