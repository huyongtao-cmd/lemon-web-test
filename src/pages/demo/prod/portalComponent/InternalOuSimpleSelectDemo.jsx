import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import InternalOuSimpleSelect from '@/components/production/basic/InternalOuSimpleSelect';

class InternalOuSimpleSelectDemo extends React.Component {
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
        <Card title="InternalOuSimpleSelect 内部公司选择">
          <InternalOuSimpleSelect
            value={input1Value}
            onChange={value => this.setState({ input1Value: value })}
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 默认值为空字符串</li>
          </ul>
        </Card>

        <Card title="其它">
          <InternalOuSimpleSelect
            value={input2Value}
            onChange={value => this.setState({ input2Value: value })}
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 其它举例</li>
          </ul>
        </Card>
      </PageWrapper>
    );
  }
}

export default InternalOuSimpleSelectDemo;
