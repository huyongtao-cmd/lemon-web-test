import React from 'react';
import { Modal, Tree } from 'antd';

const { DirectoryTree, TreeNode } = Tree;

class BuModal extends React.Component {
  constructor(props) {
    super(props);
    const { value, mode, visible, items } = this.props;
    this.state = {
      visible,
      values: {},
    };
  }

  onSelect = (data, e) => {
    // console.log('Trigger Select');
    this.setState({
      values: e.node.props.value,
    });
  };

  onExpand = () => {
    // console.log('Trigger Expand');
  };

  // 点击确定按钮
  handlePressEnter = e => {
    const { handleOk } = this.props;
    const { values } = this.state;
    handleOk.apply(this.state, [e, values]);
  };

  // 点击取消按钮
  onToggle = e => {
    const { handleCancel } = this.props;
    handleCancel.apply(this.state, [e]);
  };

  render() {
    // const { visible, handleOk, handleCancel, loading, items } = this.props;
    const { visible, items } = this.props;

    // 递归渲染树节点
    const loop = data =>
      data.map(item => {
        if (item.children) {
          return (
            <TreeNode key={item.id} title={item.buName} value={item}>
              {loop(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode key={item.id} title={item.buName} value={item} />;
      });

    return (
      <Modal
        destroyOnClose
        title="选择Bu"
        visible={visible}
        onOk={this.handlePressEnter}
        onCancel={this.onToggle}
        // fix :: 树的内容太多，导致弹窗太长然后滚屏，限制高度，内部滚动
        bodyStyle={{
          height: 400,
          overflowY: 'auto',
        }}
      >
        {items && items.length ? (
          <DirectoryTree
            multiple
            defaultExpandAll
            onSelect={this.onSelect}
            onExpand={this.onExpand}
          >
            {items && loop(items)}
          </DirectoryTree>
        ) : (
          <div style={{ textAlign: 'center', margin: 10 }}>暂无数据</div>
        )}
      </Modal>
    );
  }
}

export default BuModal;
