import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import BaseTimePicker from '@/components/production/basic/BaseTimePicker';

class BaseTimePickerDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input1Value: '',
      input2Value: '',
      input3Value: '',
    };
  }

  componentDidMount() {}

  render() {
    const { input1Value, input2Value, input3Value } = this.state;

    return (
      <PageWrapper>
        <Card title="BaseTimePicker 基本介绍">
          <BaseTimePicker
            id="input1"
            value={input1Value}
            onChange={value => this.setState({ input1Value: value })}
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 增加了allowClear:允许清除</li>
            <li>2. 增加了默认最大长度为 255</li>
            <li>3. 请使用受控组件的形式</li>
          </ul>
        </Card>

        <Card title="不可编辑">
          <BaseTimePicker
            id="input2"
            value={input2Value}
            placeholder="指定占位符..."
            disabled
            onChange={value => this.setState({ input2Value: value })}
          />
          <Divider />
        </Card>
      </PageWrapper>
    );
  }
}

export default BaseTimePickerDemo;
