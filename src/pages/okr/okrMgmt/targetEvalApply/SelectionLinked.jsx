import React, { Component } from 'react';
import { Input } from 'antd';
import { type, isNil, isEmpty, equals } from 'ramda';
import { Selection } from '@/pages/gen/field';

const isExist = op => !isNil(op) && !isEmpty(op);

class SelectionLinked extends Component {
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
      newValue[1] = '';
    }
    this.setState({ value: newValue }, () => {
      const { onChange } = this.props;
      type(onChange) === 'Function' && onChange(newValue, index);
    });
  };

  render() {
    const { dataSource2, dataSource1 } = this.props;
    const { value } = this.state;
    return (
      <Input.Group className="tw-field-group" compact>
        <Selection
          className="tw-field-group-field"
          source={Array.isArray(dataSource1) ? dataSource1 : []}
          placeholder="父目标"
          value={value[0]}
          onChange={v => this.handleChange(v, 0)}
          transfer={{ key: 'id', code: 'id', name: 'objectiveName' }}
        />
        <Selection
          className="tw-field-group-field"
          source={Array.isArray(dataSource2) ? dataSource2 : []}
          value={value[1]}
          placeholder="子目标"
          onChange={v => this.handleChange(v, 1)}
          transfer={{ key: 'id', code: 'id', name: 'objectiveName' }}
        />
      </Input.Group>
    );
  }
}

export default SelectionLinked;
