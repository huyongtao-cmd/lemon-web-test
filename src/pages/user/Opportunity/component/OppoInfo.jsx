import React, { PureComponent } from 'react';
import DescriptionList from '@/components/layout/DescriptionList';
import { formatMessage } from 'umi/locale';
import moment from 'moment';

const { Description } = DescriptionList;

class OppoInfo extends PureComponent {
  renderPage = () => {
    const { formData, pageConfig } = this.props;
    const isInternal = formData.sourceType === 'INTERNAL';
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    // 客户信息
    const custFields = [
      <Description
        term={pageFieldJson.oppoName.displayName}
        key="oppoName"
        sortno={pageFieldJson.oppoName.sortNo}
      >
        {formData.oppoName}
      </Description>,
      <Description
        term={pageFieldJson.leadsNo.displayName}
        key="leadsNo"
        sortno={pageFieldJson.leadsNo.sortNo}
      >
        {formData.leadsNo}
      </Description>,
      <Description
        term={pageFieldJson.saleContent.displayName}
        key="saleContent"
        sortno={pageFieldJson.saleContent.sortNo}
      >
        {formData.saleContent}
      </Description>,
      <Description
        term={pageFieldJson.custRegion.displayName}
        key="custRegion"
        sortno={pageFieldJson.custRegion.sortNo}
      >
        {formData.custRegion}
      </Description>,
      <Description
        term={pageFieldJson.oldcustFlag.displayName}
        key="oldcustFlag"
        sortno={pageFieldJson.oldcustFlag.sortNo}
      >
        {formData.oldcustFlag ? '是' : '否'}
      </Description>,
      <Description
        term={pageFieldJson.custName.displayName}
        key="custName"
        sortno={pageFieldJson.custName.sortNo}
      >
        {formData.custName}
      </Description>,
      <Description
        term={pageFieldJson.custProj.displayName}
        key="custProj"
        sortno={pageFieldJson.custProj.sortNo}
      >
        {formData.custProj}
      </Description>,
      <Description
        term={pageFieldJson.contactName.displayName}
        key="contactName"
        sortno={pageFieldJson.contactName.sortNo}
      >
        {formData.contactName}
      </Description>,
      <Description
        term={pageFieldJson.contactPhone.displayName}
        key="contactPhone"
        sortno={pageFieldJson.contactPhone.sortNo}
      >
        {formData.contactPhone}
      </Description>,
      <Description
        term={pageFieldJson.contactDept.displayName}
        key="contactDept"
        sortno={pageFieldJson.contactDept.sortNo}
      >
        {formData.contactDept}
      </Description>,
      <Description
        term={pageFieldJson.contactPosition.displayName}
        key="contactPosition"
        sortno={pageFieldJson.contactPosition.sortNo}
      >
        {formData.contactPosition}
      </Description>,
      <Description
        term={pageFieldJson.contactWebsite.displayName}
        key="contactWebsite"
        sortno={pageFieldJson.contactWebsite.sortNo}
      >
        {formData.contactWebsite}
      </Description>,
      <Description
        term={pageFieldJson.custProp.displayName}
        key="custProp"
        sortno={pageFieldJson.custProp.sortNo}
      >
        {formData.custPropDesc}
      </Description>,
      <Description
        term={pageFieldJson.custIdst.displayName}
        key="custIdst"
        sortno={pageFieldJson.custIdst.sortNo}
      >
        {formData.custIdstDesc}
      </Description>,
      <Description
        term={pageFieldJson.leadsId.displayName}
        key="leadsId"
        sortno={pageFieldJson.leadsId.sortNo}
      >
        {formData.leadsName}
      </Description>,
      <Description
        term={pageFieldJson.oppoStatus.displayName}
        key="oppoStatus"
        sortno={pageFieldJson.leadsId.sortNo}
      >
        {formData.oppoStatusDesc}
      </Description>,
      <Description
        term={pageFieldJson.closeReason.displayName}
        key="closeReason"
        sortno={pageFieldJson.closeReason.sortNo}
      >
        {formData.closeReasonDesc}
      </Description>,
      <Description
        term={pageFieldJson.createUserId.displayName}
        key="createUserId"
        sortno={pageFieldJson.createUserId.sortNo}
      >
        {formData.createUserName}
      </Description>,
      <Description
        term={pageFieldJson.createTime.displayName}
        key="createTime"
        sortno={pageFieldJson.createTime.sortNo}
      >
        {formData.createTime
          ? moment(formData.createTime).format('YYYY-MM-DD')
          : formData.createTime}
      </Description>,
    ];
    const filterList1 = custFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    // 销售信息
    const saleFields = [
      <Description
        term={pageFieldJson.saleType1.displayName}
        key="saleType1"
        sortno={pageFieldJson.saleType1.sortNo}
      >
        {formData.saleType1Desc}
      </Description>,
      <Description
        term={pageFieldJson.saleType2.displayName}
        key="saleType2"
        sortno={pageFieldJson.saleType2.sortNo}
      >
        {formData.saleType2Desc}
      </Description>,
      <Description
        term={pageFieldJson.forecastWinDate.displayName}
        key="forecastWinDate"
        sortno={pageFieldJson.forecastWinDate.sortNo}
      >
        {formData.forecastWinDate
          ? moment(formData.forecastWinDate).format('YYYY-MM-DD')
          : formData.forecastWinDate}
      </Description>,
      <Description
        term={pageFieldJson.forecastAmount.displayName}
        key="forecastAmount"
        sortno={pageFieldJson.forecastAmount.sortNo}
      >
        {formData.forecastAmount}
      </Description>,
      <Description
        term={pageFieldJson.currCode.displayName}
        key="currCode"
        sortno={pageFieldJson.currCode.sortNo}
      >
        {formData.currCodeName}
      </Description>,
      <Description
        term={pageFieldJson.probability.displayName}
        key="probability"
        sortno={pageFieldJson.probability.sortNo}
      >
        {formData.probabilityDesc}
      </Description>,
      <Description
        term={pageFieldJson.salePhase.displayName}
        key="salePhase"
        sortno={pageFieldJson.salePhase.sortNo}
      >
        {formData.salePhaseDesc}
      </Description>,
      <Description
        term={pageFieldJson.productIds.displayName}
        key="productIds"
        sortno={pageFieldJson.productIds.sortNo}
      >
        {formData.productNames}
      </Description>,
      <Description
        term={pageFieldJson.deliveryAddress.displayName}
        key="deliveryAddress"
        sortno={pageFieldJson.deliveryAddress.sortNo}
      >
        {formData.deliveryAddress}
      </Description>,
      <Description
        term={pageFieldJson.coopId.displayName}
        key="coopId"
        sortno={pageFieldJson.coopId.sortNo}
      >
        {formData.coopName}
      </Description>,
      <Description
        term={pageFieldJson.oppoLevel.displayName}
        key="oppoLevel"
        sortno={pageFieldJson.oppoLevel.sortNo}
      >
        {formData.oppoLevelDesc}
      </Description>,
    ];
    const filterList2 = saleFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    // 内部信息
    const innerFields = [
      <Description
        term={pageFieldJson.signBuId.displayName}
        key="signBuId"
        sortno={pageFieldJson.signBuId.sortNo}
      >
        {formData.signBuName}
      </Description>,
      <Description
        term={pageFieldJson.salesmanResId.displayName}
        key="salesmanResId"
        sortno={pageFieldJson.salesmanResId.sortNo}
      >
        {formData.salesmanName}
      </Description>,
      <Description
        term={pageFieldJson.preSaleBuId.displayName}
        key="preSaleBuId"
        sortno={pageFieldJson.preSaleBuId.sortNo}
      >
        {formData.preSaleBuName}
      </Description>,
      <Description
        term={pageFieldJson.preSaleResId.displayName}
        key="preSaleResId"
        sortno={pageFieldJson.preSaleResId.sortNo}
      >
        {formData.preSaleResName}
      </Description>,
      <Description
        term={pageFieldJson.solutionDifficulty.displayName}
        key="solutionDifficulty"
        sortno={pageFieldJson.solutionDifficulty.sortNo}
      >
        {formData.solutionDifficultyName}
      </Description>,
      <Description
        term={pageFieldJson.solutionImportance.displayName}
        key="solutionImportance"
        sortno={pageFieldJson.solutionImportance.sortNo}
      >
        {formData.solutionImportanceName}
      </Description>,
      <Description
        term={pageFieldJson.deliBuId.displayName}
        key="deliBuId"
        sortno={pageFieldJson.deliBuId.sortNo}
      >
        {formData.deliBuName}
      </Description>,
      <Description
        term={pageFieldJson.deliResId.displayName}
        key="deliResId"
        sortno={pageFieldJson.deliResId.sortNo}
      >
        {formData.deliResName}
      </Description>,
      <Description
        term={pageFieldJson.projectDifficult.displayName}
        key="projectDifficult"
        sortno={pageFieldJson.projectDifficult.sortNo}
      >
        {formData.projectDifficultName}
      </Description>,
      <Description
        term={pageFieldJson.projectImportance.displayName}
        key="projectImportance"
        sortno={pageFieldJson.projectImportance.sortNo}
      >
        {formData.projectImportanceName}
      </Description>,
      <Description
        term={pageFieldJson.coBuId.displayName}
        key="coBuId"
        sortno={pageFieldJson.coBuId.sortNo}
      >
        {formData.coBuName}
      </Description>,
      <Description
        term={pageFieldJson.coResId.displayName}
        key="coResId"
        sortno={pageFieldJson.coResId.sortNo}
      >
        {formData.coResName}
      </Description>,
      <Description
        term={pageFieldJson.codeliBuId.displayName}
        key="codeliBuId"
        sortno={pageFieldJson.codeliBuId.sortNo}
      >
        {formData.codeliBuName}
      </Description>,
      <Description
        term={pageFieldJson.codeliResId.displayName}
        key="codeliResId"
        sortno={pageFieldJson.codeliResId.sortNo}
      >
        {formData.codeliResName}
      </Description>,
    ];
    const filterList3 = innerFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    const sourceFields = [
      <Description
        term={pageFieldJson.sourceType.displayName}
        key="sourceType"
        sortno={pageFieldJson.sourceType.sortNo}
      >
        {isInternal ? '内部' : '外部'}
      </Description>,
      <Description style={{ visibility: 'hidden' }} term="占位">
        占位
      </Description>,
      isInternal ? (
        <Description
          key="internalBuId"
          term={pageFieldJson.internalBuId.displayName}
          sortno={pageFieldJson.internalBuId.sortNo}
        >
          {formData.internalBuName}
        </Description>
      ) : (
        <Description
          key="externalIden"
          term={pageFieldJson.externalIden.displayName}
          sortno={pageFieldJson.externalIden.sortNo}
        >
          {formData.externalIden}
        </Description>
      ),
      isInternal ? (
        <Description
          key="internalResId"
          term={pageFieldJson.internalResId.displayName}
          sortno={pageFieldJson.internalResId.sortNo}
        >
          {formData.internalResName}
        </Description>
      ) : (
        <Description
          key="externalName"
          term={pageFieldJson.externalName.displayName}
          sortno={pageFieldJson.externalName.sortNo}
        >
          {formData.externalName}
        </Description>
      ),
      isInternal ? (
        <div />
      ) : (
        <Description
          key="externalPhone"
          sortno={pageFieldJson.externalPhone.sortNo}
          term={pageFieldJson.externalPhone.displayName}
        >
          {formData.externalPhone}
        </Description>
      ),
      <Description
        key="profitDesc"
        sortno={pageFieldJson.profitDesc.sortNo}
        term={pageFieldJson.profitDesc.displayName}
      >
        {formData.profitDesc}
      </Description>,
    ];
    const filterList4 = sourceFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    return (
      <>
        <DescriptionList size="large" title="客户信息" col={2} hasSeparator>
          {filterList1}
        </DescriptionList>
        <DescriptionList size="large" title="销售信息" col={2} hasSeparator>
          {filterList2}
        </DescriptionList>
        <DescriptionList size="large" title="内部信息" col={2} hasSeparator>
          {filterList3}
        </DescriptionList>
        <DescriptionList size="large" title="来源信息" col={2}>
          {filterList4}
        </DescriptionList>
      </>
    );
  };

  render() {
    const { formData, pageConfig } = this.props;
    const isInternal = formData.sourceType === 'INTERNAL';
    return this.renderPage();
  }
}

export default OppoInfo;
