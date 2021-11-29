import React, { Component } from 'react';
import { DatePicker as AntdDatePicker } from 'antd';
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
      value: isNil(value) ? undefined : moment(value),
      onChange: (dates, stringDate) => {
        onChange && onChange(stringDate);
        this.setState({ value: dates });
      },
    };

    return <AntdDatePicker className="x-fill-100" {...momentWrapper} {...restProps} />;
  }
}

export default DatePicker;
