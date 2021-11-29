import React from 'react';
import {Switch } from 'antd';


interface Props {
  value?: boolean, // 值属性
  onChange?(value:boolean|undefined):void, // 值改变
  disabled?:boolean; // 是否不可编辑
  checkedChildren?: React.ReactNode; // 选择时显示
  unCheckedChildren?: React.ReactNode; // 未选择时显示
  [propName: string] : any, // 其它属性

}


/**
 * 开关
 * 1. 由于于高级查询不易集成,该输入项不作为查询条件
 * 2.
 */
class BaseSwitch extends React.Component<Props,any> {

  static defaultProps?: object;

  render() {
    const {
      value,
      onChange= ()=>{},
      disabled,
      checkedChildren,
      unCheckedChildren,
      ...rest
    } = this.props;

    return (
      <Switch
        checkedChildren={checkedChildren}
        unCheckedChildren={unCheckedChildren}
        checked={value}
        onChange={onChange}
        disabled={disabled}
        {...rest}
        style={{width:"auto"}}
      />
    );
  }

}

BaseSwitch.defaultProps = {
  checkedChildren: "是",
  unCheckedChildren: "否",
};

export default BaseSwitch;
