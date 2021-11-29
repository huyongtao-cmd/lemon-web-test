import React, { Component } from 'react';
import { TimePicker as AntdTimePicker } from 'antd';
import { isNil, equals, isEmpty } from 'ramda';
import moment from 'moment';

class DatePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || undefined,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!equals(nextProps.value, prevState.value)) {
      if (isNil(nextProps.value) || isEmpty(nextProps.value)) return { value: undefined };
      return { value: nextProps.value };
    }
    return null;
  }

  render() {
    const { value } = this.state;
    const {
      onChange,
      value: bindValue, // bind the value
      ...restProps
    } = this.props;
    const momentWrapper = {
      value: isNil(value) ? undefined : moment(`2019-01-01 ${value}:00`),
      onChange: (dates, stringDate) => {
        onChange && onChange(stringDate);
        this.setState({ value: dates });
      },
    };

    return <AntdTimePicker {...momentWrapper} {...restProps} />;
  }
}

export default DatePicker;
