import React from 'react';
import {InputNumber, Icon} from 'antd';
import {localeString} from './Locale';

import './style/input-number.less';


interface Props {
  value?: number, // 值
  onChange?(value: any): void, // change事件
  scale?:number; // 小数店位数
  disabled?: boolean; // 是否可编辑
  maxLength?: number, // 最大长度
  placeholder?: string, // 占位符
  [propName: string]: any, // 其它属性
}

/**
 * 1. 金额输入框
 * 2.
 */
class BaseInputAmt extends React.Component<Props, any> {

  static defaultProps?: object;

  render() {
    const {
      value,
      onChange = () => {
      },
      scale,
      maxLength,
      disabled,
      placeholder = disabled ? "" : localeString({
        localeNo: 'portal:component:input:placeholder:baseInputAmt',
        defaultMessage: '请输入金额'
      }),
      ...rest
    } = this.props;

    return (
      <InputNumber
        className="tw-input-number"
        value={value}
        disabled={disabled}
        onChange={value => {
          if(!Number.isNaN(Number(value))){
            onChange(value);
          }
        }}
        precision={scale}
        maxLength={maxLength}
        placeholder={placeholder}
        {...rest}
      />
    );
  }

}

BaseInputAmt.defaultProps = {
  maxLength: 15, // 可输入最大长度
  scale: 2, // 可输入最大长度
};

export default BaseInputAmt;
