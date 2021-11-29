import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import BaseRadioSelect from '@/components/production/basic/BaseRadioSelect';

class BaseRadioSelectDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input1Value: undefined,
      input2Value: 'zh-CN',
    };
  }

  componentDidMount() {}

  render() {
    const { input1Value, input2Value } = this.state;

    return (
      <PageWrapper>
        <Card title="BaseRadioSelect基本介绍">
          <BaseRadioSelect
            id="input1"
            value={input1Value}
            onChange={value => this.setState({ input1Value: value })}
            options={[
              {
                label: '是',
                value: true,
              },
              {
                label: '否',
                value: false,
              },
            ]}
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. options参数指定可选项</li>
            <li>2. 必须使用受控组件的形式</li>
          </ul>
        </Card>

        <Card title="指定默认值">
          <BaseRadioSelect
            id="input2"
            value={input2Value}
            onChange={value => this.setState({ input2Value: value })}
            options={[
              {
                label: '中文',
                value: 'zh-CN',
              },
              {
                label: '英语',
                value: 'en-US',
              },
            ]}
          />
          <Divider />
        </Card>
      </PageWrapper>
    );
  }
}

export default BaseRadioSelectDemo;
