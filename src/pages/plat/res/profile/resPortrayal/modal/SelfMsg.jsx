import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Button, Row, Col, Divider } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import { equals, type } from 'ramda';
import DescriptionList from '@/components/layout/DescriptionList';

const { Description } = DescriptionList;

@connect(({ loading, resPortrayal, dispatch }) => ({
  resPortrayal,
  dispatch,
  loading,
}))
@mountToTab()
class SelfMsgModal extends PureComponent {
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
      resPortrayal: { formData },
    } = this.props;
    const { visible } = this.state;
    return (
      <Modal
        title="资源信息"
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
        <Row gutter={16} style={{ textAlign: 'center', fontWeight: 'bolder' }}>
          <Col span={12}>
            {formData.resType1Name || ''}
            {formData.resType1Name && formData.resType2Name ? '/' : ''}
            {formData.resType2Name || ''}
          </Col>
          <Col span={12}>
            {formData.departmentName || ''}
            {formData.departmentName && formData.cityName ? '/' : ''}
            {formData.cityName || ''}
          </Col>
        </Row>
        <DescriptionList size="large" col={2}>
          <Description term="是否出差">{formData.busitripFlagName || ''}</Description>
          <Description term="服务方式">{formData.serviceTypeName || ''}</Description>
          <Description term="服务时间段">
            {formData.serviceClockFrom || ''}
            {formData.serviceClockFrom ? ' ~ ' : ''}
            {formData.serviceClockTo || ''}
          </Description>
          <Description term="手机">{formData.mobile || ''}</Description>
          <Description term="平台邮箱">{formData.emailAddr || ''}</Description>
          <Description term="个人邮箱">{formData.email || ''}</Description>
          <Description term="社交号码">
            {formData.snsType || ''}
            {formData.snsType ? '-' : ''}
            {formData.snsNo || ''}
          </Description>
        </DescriptionList>
        <DescriptionList size="large" col={1}>
          <Description term="通讯地址">{formData.detailaddr || ''}</Description>
        </DescriptionList>
      </Modal>
    );
  }
}

export default SelfMsgModal;
