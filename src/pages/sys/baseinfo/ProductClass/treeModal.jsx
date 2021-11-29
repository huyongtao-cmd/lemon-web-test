import React from 'react';
import { Tree, Form, Modal } from 'antd';

@Form.create()
class TreeModal extends React.PureComponent {
  render() {
    const { tree, visible, treeModalCancel, formData, selectedOk, selectClass } = this.props;

    const loop = data =>
      data.map(item => {
        if (item.child) {
          return (
            <Tree.TreeNode key={item.id} title={item.className}>
              {loop(item.child)}
            </Tree.TreeNode>
          );
        }
        return <Tree.TreeNode key={item.id} title={item.className} />;
      });

    return (
      <Modal
        destroyOnClose
        title="分类列表"
        visible={visible}
        onOk={selectedOk}
        onCancel={treeModalCancel}
      >
        {tree && tree.length ? (
          <Tree onSelect={selectClass}>{loop(tree)}</Tree>
        ) : (
          <div style={{ textAlign: 'center', margin: 10 }}>暂无数据</div>
        )}
      </Modal>
    );
  }
}

export default TreeModal;
