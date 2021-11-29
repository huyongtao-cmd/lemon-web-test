import React, { Component } from 'react';
import { Input } from 'antd';
import { type, isNil, isEmpty, equals } from 'ramda';
import Selection from './Selection';

const isExist = op => !isNil(op) && !isEmpty(op);

class TypeTrigger extends Component {
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
    const { type2, code } = this.props;
    const { value } = this.state;
    return (
      <Input.Group className="tw-field-group" compact>
        <Selection.UDC
          className="tw-field-group-field"
          code={code}
          placeholder="分类一"
          value={value[0]}
          onChange={v => this.handleChange(v, 0)}
        />
        <Selection
          className="tw-field-group-field"
          source={Array.isArray(type2) ? type2 : []}
          value={value[1]}
          placeholder="分类二"
          onChange={v => this.handleChange(v, 1)}
        />
      </Input.Group>
    );
  }
}

export default TypeTrigger;
