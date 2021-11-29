import React, { Component } from 'react';
import { Modal, Radio } from 'antd';

const { Group: RadioGroup } = Radio;

const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};

class BpmRollbackModal extends Component {
  constructor(props) {
    super(props);
    const { branchValue = undefined, visible = false, branches = [] } = props;
    this.state = {
      visible,
      selectValue: branchValue,
      branches,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps !== prevState) {
      return {
        ...nextProps,
      };
    }
    return null;
  }

  componentWillUnmount() {
    this.setState({
      visible: false,
      selectValue: undefined,
      branches: [],
    });
  }

  handleOk = () => {
    const { selectValue } = this.state;
    this.handleCancel(selectValue);
  };

  handleCancel = (value = undefined) => {
    const { onBranchSelect } = this.props;
    onBranchSelect && onBranchSelect(value);
  };

  render() {
    const { visible, selectValue, branches } = this.state;
    return (
      <Modal
        title="请选择退回节点"
        width={800}
        okButtonProps={{ disabled: !selectValue }}
        onOk={this.handleOk}
        visible={visible}
        onCancel={() => this.handleCancel()}
      >
        <RadioGroup
          onChange={e => this.setState({ selectValue: e.target.value })}
          value={selectValue}
        >
          {branches.map(({ code, name }) => (
            <Radio key={code} style={radioStyle} value={code}>
              {name}
            </Radio>
          ))}
        </RadioGroup>
      </Modal>
    );
  }
}

export default BpmRollbackModal;
