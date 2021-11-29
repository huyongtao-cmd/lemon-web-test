import React from 'react';
import {DatePicker,} from 'antd';
import {isNil,isEmpty} from 'ramda';
import moment from 'moment';

import {localeString} from './Locale';

import styles from './style/select.less';

interface Props {
  value?: string, // 值
  disabled?: boolean, // 是否可编辑
  onChange?(value:any):void, // change 事件
  allowClear?: boolean, // 允许清除
  placeholder?: string, // 占位符
  [propName: string] : any, // 其它属性
}

/**
 * 日期选择框
 * 1. 值属性使用字符串形式,不使用moment
 * 2. 请使用受控组件的形式
 */
class BaseDatePicker extends React.Component<Props,any> {

  static defaultProps?: object;



  render() {
    const {
      value,
      disabled,
      allowClear,
      onChange= ()=>{},
      placeholder = disabled?"":localeString({localeNo:'portal:component:input:placeholder:baseInput',defaultMessage:'请输入'}),
      ...rest
    } = this.props;

    return (
      <DatePicker
        value={(isNil(value) || isEmpty(value)) ? undefined : moment(value)}
        disabled={disabled}
        allowClear={allowClear}
        className={styles['prod-select']}
        onChange={(date: moment.Moment, dateString: string)=> {
          onChange && onChange(dateString)
        }}
        placeholder={placeholder}
        {...rest}
      />
    );
  }

}

BaseDatePicker.defaultProps = {
  allowClear: true, // 默认可清除
};

export default BaseDatePicker;
