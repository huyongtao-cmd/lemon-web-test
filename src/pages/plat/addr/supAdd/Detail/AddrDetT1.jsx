import React from 'react';

import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import { formatDT } from '@/utils/tempUtils/DateTime';

import { AddrViewContext } from './index';

const { Description } = DescriptionList;

const getDesc = (data, code) => {
  const res = data.filter(v => v.valCode === code + '');
  return res[0] && res[0].valDesc;
};

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
let fieldList = '';
const AddrDetT1 = props => (
  <AddrViewContext.Consumer>
    {({ formData, personData, ouData, abOuSel, addrSel }) => {
      if (formData.abTypeName === '公司') {
        fieldList = (
          <DescriptionList size="large" title="公司信息" col={2}>
            <Description term="公司名">{ouData.ouName}</Description>
            <Description term="公司类型">{ouData.ouTypeName}</Description>
            <Description term="税号">{ouData.taxRegNo}</Description>
            <Description term="税率">{ouData.taxRate}</Description>
            <Description term="内部/外部">{ouData.innerTypeName}</Description>
            <Description term="公司性质">{ouData.ouPropName}</Description>
            <Description term="公司区域">{ouData.regionCodeName}</Description>
            <Description term="母公司">
              {addrSel.length && getDesc(addrSel, ouData.pid)}
            </Description>
            <Description term="企业主页">{ouData.website}</Description>
            <Description term="所属行业">{ouData.industryName}</Description>
            <Description term="单位规模">{ouData.scaleTypeName}</Description>
            <Description term="主交易货币">{ouData.currCodeName}</Description>
            <Description term="主要语言">{ouData.langCodeName}</Description>
            <Description term="公司状态">{ouData.ouStatusName}</Description>
          </DescriptionList>
        );
      } else if (formData.abTypeName === '个人') {
        fieldList = (
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
            <Description term="籍贯">{personData.birthplace}</Description>
            <Description term="民族">{personData.nation}</Description>
            <Description term="婚姻状况">{personData.maritalName}</Description>
            <Description term="证件有效期从">{personData.idValidFrom}</Description>
            <Description term="证件有效期至">{personData.idValidTo}</Description>
          </DescriptionList>
        );
      }
      return (
        <>
          <DescriptionList size="large" title="基本信息" col={2}>
            <Description term="地址簿名称">{formData.abName}</Description>
            <Description term="地址簿编号">{formData.abNo}</Description>
            <Description term="地址簿类型">{formData.abTypeName}</Description>
            <Description term="唯一识别号">{formData.idenNo}</Description>
            <Description term="相关主档">
              {formData.relateTypeName &&
                formData.relateTypeName.substring(
                  formData.relateTypeName.indexOf('[') + 1,
                  formData.relateTypeName.indexOf(']')
                )}
            </Description>
            <Description term="法人地址薄">
              {abOuSel.length && getDesc(abOuSel, formData.legalAbNo)}
            </Description>
          </DescriptionList>
          {fieldList}
        </>
      );
    }}
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
