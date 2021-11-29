import React from 'react';
import { Input, Icon, Row } from 'antd';
import { equals, isNil, isEmpty, type } from 'ramda';

const RANGE_TAG = {
  BEFORE: 'before',
  AFTER: 'after',
};

const generatorValue = value => {
  if (isNil(value) || isEmpty(value)) return { before: undefined, after: undefined };
  if (type(value) === 'Array' && value.length === 2) {
    return { before: value[0], after: value[1] };
  }
  return null;
};

class ScopeInput extends React.Component {
  // eslint-disable-next-line
  static GetDerivedStateFromProps(nextProps, prevState) {
    if (!equals(nextProps.value, prevState.value)) {
      return generatorValue(nextProps.value);
    }
    return null;
  }

  constructor(props) {
    super(props);
    let modifiedValue = generatorValue(props.value);
    isNil(modifiedValue) && (modifiedValue = {});
    this.state = {
      before: modifiedValue.before,
      after: modifiedValue.after,
    };
  }

  onChange = (e, mark) => {
    const { value } = e.target;
    this.setState({ [mark]: value }, () => {
      const { before, after } = this.state;
      const { onChange } = this.props;
      onChange && onChange([before, after]);
    });
  };

  render() {
    const { before, after } = this.state;
    return (
      <Input.Group>
        <Row type="flex" align="middle" style={{ flexWrap: 'nowrap' }}>
          <Input
            style={{ flexGrow: 1 }}
            onChange={e => this.onChange(e, RANGE_TAG.BEFORE)}
            value={before}
          />
          <span style={{ paddingLeft: 4, paddingRight: 4 }}>~</span>
          <Input
            style={{ flexGrow: 1 }}
            onChange={e => this.onChange(e, RANGE_TAG.AFTER)}
            value={after}
          />
        </Row>
        <span style={{ position: 'absolute', right: -30, top: 5 }}>(分)</span>
      </Input.Group>
    );
  }
}

export default ScopeInput;
