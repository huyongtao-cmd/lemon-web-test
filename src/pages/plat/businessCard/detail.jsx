import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider, Tooltip } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { fromQs } from '@/utils/stringUtils';

const { Description } = DescriptionList;

const DOMAIN = 'bussinessCard';

@connect(({ loading, bussinessCard, dispatch }) => ({
  dispatch,
  loading,
  bussinessCard,
}))
@mountToTab()
class BussinessCardDetail extends Component {
  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({ type: `${DOMAIN}/clean` });

    const { id } = fromQs();
    // 有id，修改
    id &&
      dispatch({
        type: `${DOMAIN}/flowDetail`,
        payload: { id },
      });
  }

  render() {
    const {
      bussinessCard: { formData, capacityListSelected, dataList },
    } = this.props;
    console.warn('detail', formData);

    return (
      <PageHeaderWrapper>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="名片申请" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="申请人">{formData.name || ''}</Description>
            <Description term="英文名">{formData.ename || ''}</Description>
            <Description term="BaseBU">{formData.baseBuName || ''}</Description>
            <Description term="所属公司">{formData.ouName || ''}</Description>
            <Description term="手机号">{formData.mobile || ''}</Description>
            <Description term="邮箱">{formData.email || ''}</Description>
            <Description term="中文抬头">{formData.ctitle || ''}</Description>
            <Description term="英文抬头">{formData.etitle || ''}</Description>
            <Description term="名片邮寄">
              {formData.mailFlag === 'COMPANY' ? '邮寄到公司' : ''}
              {formData.mailFlag === 'SPECIFIED_ADDR' ? '邮寄到指定地点' : ''}
            </Description>
            {formData.mailFlag === 'COMPANY' ? (
              ''
            ) : (
              <Description term="名片邮寄地址">{formData.mailAddr || ''}</Description>
            )}
          </DescriptionList>
          <DescriptionList size="large" col={1} noTop>
            <Description term="名片特殊要求">
              <pre>{formData.remark1}</pre>
            </Description>
          </DescriptionList>

          {formData.applyResult && (
            <>
              <Divider dashed style={{ top: '17px' }} />
              <DescriptionList size="large" col={2}>
                <Description term="申请结果">
                  {formData.applyResult === 'SHIPPED' ? '已发货' : ''}
                  {formData.applyResult === 'CANCELLED' ? '已取消' : ''}
                </Description>
              </DescriptionList>
              <DescriptionList>
                {formData.applyResult === 'SHIPPED' ? (
                  ''
                ) : (
                  <Description term="取消原因">{formData.cancelReason || ''}</Description>
                )}
              </DescriptionList>
            </>
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BussinessCardDetail;
