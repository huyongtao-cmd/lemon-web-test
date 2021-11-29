import React, { Component } from 'react';
import { DatePicker } from 'antd';
import { isNil, equals, isEmpty, type } from 'ramda';
import moment from 'moment';

const { MonthPicker: AntMonthPicker } = DatePicker;

class MonthPicker extends Component {
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
      value: isNil(value) || typeof value !== 'string' ? undefined : moment(value),
      onChange: (dates, stringDate) => {
        onChange && onChange(stringDate);
        this.setState({ value: dates });
      },
    };

    return <AntMonthPicker className="x-fill-100" {...momentWrapper} {...restProps} />;
  }
}

export default MonthPicker;
