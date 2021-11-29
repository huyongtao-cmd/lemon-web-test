import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import BaseFileManagerEnhance from '@/components/production/basic/BaseFileManagerEnhance';
import { outputHandle } from '@/utils/production/outputUtil';
import FormItem from '@/components/production/business/FormItem.tsx';

class BaseSelectDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input1Value: undefined,
      input2Value: 'zh-CN',
      input3Value: '0',
    };
  }

  componentDidMount() {}

  render() {
    const { input1Value, input2Value, input3Value } = this.state;

    return (
      <PageWrapper>
        <Card title="附件（BaseFileManagerEnhance）">
          <BaseFileManagerEnhance
            id="input1"
            api="/api/production/testMain/test/sfs/token"
            dataKey={1}
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. api 和dataKey 属性和以前一样，api为后端路径，dataKey 为数据主键</li>
            <li>2. 由于附件架构托管，不需value和onChange</li>
          </ul>
        </Card>
      </PageWrapper>
    );
  }
}

export default BaseSelectDemo;
