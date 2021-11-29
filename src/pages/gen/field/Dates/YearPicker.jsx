import React, { createRef } from 'react';
import moment from 'moment';
import { DatePicker } from 'antd';
import { isNil, omit } from 'ramda';

const updateValue = value => (isNil(value) ? undefined : moment(`${value}-02-14`));

class YearPicker extends DatePicker {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: updateValue(props.value),
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.value !== prevState.value) {
      return {
        value: updateValue(nextProps.value),
      };
    }
    return null;
  }

  handlePanelChange = value => {
    let selectedValue;
    if (!isNil(value)) selectedValue = moment(value).year();
    this.setState({ value, open: false }, () => {
      const { onChange } = this.props;
      onChange && onChange(selectedValue);
    });
  };

  handleChange = (value, dateString) => {
    const selectedValue = isNil(value) ? undefined : value;
    const modifiedDateString = dateString.length ? dateString : undefined;
    this.setState({ value: selectedValue, open: false }, () => {
      const { onChange } = this.props;
      onChange && onChange(modifiedDateString);
    });
  };

  render() {
    const props = omit(['value', 'open', 'onChange', 'onOpenChange'], this.props);
    const { open, value } = this.state;
    // eslint-disable-next-line
    const modifiedValue = isNil(value) ? undefined : moment(value).isValid() ? value : undefined;
    return (
      <DatePicker
        mode="year"
        open={open}
        value={modifiedValue}
        onChange={this.handleChange}
        onOpenChange={status => this.setState({ open: status })}
        onPanelChange={changedValue => this.handlePanelChange(changedValue)}
        {...props}
      />
    );
  }
}

export default YearPicker;
