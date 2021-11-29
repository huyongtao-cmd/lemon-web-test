import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import Description from '@/components/production/basic/Description';

class DescriptionDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input1Value: undefined,
      input2Value: '哈哈哈哈',
    };
  }

  componentDidMount() {}

  render() {
    const { input1Value, input2Value } = this.state;

    return (
      <PageWrapper>
        <Card title="Description 字段描述">
          <Description value={input1Value} />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 默认值为空字符串</li>
          </ul>
        </Card>

        <Card title="其它">
          <Description value={input2Value} />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 其它举例</li>
          </ul>
        </Card>
      </PageWrapper>
    );
  }
}

export default DescriptionDemo;
