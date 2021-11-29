import React, { Component } from 'react';
import { DatePicker } from 'antd';
import { isNil, equals, type, isEmpty } from 'ramda';
import moment from 'moment';

const { RangePicker: AntRangePicker } = DatePicker;

class RangePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || undefined,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!equals(nextProps.value, prevState.value)) {
      if (isNil(nextProps.value)) return { value: undefined };
      if (type(nextProps.value) === 'Array' && isEmpty(nextProps.value[0]))
        return { value: undefined };
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
      // eslint-disable-next-line
      value: isNil(value)
        ? undefined
        : Array.isArray(value)
          ? value.map(v => (isNil(v) || isEmpty(v) ? undefined : moment(v)))
          : undefined,
      onChange: (dates, stringDate) => {
        onChange && onChange(stringDate);
        this.setState({ value: dates });
      },
    };

    return <AntRangePicker className="x-fill-100" {...momentWrapper} {...restProps} />;
  }
}

export default RangePicker;
