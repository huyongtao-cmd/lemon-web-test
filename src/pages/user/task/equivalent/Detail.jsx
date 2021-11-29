import React, { Component } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Form } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { FileManagerEnhance } from '@/pages/gen/field';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import Link from 'umi/link';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import Loading from '@/components/core/DataLoading';

const { Description } = DescriptionList;

const DOMAIN = 'equivalentDetail';
@Form.create({})
@connect(({ loading, equivalentDetail, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/queryDetail`],
  equivalentDetail,
  dispatch,
}))
@mountToTab()
class EquivalentDetail extends Component {
  componentDidMount() {
    const { id } = fromQs();
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        id,
      },
    });
  }

  render() {
    const {
      loading,
      equivalentDetail: { formData },
    } = this.props;
    const urls = getUrl();
    const from = stringify({ from: urls });
    let href = null;
    if (formData.settlementType === 'TASK_PACKAGE_SETTLE') {
      href = `/plat/intelStl/list/sum/preview?id=${formData.settleId}&${from}`;
    } else if (formData.settlementType === 'BU_ACCOUNT_SETTLE') {
      href = `/plat/intelStl/list/common/preview?id=${formData.settleId}&${from}`;
    }
    return (
      <PageHeaderWrapper>
        {loading ? (
          <Loading />
        ) : (
          <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
            <DescriptionList size="large" col={2} title="任务包基本信息">
              <Description term="结算类型">{formData.settlementTypeName || ''}</Description>
              <Description term="申请当量数">{formData.applyforEqva || ''}</Description>
              <Description term="验收/计价方式">
                {formData.acceptMethodName}/{formData.pricingMethodName}
              </Description>
              <Description term="发包人">{formData.disterResName || undefined}</Description>
              <Description term="复合能力">{formData.capasetLevelName}</Description>
              <Description term="接包人">{formData.receiverResName || undefined}</Description>
              <Description term="事由类型">{formData.reasonTypeName || undefined}</Description>
              <Description term="事由描述">{formData.reasonDescribe || undefined}</Description>
              <Description term="计划开始时间">{formData.planStartDate || ''}</Description>
              <Description term="计划结束时间">{formData.planEndDate || ''}</Description>
            </DescriptionList>
            <DescriptionList size="large" col={1}>
              <Description term="备注">{<pre>{formData.remark}</pre> || ''}</Description>
            </DescriptionList>
            <DescriptionList size="large" col={2}>
              <Description term="申请人">{formData.applyResName || ''}</Description>
              <Description term="申请日期">{formData.applyDate || ''}</Description>
            </DescriptionList>
            {formData.settlementType ? (
              <DescriptionList title="相关信息" size="large" col={2}>
                {formData.settlementType === 'TASK_PACKAGE_SETTLE' && (
                  <Description term="相关任务包">
                    <Link className="tw-link" to={`/user/task/view?id=${formData.taskId}`}>
                      {formData.taskNo}
                    </Link>
                  </Description>
                )}

                <Description term="相关结算单">
                  <Link className="tw-link" to={href}>
                    {formData.settleNo}
                  </Link>
                </Description>
              </DescriptionList>
            ) : null}
          </Card>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default EquivalentDetail;
