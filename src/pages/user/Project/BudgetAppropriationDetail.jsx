// 最常用的引入,基本每个页面都需要的组件
import React, { Fragment, PureComponent } from 'react';
import { Button, Card, Checkbox, Divider, Tooltip } from 'antd';
import { connect } from 'dva';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import Link from 'umi/link';
import router from 'umi/router';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';

const { Description } = DescriptionList;

const DOMAIN = 'budgetAppropriationDetail';

@connect(({ loading, budgetAppropriationDetail, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...budgetAppropriationDetail,
  dispatch,
  user,
}))
@mountToTab()
class BudgetAppropriationDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;

    const param = fromQs();
    this.fetchData(param);

    param.taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: param.taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  render() {
    const { formData, loading, fieldsConfig, flowForm, dispatch } = this.props;
    const param = fromQs();

    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={loading}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { taskKey } = fieldsConfig;
            const { key } = operation;
            const payload = {
              taskId: param.taskId,
              remark: bpmForm.remark,
            };

            if (key === 'EDIT') {
              router.push(
                `/user/project/budgetAppropriationEdit?id=${formData.id}&taskId=${param.taskId}`
              );
              return Promise.resolve(false);
            }

            if (key === 'APPROVED') {
              // promise 为true,默认走后续组件流程的方法
              return Promise.resolve(true);
            }

            if (key === 'REJECTED') {
              return Promise.resolve(true);
            }

            return Promise.resolve(false);
          }}
        >
          <Card
            title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
            bordered={false}
            className="tw-card-adjust"
          >
            <DescriptionList size="large" col={2} hasSeparator>
              <Description term="拨付单号">{formData.appropriationNo}</Description>
              <Description term="申请拨付费用金额">{formData.applyFeeAmt}</Description>
              <Description term="申请拨付当量数/金额">
                {`${formData.applyEqva}/${formData.applyEqvaAmt}`}
              </Description>
              <Description term="申请拨付总金额">{formData.applyAmt}</Description>
              {/* <Description term="拨付金额">{formData.amt}</Description> */}
              <Description term="拨付状态">{formData.appropriationStatusDesc}</Description>
              <Description term="申请人">{formData.resName}</Description>
              <Description term="申请时间">{formData.applyDate}</Description>
              <Description term="备注">{formData.remark}</Description>
            </DescriptionList>
          </Card>
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default BudgetAppropriationDetail;
