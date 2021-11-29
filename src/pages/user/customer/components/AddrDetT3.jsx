import React from 'react';

import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import { formatDT } from '@/utils/tempUtils/DateTime';

import { AddrViewContext } from '../customerInfoDetail';

const { Description } = DescriptionList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrDetT3 = props => (
  <AddrViewContext.Consumer>
    {({ ouData }) => (
      <DescriptionList size="large" title="公司信息" col={2}>
        <Description term="公司名">{ouData.ouName}</Description>
        <Description term="公司类型">{ouData.ouTypeName}</Description>
        <Description term="税号">{ouData.taxRegNo}</Description>
        <Description term="税率">{ouData.taxRateName}</Description>
        <Description term="内部/外部">{ouData.innerTypeName}</Description>
        <Description term="公司性质">{ouData.ouPropName}</Description>
        <Description term="公司区域">{ouData.regionCodeName}</Description>
        <Description term="母公司">{ouData.pidName}</Description>
        <Description term="企业主页">
          {ouData.website ? `http://${ouData.website}` : ''}
        </Description>
        <Description term="所属行业">{ouData.industryName}</Description>
        <Description term="单位规模">{ouData.scaleTypeName}</Description>
        <Description term="主交易货币">{ouData.currCodeName}</Description>
        <Description term="主要语言">{ouData.langCodeName}</Description>
        <Description term="公司状态">{ouData.ouStatusName}</Description>
      </DescriptionList>
    )}
  </AddrViewContext.Consumer>
);

AddrDetT3.Title = props => (
  <AddrViewContext.Consumer>
    {({ tabModified, formData }) => (
      <span
        className={
          !formData.abNo || formData.abType !== '02' ? 'tw-card-multiTab-disabled' : void 0
        }
      >
        <Title dir="right" text="公司信息" />
      </span>
    )}
  </AddrViewContext.Consumer>
);

export default AddrDetT3;
