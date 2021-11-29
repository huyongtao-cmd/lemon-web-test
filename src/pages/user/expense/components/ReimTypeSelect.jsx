import React from 'react';
import { Cascader, Input, Select, Spin } from 'antd';
import {
  selectReimType,
  selectReimTypeTrip,
  selectReimTypeSpecial,
} from '@/services/user/expense/expense';
import { createConfirm } from '@/components/core/Confirm';

const InputGroup = Input.Group;
const { Option } = Select;

class ReimTypeSelect extends React.Component {
  state = {
    options: [],
    loading: true,
  };

  componentDidMount() {
    // 根据差旅非差旅 选择不同的udc加载方法
    const { isTrip, isBSpecial } = this.props;
    if (isTrip) {
      selectReimTypeTrip().then(d => {
        this.setState({
          options: d,
          loading: false,
        });
      });
    } else if (isBSpecial) {
      selectReimTypeSpecial().then(d => {
        this.setState({
          options: d,
          loading: false,
        });
      });
    } else {
      selectReimType().then(d => {
        this.setState({
          options: d,
          loading: false,
        });
      });
    }
  }

  update = (level, _value) => {
    const { onChange, value } = this.props;
    if (level === 0) {
      onChange([_value[0], _value[1], value[2]]);
    } else {
      onChange([value[0], value[1], _value]);
    }
  };

  onChange = level => (_value, selectedOptions) => {
    const { detailList } = this.props;
    detailList.length
      ? createConfirm({
          content: '修改报销类型会清空明细，是否继续？',
          onOk: () => {
            this.update(level, _value);
          },
        })
      : this.update(level, _value);
  };

  render() {
    const { options, loading } = this.state;
    const { value, disabled } = this.props;

    // console.log('value', value);

    loading === false &&
      options[0].forEach(o => {
        if (o.children.length === 0) {
          // eslint-disable-next-line no-param-reassign
          o.disabled = true;
        }
      });

    return loading ? (
      <Spin size="small" />
    ) : (
      <InputGroup compact>
        <Cascader
          disabled={disabled}
          options={options[0]}
          value={[value[0], value[1]]}
          onChange={this.onChange(0)}
          allowClear={false}
          style={{ width: '60%' }}
        />

        <Select disabled value={value[2]} style={{ width: '40%' }} onChange={this.onChange(3)}>
          {options[1].map(o => (
            <Option key={o.value} value={o.value}>
              {o.label}
            </Option>
          ))}
        </Select>
      </InputGroup>
    );
  }
}

export default ReimTypeSelect;
