import React, { Component } from 'react';
// import { mountToTab } from '@/layouts/routerControl';
import Transfer, { treeToPlain, plainToTree } from '@/components/common/TreeTransfer';
import { getRaabs } from '@/services/sys/iam/raabs';

const structure = {
  id: 'code',
  pid: 'pcode',
  children: 'children',
  selected: 'selected',
};

// @mountToTab()
class SearchTree extends Component {
  state = {
    dataSource: [],
  };

  componentDidMount() {
    this.fetchList();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      this.fetchList();
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { defaultCheckedKeys } = this.props;
    if (prevProps.defaultCheckedKeys !== defaultCheckedKeys) {
      return true;
    }
    return null;
  }

  fetchList = () => {
    const { defaultCheckedKeys = [] } = this.props;
    getRaabs().then(data => {
      if (data.response) {
        const { response } = data;
        const tree = Array.isArray(response.rows) ? response.rows : [];
        const { plain } = treeToPlain(tree, structure);
        defaultCheckedKeys.map(checked => {
          plain.find(p => p[structure.id] === checked)[structure.selected] = true;
          return checked;
        });
        this.setState({
          dataSource: plain,
        });
      }
    });
  };

  onChange = (activeKeys, activeData, newDataSource) => {
    const { onChange } = this.props;
    // eslint-disable-next-line
    console.warn('activeKeys --->', activeKeys, activeData);
    this.setState({
      dataSource: newDataSource,
    });
    if (onChange) onChange(activeKeys, activeData);
  };

  render() {
    const { dataSource } = this.state;
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '编码',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '领域',
        dataIndex: 'dcode',
        key: 'dcode',
      },
      {
        title: '父编码',
        dataIndex: 'pcode',
        key: 'pcode',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
      },
    ];

    return (
      <Transfer
        type="plain"
        text="name"
        dataSource={dataSource}
        structure={structure}
        columns={columns}
        onChange={this.onChange}
      />
    );
  }
}

export default SearchTree;
