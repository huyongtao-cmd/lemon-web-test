import React from 'react';
import { Modal, Select } from 'antd';

class ModalForReject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      branch: '',
    };
  }

  onOk = () => {};

  render() {
    const { visible, onOk, onCancel, onChange, options } = this.props;
    const { branch } = this.state;
    return (
      <Modal
        align="center"
        // destroyOnClose
        title="选择退回节点"
        visible={visible}
        onOk={onOk}
        onCancel={onCancel}
        width="50%"
      >
        <Select className="x-fill-100" value={branch} onChange={onChange}>
          {options.map(o => (
            <Select.Option value={o.code}>{o.name}</Select.Option>
          ))}
        </Select>
      </Modal>
    );
  }
}

export default ModalForReject;
