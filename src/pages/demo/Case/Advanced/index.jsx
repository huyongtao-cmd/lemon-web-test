import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button } from 'antd';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import RichText from '@/components/common/RichText';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
// import TransformDemo from './TreeTransferDemo';
import SelectWithColsDemo from './SelectWithColsDemo'; // eslint-disable-line
import DateTableDemo from './DateTableDemo'; // eslint-disable-line
import EDateTableDemo from './EDateTableDemo'; // eslint-disable-line
import FileManagerDemo from './FileMangegerDemo';

@connect(({ loading, fiddle }) => ({
  loading,
  fiddle,
}))
@mountToTab()
class AdvancedTemplate extends PureComponent {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {}

  render() {
    const { dispatch, loading } = this.props;

    const html = `<div class="ant-card-body" style="background: rgb(238, 238, 238);"><p>点击 打印预览 按钮后，弹出新窗口，渲染loading，同时拉取数据并渲染模版</p><a href="/print" target="_blank"><button type="button" class="ant-btn"><span>打印预览</span></button></a></div>`;

    return (
      <PageHeaderWrapper title="高级组件参考">
        <Card title="富文本" bodyStyle={{ background: '#eee' }}>
          <RichText value={html} onChange={value => console.warn(value)} />
        </Card>
        <br />

        <Card title="打印" bodyStyle={{ background: '#eee' }}>
          <p>点击 打印预览 按钮后，弹出新窗口，渲染loading，同时拉取数据并渲染模版</p>
          <a href="/print" target="_blank">
            <Button>打印预览</Button>
          </a>
        </Card>
        <br />

        <Card title="综合查询表格控件" bodyStyle={{ background: '#eee' }}>
          <DateTableDemo dispatch={dispatch} loading={loading} />
        </Card>
        <br />

        <Card title="Select控件多列" bodyStyle={{ background: '#eee' }}>
          <SelectWithColsDemo />
        </Card>
        <br />

        <Card title="上传下载控件" bodyStyle={{ background: '#eee' }}>
          <FileManagerDemo />
        </Card>
        <br />

        <Card title="树形选择控件" bodyStyle={{ background: '#eee' }}>
          <span>这里强业务组件，不在放出，以防误操作删除数据</span>
          {/* <TransformDemo /> */}
        </Card>
        <br />

        <Card title="可编辑表格控件" bodyStyle={{ background: '#eee' }}>
          <EDateTableDemo />
        </Card>
        <br />
      </PageHeaderWrapper>
    );
  }
}

export default AdvancedTemplate;
