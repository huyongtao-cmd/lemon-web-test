import React from 'react';

import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import { UdcSelect } from '@/pages/gen/field';

import { AddrViewContext } from './index';

const { Description } = DescriptionList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrDetT10 = props => (
  <AddrViewContext.Consumer>
    {({ supplierData }) => (
      <DescriptionList size="large" title="供应商信息" col={2}>
        <Description term="供应商编号">{supplierData.abNo}</Description>
        <Description term="供应商ID">{supplierData.id}</Description>
      </DescriptionList>
    )}
  </AddrViewContext.Consumer>
);

AddrDetT10.Title = props => (
  <AddrViewContext.Consumer>
    {({ tabModified, formData }) => (
      <span className={!formData.abNo ? 'tw-card-multiTab-disabled' : void 0}>
        <Title dir="right" icon={tabModified[9] ? 'warning' : null} text="供应商" />
      </span>
    )}
  </AddrViewContext.Consumer>
);

export default AddrDetT10;
