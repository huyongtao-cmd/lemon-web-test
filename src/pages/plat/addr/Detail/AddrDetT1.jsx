import React from 'react';

import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';

import { AddrViewContext } from './index';

const { Description } = DescriptionList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrDetT1 = props => (
  <AddrViewContext.Consumer>
    {({ formData }) => (
      <DescriptionList size="large" title="基本信息" col={2}>
        <Description term="地址簿名称">{formData.abName}</Description>
        <Description term="地址簿编号">{formData.abNo}</Description>
        <Description term="地址簿类型">{formData.abTypeName}</Description>
        <Description term="唯一识别号">{formData.idenNo}</Description>
        <Description term="相关主档">{formData.relateTypeName}</Description>
        <Description term="法人地址薄">{formData.legalAbNo}</Description>
      </DescriptionList>
    )}
  </AddrViewContext.Consumer>
);

AddrDetT1.Title = props => (
  <AddrViewContext.Consumer>
    {({ tabModified, formData }) => (
      <span>
        <Title dir="right" text="基本信息" />
      </span>
    )}
  </AddrViewContext.Consumer>
);

export default AddrDetT1;
