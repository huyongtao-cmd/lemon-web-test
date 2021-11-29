import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import BaseTreeSelect from '@/components/production/basic/BaseTreeSelect';

class BaseTreeSelectDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input1Value: undefined,
      input2Value: '',
    };
  }

  componentDidMount() {}

  render() {
    const { input1Value, input2Value } = this.state;

    return (
      <PageWrapper>
        <Card title="BaseTreeSelect 基本使用">
          <BaseTreeSelect
            id="input1"
            value={input1Value}
            onChange={value => this.setState({ input1Value: value })}
            parentKey={null}
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 使用parentKey获取树形选项</li>
          </ul>
        </Card>

        <Card title="多选">
          <BaseTreeSelect
            id="input2"
            value={input2Value}
            onChange={value => this.setState({ input2Value: value })}
            multiple
            parentKey="SYSTEM_MODULE"
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 多选</li>
          </ul>
        </Card>
      </PageWrapper>
    );
  }
}

export default BaseTreeSelectDemo;
