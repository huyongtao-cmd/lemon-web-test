import React, { PureComponent } from 'react';
import { Modal, Tree } from 'antd';

const dataSource = {
  expandedKeys: [],
  autoExpandParent: true,
  checkedKeys: [],
  selectedKeys: [],
};
/**
 * 财务科目模版多选树形modal
 */
class AccTmplMutiModal extends PureComponent {
  state = {
    ...dataSource,
    // selectValues: '',
  };

  componentDidMount() {}

  // static getDerivedStateFromProps(nextProps, state) {
  //   const { dataSource, visible } = nextProps;
  //   const { expandedKeys, checkedKeys, selectedKeys } = state;
  //   const keys = dataSource.map(item => item.code).filter(v => !!v);

  //   return {
  //     checkedKeys: visible ? checkedKeys : keys,
  //     expandedKeys: visible ? expandedKeys : keys,
  //     selectedKeys: visible ? selectedKeys : keys,
  //   };
  // }

  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: true,
    });
  };

  onCheck = checkedKeys => {
    this.setState({ checkedKeys });
  };

  onSelect = (selectedKeys, e) => {
    this.setState({ selectedKeys, selectValues: e.node.props });
  };

  handleSave = e => {
    const { onOk } = this.props;
    const { checkedKeys } = this.state;
    onOk.apply(this.state, [e, checkedKeys]);
    this.setState({
      ...dataSource,
    });
  };

  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <Tree.TreeNode title={item.title} key={item.key} dataRef={item} disabled={item.disabled}>
            {this.renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }
      return <Tree.TreeNode {...item} disabled={item.disabled} />;
    });

  render() {
    const { visible, onCancel, title, modalTreeData } = this.props;
    const { expandedKeys, autoExpandParent, checkedKeys, selectedKeys } = this.state;

    return (
      <Modal
        destroyOnClose
        title={title}
        visible={visible}
        // fix :: 树的内容太多，导致弹窗太长然后滚屏，限制高度，内部滚动
        bodyStyle={{
          height: 400,
          overflowY: 'auto',
        }}
        onOk={this.handleSave}
        onCancel={onCancel}
      >
        {modalTreeData && modalTreeData.length ? (
          <Tree
            checkable
            onExpand={this.onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            onCheck={this.onCheck}
            onSelect={this.onSelect}
            checkedKeys={checkedKeys}
            selectedKeys={selectedKeys}
          >
            {this.renderTreeNodes(modalTreeData)}
          </Tree>
        ) : (
          <div style={{ textAlign: 'center', margin: 10 }}>暂无数据</div>
        )}
      </Modal>
    );
  }
}

export default AccTmplMutiModal;
