import React from 'react';
import {DatePicker,} from 'antd';
import {isNil,isEmpty} from 'ramda';
import moment from 'moment';

import {localeString} from './Locale';

import styles from './style/select.less';

export declare type RangePickerValue = undefined[] | [string] | [undefined, string] | [string, string];

const { RangePicker } = DatePicker;

interface Props {
  value?: RangePickerValue, // 值
  disabled?: boolean, // 是否可编辑
  onChange?(value:any):void, // change 事件
  allowClear?: boolean, // 允许清除
  [propName: string] : any, // 其它属性
}

/**
 * 日期范围选择框
 * 1. 值属性使用字符串形式,不使用moment
 * 2. 请使用受控组件的形式
 * 3. 该组件的值为数组形式，向后端传递时如果分两个字段需自己处理
 */
class BaseDateRangePicker extends React.Component<Props,any> {

  static defaultProps?: object;



  render() {
    const {
      value,
      disabled,
      allowClear,
      onChange= ()=>{},
      ...rest
    } = this.props;
    let wrappedValue:any;
    if(isNil(value)){
      wrappedValue = undefined;
    }
    if(Array.isArray(value)){
      const start = value[0];
      const end = value[1];
      wrappedValue=[(isNil(start) || isEmpty(start)) ? undefined : moment(start),
        (isNil(end) || isEmpty(end)) ? undefined : moment(end)];
    }

    return (
      <RangePicker
        value={wrappedValue}
        disabled={disabled}
        allowClear={allowClear}
        className={styles['prod-select']}
        onChange={(dates: any, dateStrings: [string, string])=> {
          onChange && onChange(dateStrings)
        }}
        {...rest}
      />
    );
  }

}

BaseDateRangePicker.defaultProps = {
  allowClear: true, // 默认可清除
};

export default BaseDateRangePicker;
