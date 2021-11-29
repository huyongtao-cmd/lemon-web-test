import React from 'react';
import { Card, Col, Modal, Popover, Tree } from 'antd';

const { DirectoryTree, TreeNode } = Tree;

class ModalDemo extends React.Component {
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

  render() {
    const { visible, handleOk, handleCancel, loading, items } = this.props;
    const { values } = this.state;

    // 递归渲染树节点
    const loop = data =>
      data.map(item => {
        if (item.children) {
          return (
            <TreeNode key={item.key} title={item.title} value={item}>
              {loop(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode key={item.key} title={item.title} value={item} />;
      });

    // 点击确定按钮
    const handlePressEnter = e => {
      handleOk.apply(this.state, [e, values]);
    };
    // 点击取消按钮
    const onToggle = e => {
      handleCancel.apply(this.state, [e]);
    };

    return (
      <Modal
        destroyOnClose
        title="选择Bu"
        visible={visible}
        onOk={handlePressEnter}
        onCancel={onToggle}
      >
        <DirectoryTree multiple defaultExpandAll onSelect={this.onSelect} onExpand={this.onExpand}>
          {items && loop(items)}
        </DirectoryTree>
      </Modal>
    );
  }
}

export default ModalDemo;
