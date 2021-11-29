import React from 'react';

import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import { UdcSelect } from '@/pages/gen/field';

import { AddrViewContext } from './index';

const { Description } = DescriptionList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrDetT9 = props => (
  <AddrViewContext.Consumer>
    {({ custData }) => (
      <DescriptionList size="large" title="个人信息" col={2}>
        <Description term="客户编号">{custData.abNo}</Description>
        <Description term="客户ID">{custData.id}</Description>
        <Description term="客户类型">{custData.custCat1Name}</Description>
        <Description term="客户小类">{custData.custCat2Name}</Description>
      </DescriptionList>
    )}
  </AddrViewContext.Consumer>
);

AddrDetT9.Title = props => (
  <AddrViewContext.Consumer>
    {({ tabModified, formData }) => (
      <span className={!formData.abNo ? 'tw-card-multiTab-disabled' : void 0}>
        <Title dir="right" icon={tabModified[8] ? 'warning' : null} text="客户" />
      </span>
    )}
  </AddrViewContext.Consumer>
);

export default AddrDetT9;
