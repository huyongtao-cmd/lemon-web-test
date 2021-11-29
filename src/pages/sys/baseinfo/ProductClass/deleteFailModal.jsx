import React from 'react';
import { Modal } from 'antd';

const ModalDemo = ({ visible, onToggle }) => (
  <Modal destroyOnClose title="警告" visible={visible} onOk={onToggle} onCancel={onToggle}>
    操作失败。
  </Modal>
);

export default ModalDemo;
