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

const shouldModified = value =>
  isNil(value) ? false : value.charAt(value.length - 1) === '.' || value === '-';

class RangeInput extends React.Component {
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
    const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    if ((!Number.isNaN(value) && reg.test(value)) || value === '' || value === '-') {
      this.setState({ [mark]: value }, () => {
        const { before, after } = this.state;
        const { onChange } = this.props;
        onChange && onChange([before, after]);
      });
    }
  };

  onBlur = mark => {
    const { onBlur } = this.props;
    const { before, after } = this.state;
    const shouldTriggerChange = [shouldModified(before), shouldModified(after)].filter(Boolean);
    if (!isEmpty(shouldTriggerChange)) {
      // eslint-disable-next-line
      const modifiedValue = this.state[mark].slice(0, -1);
      this.setState({ [mark]: modifiedValue }, () => {
        const { before: b, after: a } = this.state;
        const { onChange } = this.props;
        onChange && onChange([b, a]);
        onBlur && onBlur([b, a]);
      });
    } else {
      onBlur && onBlur([before, after]);
    }
  };

  render() {
    const { before, after } = this.state;
    return (
      <Input.Group>
        <Row type="flex" align="middle" style={{ flexWrap: 'nowrap' }}>
          <Input
            style={{ flexGrow: 1 }}
            onChange={e => this.onChange(e, RANGE_TAG.BEFORE)}
            onBlur={() => this.onBlur(RANGE_TAG.BEFORE)}
            addonAfter="%"
            value={before}
          />
          <span style={{ paddingLeft: 4, paddingRight: 4 }}>~</span>
          <Input
            style={{ flexGrow: 1 }}
            onChange={e => this.onChange(e, RANGE_TAG.AFTER)}
            onBlur={() => this.onBlur(RANGE_TAG.AFTER)}
            addonAfter="%"
            value={after}
          />
        </Row>
      </Input.Group>
    );
  }
}

export default RangeInput;
