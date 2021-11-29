import React from 'react';

import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';

import { AddrViewContext } from '../customerInfoDetail';

const { Description } = DescriptionList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrDetT8 = props => (
  <AddrViewContext.Consumer>
    {({ formData }) => (
      <DescriptionList size="large" title="个人信息" col={2}>
        <Description term="类型1">{formData.abCat1Name}</Description>
        <Description term="类型2">{formData.abCat2Name}</Description>
        <Description term="类型3">{formData.abCat3Name}</Description>
        <Description term="类型4">{formData.abCat4Name}</Description>
        <Description term="类型5">{formData.abCat5Name}</Description>
        <Description term="类型6">{formData.abCat6Name}</Description>
        <Description term="类型7">{formData.abCat7Name}</Description>
        <Description term="类型8">{formData.abCat8Name}</Description>
        <Description term="类型9">{formData.abCat9Name}</Description>
        <Description term="类型10">{formData.abCat10Name}</Description>
        <Description term="类型11">{formData.abCat11Name}</Description>
        <Description term="类型12">{formData.abCat12Name}</Description>
        <Description term="类型13">{formData.abCat13Name}</Description>
        <Description term="类型14">{formData.abCat14Name}</Description>
        <Description term="类型15">{formData.abCat15Name}</Description>
      </DescriptionList>
    )}
  </AddrViewContext.Consumer>
);

AddrDetT8.Title = props => (
  <AddrViewContext.Consumer>
    {({ tabModified, formData }) => (
      <span className={!formData.abNo ? 'tw-card-multiTab-disabled' : void 0}>
        <Title dir="right" text="类别码" />
      </span>
    )}
  </AddrViewContext.Consumer>
);

export default AddrDetT8;
