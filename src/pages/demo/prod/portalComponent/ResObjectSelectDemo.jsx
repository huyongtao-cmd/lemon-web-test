import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import ResObjectSelect from '@/components/production/basic/ResObjectSelect';

class ResObjectSelectDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input1Value: undefined,
      input2Value: 2,
    };
  }

  componentDidMount() {}

  render() {
    const { input1Value, input2Value } = this.state;

    return (
      <PageWrapper>
        <Card title="ResObjectSelect 资源选择">
          <ResObjectSelect
            value={input1Value}
            onChange={value => this.setState({ input1Value: value })}
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 简单使用</li>
          </ul>
        </Card>

        <Card title="其它">
          <ResObjectSelect
            value={input2Value}
            onChange={value => this.setState({ input2Value: value })}
            descList={[{ id: 2, title: '张谡' }]}
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 编辑字段时名称回显</li>
          </ul>
        </Card>
      </PageWrapper>
    );
  }
}

export default ResObjectSelectDemo;
