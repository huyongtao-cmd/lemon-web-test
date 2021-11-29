import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isEmpty, type } from 'ramda';
import { Form, Modal } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import createMessage from '@/components/core/AlertMessage';
import { ProductFormItemBlockConfig } from '@/utils/pageConfigUtils';
import { fromQs } from '@/utils/production/stringUtil';

import styles from '../style.less';

const DOMAIN = 'projectPlanMgmt';

@connect(({ loading, projectPlanMgmt, dispatch }) => ({
  loading,
  ...projectPlanMgmt,
  dispatch,
}))
@Form.create({})
class index extends Component {
  state = {};

  handleOk = () => {
    const { planType, planTypeVal1 } = this.state;
    const { projectId } = this.props;
    if (!planType) {
      createMessage({
        type: 'warn',
        description: '请先选择计划类型',
      });
      return;
    }

    this.handleCancel();
    router.push(
      `/workTable/projectMgmt/planList/edit?projectId=${projectId}&scene=${planTypeVal1}&planType=${planType}&mode=EDIT&from=PLAN`
    );
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
    const { dispatch, formMode } = this.props;

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
              planType: 'SCENE',
            });
          }}
        >
          <div className={styles.boxWarp}>{this.renderPage()}</div>
        </Modal>
      </PageWrapper>
    );
  }
}

export default index;
