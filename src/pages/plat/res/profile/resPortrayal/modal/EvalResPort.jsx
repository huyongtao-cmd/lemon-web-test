import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Button, Rate } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import DescriptionList from '@/components/layout/DescriptionList';
import { equals, type } from 'ramda';

const { Description } = DescriptionList;

@connect(({ loading, resPortrayal, dispatch }) => ({
  resPortrayal,
  dispatch,
  loading,
}))
@mountToTab()
class ResCertModal extends PureComponent {
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
      dispatch,
      resPortrayal: { twEvalResPortView },
    } = this.props;
    const { visible } = this.state;

    return (
      <Modal
        title="评价详情"
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
        width="80%"
      >
        <DescriptionList size="large" col={2}>
          {twEvalResPortView.map((item, index) => (
            <Description key={item.evalPoint} term={item.evalPoint}>
              <Rate
                key={item.evalPoint}
                disabled
                count={10}
                defaultValue={2}
                value={Number(item.synEvalScore || 0)}
              />
            </Description>
          ))}
        </DescriptionList>
      </Modal>
    );
  }
}

export default ResCertModal;
