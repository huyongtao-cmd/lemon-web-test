import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isEmpty, type, equals } from 'ramda';
import { Form, Modal } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import createMessage from '@/components/core/AlertMessage';

import styles from '../style.less';

const DOMAIN = 'planList';

@connect(({ loading, planList, dispatch }) => ({
  loading,
  ...planList,
  dispatch,
}))
@Form.create({})
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: props.url,
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

  handleOk = () => {
    const { projectId } = this.props;
    const { planType, planTypeVal1, url } = this.state;
    if (!planType) {
      createMessage({
        type: 'warn',
        description: '请先选择计划类型',
      });
      return;
    }

    this.handleCancel();
    // 场次管理
    if (url.includes('sessionMgmt')) {
      router.push(
        `/workTable/projectMgmt/sessionMgmt/edit?projectId=${projectId}&scene=${planTypeVal1}&planType=${planType}&mode=EDIT`
      );
    } else {
      router.push(
        `/workTable/projectMgmt/planList/edit?projectId=${projectId}&scene=${planTypeVal1}&planType=${planType}&mode=EDIT`
      );
    }
  };

  handleCancel = e => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        planTypeVisible: false,
      },
    });
  };

  // 配置所需要的内容
  renderPage = () => {
    const { dispatch, formMode, projectId } = this.props;

    const { planType } = this.state;

    return (
      <BusinessForm formData={{}} form={null} formMode={formMode} defaultColumnStyle={24}>
        <FormItem
          label="计划类型"
          key="planType"
          fieldKey="planType"
          fieldType="BaseCustomSelect"
          value={planType}
          form={null}
          parentKey="CUS:PLAN_TYPE"
          onChange={(value, option, allOptions) => {
            if (value) {
              const { extVarchar1 } = option[0];
              this.setState({
                planType: value,
                planTypeVal1: extVarchar1,
              });
              return;
            }

            this.setState({
              planType: undefined,
              planTypeVal1: undefined,
            });
          }}
        />
      </BusinessForm>
    );
  };

  render() {
    const { planTypeVisible } = this.props;

    return (
      <PageWrapper>
        <Modal
          title="计划类型"
          visible={planTypeVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="500px"
          afterClose={() => {
            this.setState({
              planType: undefined,
            });
          }}
          destroyOnClose
        >
          <div className={styles.boxWarp}>{this.renderPage()}</div>
        </Modal>
      </PageWrapper>
    );
  }
}

export default index;
