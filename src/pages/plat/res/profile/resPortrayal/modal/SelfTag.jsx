import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Button, Tag } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import { equals, type } from 'ramda';

@connect(({ loading, resPortrayal, dispatch }) => ({
  resPortrayal,
  dispatch,
  loading,
}))
@mountToTab()
class SelfTagModal extends PureComponent {
  constructor(props) {
    super(props);
    const { visible } = props;
    this.state = {
      visible,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ visible: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { visible } = this.props;
    if (!equals(prevState.visible, visible)) {
      return visible;
    }
    return null;
  }

  onChange = (v, index) => {
    const { visible } = this.state;
    this.setState({ visible }, () => {
      const { onChange } = this.props;
      type(onChange) === 'Function' && onChange(visible, index);
    });
  };

  render() {
    const {
      resPortrayal: {
        formData: { selfTagging },
      },
    } = this.props;
    const { visible } = this.state;

    return (
      <Modal
        title="标签"
        visible={visible}
        onCancel={() => this.onChange()}
        footer={[
          <Button
            className="tw-btn-primary"
            style={{ backgroundColor: '#284488' }}
            key="makeSure"
            onClick={() => this.onChange()}
          >
            确定
          </Button>,
        ]}
        destroyOnClose
        width="60%"
      >
        <div>
          {selfTagging &&
            selfTagging.split(',').map((item, index) => (
              <Tag key={item} color="#DAEDF7" style={{ color: '#000' }}>
                {item}
              </Tag>
            ))}
        </div>
      </Modal>
    );
  }
}

export default SelfTagModal;
