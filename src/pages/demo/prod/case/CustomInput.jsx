import React from 'react';
import { Input } from 'antd';

/**
 * 1. 自定义组件注意 value和 onChange 写法
 */
class CustomInput extends React.Component {
  componentDidMount() {}

  render() {
    const { value = '', onChange } = this.props;

    return (
      <Input
        value={value}
        onChange={e => {
          const val = e.target.value;
          onChange(val.charAt(val.length - 1) === '$' ? val : val + '$');
        }}
      />
    );
  }
}

export default CustomInput;
