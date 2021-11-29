import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import BaseInputNumber from '@/components/production/basic/BaseInputNumber';

class BaseInputNumberDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input1Value: 0,
      input2Value: undefined,
    };
  }

  componentDidMount() {}

  render() {
    const { input1Value, input2Value } = this.state;

    return (
      <PageWrapper>
        <Card title="BaseInputNumber基本介绍">
          <BaseInputNumber
            id="input1"
            value={input1Value}
            onChange={value => this.setState({ input1Value: value })}
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 增加了默认最大长度为 10</li>
            <li>2. 必须使用受控组件的形式</li>
          </ul>
        </Card>

        <Card title="指定占位符">
          <BaseInputNumber
            id="input2"
            value={input2Value}
            placeholder="指定占位符..."
            onChange={value => this.setState({ input2Value: value })}
          />
          <Divider />
        </Card>
      </PageWrapper>
    );
  }
}

export default BaseInputNumberDemo;
