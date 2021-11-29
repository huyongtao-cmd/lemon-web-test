import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Button, Tag } from 'antd';
import DescriptionList from '@/components/layout/DescriptionList';
import { mountToTab } from '@/layouts/routerControl';
import { equals, type } from 'ramda';

const { Description } = DescriptionList;

@connect(({ loading, resPortrayal, dispatch }) => ({
  resPortrayal,
  dispatch,
  loading,
}))
@mountToTab()
class CompoundAbilityModal extends PureComponent {
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
      resPortrayal: { twCompoundAbilityViewList },
    } = this.props;
    const { visible } = this.state;

    return (
      <Modal
        title="复合能力"
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
          <DescriptionList size="large" col={1}>
            {twCompoundAbilityViewList.map((item, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Description key={index} term={item.jobType1Desc}>
                {Array.isArray(item.jobType1List)
                  ? item.jobType1List.map(v => (
                      // eslint-disable-next-line react/jsx-indent
                      <Tag key={v.merge} color="#DAEDF7" style={{ color: '#000' }}>
                        {v.merge}
                      </Tag>
                    ))
                  : ''}
              </Description>
            ))}
          </DescriptionList>
        </div>
      </Modal>
    );
  }
}

export default CompoundAbilityModal;
