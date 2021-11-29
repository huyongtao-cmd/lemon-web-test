import React from 'react';
import { List } from 'antd';
import router from 'umi/router';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import Link from '@/components/production/basic/Link';

class PortalComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      base: [
        {
          component: 'BaseInput',
          componentName: '文本输入框',
          uri: '/demo/prod/portalComponent/baseInput',
        },
        {
          component: 'BaseInputNumber',
          componentName: '数字输入框',
          uri: '/demo/prod/portalComponent/baseInputNumber',
        },
        {
          component: 'BaseInputTextArea',
          componentName: '长文本输入框',
          uri: '/demo/prod/portalComponent/baseInputTextArea',
        },
        {
          component: 'BaseDatePicker',
          componentName: '日期输入框',
          uri: '/demo/prod/portalComponent/baseDatePicker',
        },
        {
          component: 'BaseTimePicker',
          componentName: '时间输入框',
          uri: '/demo/prod/portalComponent/baseTimePicker',
        },
        {
          component: 'BaseRadioSelect',
          componentName: '单选输入',
          uri: '/demo/prod/portalComponent/baseRadioSelect',
        },
        {
          component: 'BaseSelect',
          componentName: '下拉选择框',
          uri: '/demo/prod/portalComponent/baseSelect',
        },
        {
          component: 'BaseSwitch',
          componentName: '开关输入',
          uri: '/demo/prod/portalComponent/baseSwitch',
        },
        {
          component: 'BaseTreeSelect',
          componentName: '树选择',
          uri: '/demo/prod/portalComponent/baseTreeSelect',
        },
        {
          component: 'Description',
          componentName: '字段详情模式',
          uri: '/demo/prod/portalComponent/description',
        },
        {
          component: 'InternalOuSimpleSelectDemo',
          componentName: '简单内部公司下拉选择框',
          uri: '/demo/prod/portalComponent/internalOuSimpleSelect',
        },
        {
          component: 'ResObjectSelectDemo',
          componentName: '资源选择弹出框',
          uri: '/demo/prod/portalComponent/resObjectSelect',
        },
      ],
      business: [
        { component: 'Button', componentName: '按钮', uri: '/demo/prod/portalComponent/button' },
        {
          component: 'Confirm',
          componentName: '确认框',
          uri: '/demo/prod/portalComponent/confirm',
        },
        { component: 'Link', componentName: '超链接', uri: '/demo/prod/portalComponent/link' },
        {
          component: 'Loading',
          componentName: '数据加载中',
          uri: '/demo/prod/portalComponent/loading',
        },
        { component: 'Locale', componentName: '国际化', uri: '/demo/prod/portalComponent/locale' },
        { component: 'Modal', componentName: '弹出框', uri: '/demo/prod/portalComponent/modal' },
        {
          component: 'TreeSearch',
          componentName: '搜索树',
          uri: '/demo/prod/portalComponent/treeSearch',
        },
      ],
      layout: [
        {
          component: 'ButtonCard',
          componentName: '按钮容器',
          uri: '/demo/prod/portalComponent/buttonCard',
        },
        { component: 'Card', componentName: '普通容器', uri: '/demo/prod/portalComponent/card' },
        {
          component: 'PageWrapper',
          componentName: '页面容器',
          uri: '/demo/prod/portalComponent/pageWrapper',
        },
        {
          component: 'TabsCard',
          componentName: '页签',
          uri: '/demo/prod/portalComponent/tabsCard',
        },
      ],
    };
  }

  componentDidMount() {}

  render() {
    const { base, business, layout } = this.state;

    return (
      <PageWrapper>
        <Card title="基础输入组件">
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={base}
            renderItem={item => (
              <List.Item>
                {item.componentName}:{' '}
                <Link onClick={() => router.push(item.uri)}>{item.component}</Link>
              </List.Item>
            )}
          />
          ,
        </Card>

        <Card title="业务常用组件">
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={business}
            renderItem={item => (
              <List.Item>
                {item.componentName}:{' '}
                <Link onClick={() => router.push(item.uri)}>{item.component}</Link>
              </List.Item>
            )}
          />
          ,
        </Card>

        <Card title="布局组件">
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={layout}
            renderItem={item => (
              <List.Item>
                {item.componentName}:{' '}
                <Link onClick={() => router.push(item.uri)}>{item.component}</Link>
              </List.Item>
            )}
          />
          ,
        </Card>
      </PageWrapper>
    );
  }
}

export default PortalComponent;
