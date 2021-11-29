import React from 'react';

import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import { formatDT } from '@/utils/tempUtils/DateTime';

import { AddrViewContext } from './index';

const { Description } = DescriptionList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrDetT2 = props => (
  <AddrViewContext.Consumer>
    {({ personData }) => (
      <DescriptionList size="large" title="个人信息" col={2}>
        <Description term="姓名（中文）">{personData.personName}</Description>
        <Description term="姓名（外文）">{personData.foreignName}</Description>
        <Description term="证件类型">{personData.idTypeName}</Description>
        <Description term="证件号">{personData.idNo}</Description>
        <Description term="性别">{personData.genderName}</Description>
        <Description term="生日">
          {personData.birthday && formatDT(personData.birthday)}
        </Description>
        <Description term="国籍">{personData.nationalityName}</Description>
        <Description term="籍贯">{personData.birthplaceName}</Description>
        <Description term="民族">{personData.nationName}</Description>
        <Description term="婚姻状况">{personData.maritalName}</Description>
        <Description term="证件有效期从">
          {personData.idValidFrom && formatDT(personData.idValidFrom)}
        </Description>
        <Description term="证件有效期至">
          {personData.idValidTo && formatDT(personData.idValidTo)}
        </Description>
      </DescriptionList>
    )}
  </AddrViewContext.Consumer>
);

AddrDetT2.Title = props => (
  <AddrViewContext.Consumer>
    {({ tabModified, formData }) => (
      <span
        className={
          !formData.abNo || formData.abType !== '01' ? 'tw-card-multiTab-disabled' : void 0
        }
      >
        <Title dir="right" text="个人信息" />
      </span>
    )}
  </AddrViewContext.Consumer>
);

export default AddrDetT2;
