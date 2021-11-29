import React from 'react';
import {Input,Icon} from 'antd';
import {localeString} from './Locale';

import styles from './style/allow-clear.less';

interface Props {
  value?: string, // 值
  disabled?: boolean, // 是否可编辑
  onChange?(value:any):void, // change 事件
  onPressEnter?: React.KeyboardEventHandler<HTMLInputElement>; // 键盘回车事件
  maxLength?: number, // 最大长度
  allowClear?: boolean, // 允许清除
  placeholder?: string, // 占位符
  [propName: string] : any, // 其它属性
}

/**
 * 1. 增加了allowClear:允许清除
 * 2. 增加了默认最大长度为 255
 * 3. 请使用受控组件的形式
 */
class BaseInput extends React.Component<Props,any> {

  static defaultProps?: object;

  handleReset = ()=>{
    const {
      onChange=()=>{},
    } = this.props;
    onChange("");
  };

  renderClearIcon(prefixCls: string="ant-input") {
    const { allowClear,value,disabled } = this.props;
    if (!allowClear || value === undefined || value === '' || disabled) {
      return null;
    }
    return (
      <Icon
        type="close-circle"
        theme="filled"
        onClick={this.handleReset}
        className={styles[`${prefixCls}-clear-icon`]}
      />
    );
  }

  render() {
    const {
      value,
      disabled,
      allowClear,
      onChange= ()=>{},
      onPressEnter,
      maxLength,
      placeholder = disabled?"":localeString({localeNo:'portal:component:input:placeholder:baseInput',defaultMessage:'请输入'}),
      ...rest
    } = this.props;



    return (
      <Input
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        onPressEnter={onPressEnter}
        suffix={this.renderClearIcon(undefined)}
        maxLength={maxLength}
        placeholder={placeholder}
        {...rest}
      />
    );
  }

}

BaseInput.defaultProps = {
  maxLength: 255, // 可输入最大长度,一个汉字或数字都占一个长度
  allowClear: true, // 默认可清除
};

export default BaseInput;
