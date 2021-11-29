import React, { Component } from 'react';
import { DatePicker } from '@/pages/gen/field';
import moment from 'moment';

export default class extends Component {
  state = {
    // open: false,
    value: [],
  };

  componentWillReceiveProps(nextProp) {
    const { val } = nextProp;
    this.setState({ value: val });
  }

  onPanelChange = val => {
    const { onChange } = this.props;
    this.setState({
      value: val,
      // open: false,
    });
    onChange([moment(val[0]).format('YYYY-MM'), moment(val[1]).format('YYYY-MM')]);
  };

  render() {
    const {
      value,
      // open
    } = this.state;
    return (
      <DatePicker.RangePicker
        format="YYYY-MM"
        mode={['month', 'month']}
        value={value}
        allowClear={false}
        // open={open}
        // onFocus={() => {
        //   this.setState({ open: true });
        // }}
        // onBlur={() => {
        //   this.setState({ open: false });
        // }}
        onPanelChange={v => this.onPanelChange(v)}
      />
    );
  }
}
