import React from 'react';
import { indexOf } from 'ramda';

import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import { FileManagerEnhance } from '@/pages/gen/field';

import { AddrViewContext } from './index';
import FormItem from '@/components/production/business/FormItem';

const { Description } = DescriptionList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrDetT11 = props => (
  <AddrViewContext.Consumer>
    {({ coopData, attachments, attachments1, attachments2 }) => (
      <>
        <DescriptionList size="large" title="合作伙伴" col={2}>
          {/* <Description term="合作伙伴类型">{coopData.coopTypeDesc}</Description> */}
          <Description term="合作伙伴编号">{coopData.abNo || ''}</Description>
          <Description term="企业简介">{coopData.coopInfo || ''}</Description>
          <Description term="企业法人">{coopData.coopLegalPresonName || ''}</Description>
          <Description term="企业地址">{coopData.coopAddress || ''}</Description>
          <Description term="企业规模">{coopData.coopSaleName || ''}</Description>
          <Description term="合作等级">{coopData.coopLevel || ''}</Description>
          <Description term="典型客户">{coopData.coopTypicalCustomer || ''}</Description>
          <Description term="合作类别">{coopData.coopServiceTypeName || ''}</Description>
          <Description term="产品/服务名称">{coopData.coopServiceName || ''}</Description>
          <Description term="合作伙伴角色">{coopData.coopChargePersonRoleName || ''}</Description>
          <Description term="合作伙伴姓名">{coopData.coopChargePersonName || ''}</Description>
          <Description term="合作伙伴职位">{coopData.coopChargePersonPosition || ''}</Description>
          <Description term="合作伙伴电话">{coopData.coopChargePersonPhone || ''}</Description>
          <Description term="合作伙伴邮箱">{coopData.coopChargePersonEmail || ''}</Description>
          <Description term="合作伙伴等级">{coopData.coopPartnerLevel || ''}</Description>
          <Description term="合作类别">{coopData.coopCategory || ''}</Description>
          {/* <Description term="合作伙伴类型">{coopData.coopTypeDesc}</Description> */}
          <Description term="合作状态">{coopData.coopStatusDesc || ''}</Description>
          <Description term="合作区域">{coopData.coopArea || ''}</Description>
          {/* <Description term="合作评估">{coopData.coopEvaluationDesc}</Description> */}
          {/* <Description term="对接人联系方式">{coopData.coopPicContact}</Description> */}
          <Description term="对接人类型">{coopData.counterpart || ''}</Description>
          <Description term="合作伙伴发展经理">{coopData.pdmName || ''}</Description>
          <Description term="我司负责人BU">{coopData.pdmBuId || ''}</Description>
          <Description term="我司负责人电话">{coopData.pdmTel || ''}</Description>
          <Description term="我司负责人邮箱">{coopData.pdmEmail || ''}</Description>
          {/* <Description term="公司介绍附件">
            <FileManagerEnhance
              api="/api/person/v1/coop/sfs/token"
              dataKey={coopData.id}
              listType="text"
              disabled
              preview
            />
          </Description>
          <Description term="产品介绍附件">
            <FileManagerEnhance
              api="/api/person/v1/coop/product/sfs/token"
              dataKey={coopData.id}
              listType="text"
              disabled
              preview
            />
          </Description>
          <Description term="合作协议附件">
            <FileManagerEnhance
              api="/api/person/v1/coop/collaborate/sfs/token"
              dataKey={coopData.id}
              listType="text"
              disabled
              preview
            />
          </Description> */}
          <Description term="公司介绍附件">
            <FormItem fieldType="FileUpload" fileList={attachments} fieldKey="attache" preview />
          </Description>
          <Description term="产品介绍附件">
            <FormItem fieldType="FileUpload" fileList={attachments1} fieldKey="attache1" preview />
          </Description>
          <Description term="合作协议附件">
            <FormItem fieldType="FileUpload" fileList={attachments2} fieldKey="attache2" preview />
          </Description>
          <Description term="合作期限">
            {coopData.coopPeriodFrom &&
              coopData.coopPeriodTo &&
              `${coopData.coopPeriodFrom} ~ ${coopData.coopPeriodTo}`}
          </Description>
        </DescriptionList>
        <DescriptionList col={1}>
          <Description term="合作期间说明">
            <pre>{coopData.coopPeriodDesc}</pre>
          </Description>
        </DescriptionList>
        <DescriptionList col={1}>
          <Description term="合作伙伴关键词">
            <pre>{coopData.coopKey}</pre>
          </Description>
        </DescriptionList>
      </>
    )}
  </AddrViewContext.Consumer>
);

AddrDetT11.Title = props => (
  <AddrViewContext.Consumer>
    {({ tabModified, formData, coopData }) => {
      const relateType = formData.relateType || '';
      const relateTypeArr = Array.isArray(relateType) ? relateType : relateType.split(',');

      return (
        <span className={indexOf('03', relateTypeArr) < 0 ? 'tw-card-multiTab-disabled' : void 0}>
          <Title dir="right" icon={tabModified[10] ? 'warning' : null} text="合作伙伴" />
        </span>
      );
    }}
  </AddrViewContext.Consumer>
);

export default AddrDetT11;
