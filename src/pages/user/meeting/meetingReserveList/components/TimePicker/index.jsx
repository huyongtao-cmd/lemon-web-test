import React, { Component } from 'react';
import { Row, Col, TimePicker as AntdTimePicker } from 'antd';
import { type, isNil, isEmpty, equals } from 'ramda';

const isExist = op => !isNil(op) && !isEmpty(op);

class TimePicker extends Component {
  constructor(props) {
    super(props);
    const value = isExist(props.value) ? props.value : Array(2).fill(undefined);
    this.state = {
      value,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ value: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { value } = this.props;
    if (!equals(prevState.value, value)) {
      return Array.isArray(value) ? value : Array(2).fill(undefined);
    }
    return null;
  }

  handleChange = (v, index) => {
    const { value } = this.state;
    const newValue = value.map((vi, i) => (i === index ? v : vi));
    if (index === 0) {
      newValue[1] = undefined;
    }
    this.setState({ value: newValue }, () => {
      const { onChange } = this.props;
      type(onChange) === 'Function' && onChange(newValue, index);
    });
  };

  render() {
    const { selectProps } = this.props;
    const { value } = this.state;
    return (
      <Row type="flex">
        <Col span={11}>
          <AntdTimePicker
            id={0}
            style={{ width: '100%' }}
            value={value[0]}
            {...selectProps}
            onChange={v => this.handleChange(v, 0)} // 开始时间
          />
        </Col>
        <Col span={2} style={{ textAlign: 'center' }}>
          至
        </Col>
        <Col span={11}>
          <AntdTimePicker
            id={1}
            value={value[1]}
            style={{ width: '100%' }}
            {...selectProps}
            onChange={v => this.handleChange(v, 1)} // 结束时间
          />
        </Col>
      </Row>
    );
  }
}

export default TimePicker;
