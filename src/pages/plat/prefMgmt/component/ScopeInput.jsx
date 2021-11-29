import React from 'react';
import { Input, Icon, Row, InputNumber } from 'antd';
import { equals, isNil, isEmpty, type } from 'ramda';

const RANGE_TAG = {
  BEFORE: 'before',
  AFTER: 'after',
};

const isExist = op => !isNil(op) && !isEmpty(op);

class ScopeInput extends React.Component {
  constructor(props) {
    super(props);
    const value = isExist(props.value) ? props.value : Array(2).fill('');
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
      return Array.isArray(value) ? value : Array(2).fill('');
    }
    return null;
  }

  onChange = (v, index) => {
    const { value } = this.state;
    const newValue = value.map((vi, i) => (i === index ? v : vi));
    this.setState({ value: newValue }, () => {
      const { onChange } = this.props;
      type(onChange) === 'Function' && onChange(newValue, index);
    });
  };

  render() {
    const { value } = this.state;
    return (
      <Input.Group>
        <Row type="flex" align="middle" style={{ flexWrap: 'nowrap' }}>
          <InputNumber
            style={{ flexGrow: 1 }}
            onChange={e => this.onChange(e, 0)}
            value={value[0]}
            min={0}
          />
          <span style={{ paddingLeft: 4, paddingRight: 4 }}>~</span>
          <InputNumber
            style={{ flexGrow: 1 }}
            onChange={e => this.onChange(e, 1)}
            value={value[1]}
            min={0}
          />
        </Row>
      </Input.Group>
    );
  }
}

export default ScopeInput;
