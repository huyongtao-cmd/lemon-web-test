import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Select, Divider } from 'antd';
import DescriptionList from '@/components/layout/DescriptionList';
import Title from '@/components/layout/Title';

import { mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { AddrViewContext } from '../customerInfoDetail';

const DOMAIN = 'customer';
const { Description } = DescriptionList;

@connect(({ loading, dispatch, customer }) => ({
  loading,
  dispatch,
  customer,
}))
@mountToTab()
class AddrDetT0 extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/customerDetails`,
      payload: id,
    });
  }

  render() {
    const {
      customer: { formData },
    } = this.props;

    return (
      <>
        <DescriptionList size="large" col={2} title="企业基本信息">
          <Description term="公司名称">{formData.custName || ''}</Description>
          <Description term="区域/省份/城市">
            {formData.custRegIonName ? formData.custRegIonName + '/' : ''}
            {formData.provInceName ? formData.provInceName + '/' : ''}
            {formData.cityName}
          </Description>
          <Description term="总机固话">{formData.switchBoard || ''}</Description>
          <Description term="公司邮箱">{formData.companyEmail || ''}</Description>
        </DescriptionList>
        <DescriptionList size="large" col={1}>
          <Description term="公司总部地址">
            <pre>{formData.headOfficeAddr || ''}</pre>
          </Description>
        </DescriptionList>
        <DescriptionList size="large" col={2}>
          <Description term="客户标签1">{formData.custLabel1 || ''}</Description>
          <Description term="客户标签2">{formData.custLabel2 || ''}</Description>
          <Description term="客户标签3">{formData.custLabel3 || ''}</Description>
          <Description term="客户标签4">{formData.custLabel4 || ''}</Description>
          <Description term="客户标签5">{formData.custLabel5 || ''}</Description>
          <Description term="客户标签6">{formData.custLabel6 || ''}</Description>
          <Description term="客户标签7">{formData.custLabel7 || ''}</Description>
          <Description term="客户标签8">{formData.custLabel8 || ''}</Description>
          <Description term="客户标签9">{formData.custLabel9 || ''}</Description>
          <Description term="客户标签10">{formData.custLabel10 || ''}</Description>
        </DescriptionList>
        <DescriptionList size="large" col={1}>
          <Description term="数据来源">{formData.dataFrom || ''}</Description>
        </DescriptionList>
        <DescriptionList size="large" col={1}>
          <Description term="备注">
            <pre>{formData.remark || ''}</pre>
          </Description>
        </DescriptionList>
        <Divider dashed />
        <DescriptionList size="large" col={2} title="企业主要联系人">
          <Description term="董事长(总经理)-姓名/电话/邮箱" labelWidth="260">
            {formData.chairManName ? formData.chairManName + '/' : ''}
            {formData.chairManTel ? formData.chairManTel + '/' : ''}
            {formData.chairManEmail}
          </Description>
          <Description term="IT负责人-姓名/电话/邮箱" labelWidth="260">
            {formData.itAdminName ? formData.itAdminName + '/' : ''}
            {formData.itAdminTel ? formData.itAdminTel + '/' : ''}
            {formData.itAdminEmail}
          </Description>
          <Description term="其他负责人-姓名/电话/邮箱" labelWidth="260">
            {formData.otherPicName ? formData.otherPicName + '/' : ''}
            {formData.otherPicTel ? formData.otherPicTel + '/' : ''}
            {formData.otherPicEmail}
          </Description>
        </DescriptionList>
        <Divider dashed />
        <DescriptionList size="large" col={2} title="管理信息">
          <Description term="状态">{formData.custStatusName || ''}</Description>
          <Description term="数据完善度(%)">{formData.dataInteGrity || ''}</Description>
          <Description term="数据校验人">{formData.dataCheckerName || ''}</Description>
          <Description term="销售VP">{formData.saleVpName || ''}</Description>
          <Description term="销售负责人">{formData.salePicName || ''}</Description>
          <Description term="数据派发日期">{formData.assingDate || ''}</Description>
        </DescriptionList>
        <DescriptionList size="large" col={2}>
          <Description term="数据最后校验日期">{formData.lastCheckDate || ''}</Description>
          <Description term="数据最后更新日期">{formData.lastModifyDate || ''}</Description>
        </DescriptionList>
        <DescriptionList size="large" col={1}>
          <Description term="更新履历">
            <pre>{formData.modifyRecord || ''}</pre>
          </Description>
        </DescriptionList>
      </>
    );
  }
}

AddrDetT0.Title = props => (
  <AddrViewContext.Consumer>
    {({ tabModified, formData }) => (
      <span>
        <Title dir="right" text="客户详情" />
      </span>
    )}
  </AddrViewContext.Consumer>
);

export default AddrDetT0;
