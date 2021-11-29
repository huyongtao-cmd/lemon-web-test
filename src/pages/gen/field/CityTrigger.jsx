import React, { Component } from 'react';
import { Input } from 'antd';
import { type, isNil, isEmpty, equals } from 'ramda';
import Selection from './Selection';

const isExist = op => !isNil(op) && !isEmpty(op);

class CityTrigger extends Component {
  constructor(props) {
    super(props);
    const value = isExist(props.value) ? props.value : Array(3).fill(undefined);
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
      return Array.isArray(value) ? value : Array(3).fill(undefined);
    }
    return null;
  }

  handleChange = (v, index) => {
    const { value } = this.state;
    const newValue = value.map((vi, i) => (i === index ? v : vi));
    if (index === 1) {
      newValue[2] = '';
    }
    this.setState({ value: newValue }, () => {
      const { onChange } = this.props;
      type(onChange) === 'Function' && onChange(newValue, index);
    });
  };

  render() {
    const { cityList } = this.props;
    const { value } = this.state;
    return (
      <Input.Group className="tw-field-group" compact>
        <Selection.UDC
          className="tw-field-group-field"
          code="TSK:CUST_REGION"
          placeholder="区域"
          value={value[0]}
          onChange={v => this.handleChange(v, 0)}
        />
        <Selection.UDC
          className="tw-field-group-field"
          code="COM:PROVINCE"
          placeholder="省份"
          value={value[1]}
          onChange={v => this.handleChange(v, 1)}
        />
        <Selection
          className="tw-field-group-field"
          source={Array.isArray(cityList) ? cityList : []}
          value={value[2]}
          placeholder="城市"
          onChange={v => this.handleChange(v, 2)}
        />
      </Input.Group>
    );
  }
}

export default CityTrigger;
