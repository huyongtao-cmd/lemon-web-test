import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Button, Input, Modal, Row, Col, Divider, Table } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import styles from './course.less';

@mountToTab()
class DoubleCheck extends PureComponent {
  componentDidMount() {
    const { id } = fromQs;
  }

  render() {
    const {
      dispatch,
      loading,
      visible = false,
      onOk,
      onCancel,
      content = '已获得此单项能力的资源，是否需要复核?',
    } = this.props;

    return (
      <Modal
        destroyOnClose
        title="复核确认"
        visible={visible}
        onOk={onOk}
        onCancel={onCancel}
        width="30%"
      >
        {content}
      </Modal>
    );
  }
}

export default DoubleCheck;
