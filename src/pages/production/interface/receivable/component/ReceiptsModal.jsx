import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isEmpty, type, equals, isNil } from 'ramda';
import { Form, Modal } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import moment from 'moment';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { genFakeId } from '@/utils/mathUtils';
import { willCollectionSaveRq, willCollectionPagingRq } from '@/services/production/interface';

import styles from '../style.less';

const DOMAIN = 'receivable';

@connect(({ loading, dispatch, receivable }) => ({
  loading,
  dispatch,
  ...receivable,
}))
@Form.create({})
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: props.url,
      date: moment(new Date()).format('YYYY-MM-DD'),
    };
  }

  componentDidMount() {
    const { url } = this.props;
    this.setState({
      url,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { url: nextUrl } = nextProps;
    const { url } = this.state;
    if (!equals(url, nextUrl)) {
      this.setState({
        url: nextUrl,
      });
    }
  }

  modifyData = async params => {
    const { selectedRows } = this.props;
    selectedRows.forEach(item => {
      const v = item;
      v.djrq = params;
    });
    const { response } = await willCollectionSaveRq(selectedRows);
    return response;
  };

  handleOk = () => {
    const { date } = this.state;
    this.modifyData(date);
    this.handleCancel();
  };

  handleCancel = e => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        receiptsVisible: false,
      },
    });
    this.setState({
      date: moment(new Date()).format('YYYY-MM-DD'),
    });
    if (isNil(e)) {
      closeThenGoto(`/plat/interface/receivable?refresh=${genFakeId(-1)}`);
    }
  };

  // 配置所需要的内容
  renderPage = () => {
    const { dispatch, formMode, projectId } = this.props;
    const { date } = this.state;

    return (
      <BusinessForm formData={{}} formMode={formMode} defaultColumnStyle={24}>
        <FormItem
          label="单据日期"
          fieldType="BaseDatePicker"
          key="djrq"
          fieldKey="djrq"
          defaultShow
          value={date}
          onChange={value => {
            this.setState({
              date: value,
            });
          }}
        />
      </BusinessForm>
    );
  };

  render() {
    const { receiptsVisible } = this.props;

    return (
      <PageWrapper>
        <Modal
          title="单据日期"
          visible={receiptsVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="500px"
          afterClose={() => {}}
          destroyOnClose
        >
          <div className={styles.boxWarp}>{this.renderPage()}</div>
        </Modal>
      </PageWrapper>
    );
  }
}

export default index;
