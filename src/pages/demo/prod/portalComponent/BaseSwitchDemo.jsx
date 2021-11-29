import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import BaseSwitch from '@/components/production/basic/BaseSwitch';

class BaseSwitchDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input1Value: undefined,
      input2Value: true,
    };
  }

  componentDidMount() {}

  render() {
    const { input1Value, input2Value } = this.state;

    return (
      <PageWrapper>
        <Card title="BaseSwitch 基本使用">
          <BaseSwitch
            id="input1"
            value={input1Value}
            onChange={value => this.setState({ input1Value: value })}
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 值为 true 或false</li>
          </ul>
        </Card>

        <Card title="指定显示名称">
          <BaseSwitch
            id="input2"
            value={input2Value}
            onChange={value => this.setState({ input2Value: value })}
            disabled
            checkedChildren="开启"
            unCheckedChildren="关闭"
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 指定显示名称加不可编辑</li>
          </ul>
        </Card>
      </PageWrapper>
    );
  }
}

export default BaseSwitchDemo;
