import React from 'react';
import { Divider } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import Card from '@/components/production/layout/Card';
import TreeSearch from '@/components/production/business/TreeSearch';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { systemSelectionListPaging } from '@/services/production/system';

class TreeSearchDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      treeList: [],
    };
  }

  async componentDidMount() {
    const output = await outputHandle(systemSelectionListPaging, { limit: 0 });
    const list = output.data.rows.map(item => ({ ...item, title: item.selectionName }));
    this.setState({ treeList: list });
  }

  render() {
    const { treeList } = this.state;

    return (
      <PageWrapper>
        <Card title="TreeSearch 可搜索树">
          <TreeSearch
            checkable={false}
            showSearch
            list={treeList}
            parentId={null}
            onSelect={this.onSelect}
            onCheck={this.onCheck}
          />
          <Divider />
          <ul style={{ paddingLeft: 0 }}>
            <li>1. 简单使用</li>
          </ul>
        </Card>
      </PageWrapper>
    );
  }
}

export default TreeSearchDemo;
