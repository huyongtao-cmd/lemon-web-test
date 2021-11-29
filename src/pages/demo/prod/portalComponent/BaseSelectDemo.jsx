import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import BaseSelect, { BaseSelectProps } from '@/components/production/basic/BaseSelect';
import { outputHandle } from '@/utils/production/outputUtil';

import { tenantSelectPaging } from '@/services/production/common/select';

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

  fetchTenantData = async () => {
    const output = await outputHandle(tenantSelectPaging, { limit: 0 });
    return output.data.rows.map(item => ({
      id: item.id,
      value: item.id,
      title: `${item.tenantName}(${item.tenantCode})`,
    }));
  };

  render() {
    const { input1Value, input2Value, input3Value } = this.state;

    return (
      <PageWrapper>
        <Card title="BaseSelect">
          <BaseSelect
            id="input1"
            value={input1Value}
            onChange={value => this.setState({ input1Value: value })}
            parentKey="SYSTEM_LANGUAGE"
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 使用parentKey形式渲染下拉组件(parentKey在系统选择项中维护)</li>
            <li>2. 必须使用受控组件的形式</li>
          </ul>
        </Card>

        <Card title="指定descList属性，多选">
          <BaseSelect
            id="input2"
            value={input2Value}
            onChange={value => this.setState({ input2Value: value })}
            parentKey="SYSTEM_LANGUAGE"
            descList={[{ value: 'zh-CN', title: '初始显示名称' }]}
            mode="multiple"
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>
              1.使用descList,设置初始化的下拉项,可以解决后端获取下拉列表数据比较慢,一开始只能显示值,而不能显示描述的问题
            </li>
          </ul>
        </Card>

        <Card title="使用fetchData自定义数据源">
          <BaseSelect
            id="input3"
            value={input3Value}
            onChange={value => this.setState({ input3Value: value })}
            fetchData={this.fetchTenantData}
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1.使用fetchData与parentKey 不能同时使用</li>
          </ul>
        </Card>
      </PageWrapper>
    );
  }
}

export default BaseSelectDemo;
