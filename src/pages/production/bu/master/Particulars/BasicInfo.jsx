import React, { PureComponent } from 'react';
import { connect } from 'dva';
import DescriptionList from '@/components/layout/DescriptionList';

const DOMAIN = 'buBasicLinmon';
const { Description } = DescriptionList;

@connect(({ buBasicLinmon }) => ({ buBasicLinmon }))
class BuBasicInfo extends PureComponent {
  componentDidMount() {
    const { dispatch, buId } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { buId },
    });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BU_MASTER_DATA_BASIC_INFORMATION' },
    });
  }

  renderPage = () => {
    const { buBasicLinmon } = this.props;
    const { formData, pageConfig } = buBasicLinmon;
    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentConfig = pageBlockViews[0];
    const { pageFieldViews } = currentConfig;
    const pageFieldJsonList = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    let fields = [];
    fields = [
      <Description term={pageFieldJsonList.buNo.displayName} key="buNo">
        {formData.buNo}
      </Description>,
      <Description term={pageFieldJsonList.buName.displayName} key="buName">
        {formData.buName}
      </Description>,
      <Description term={pageFieldJsonList.buType.displayName} key="buType">
        {formData.buTypeDesc}
      </Description>,
      <Description term={pageFieldJsonList.buStatus.displayName} key="buStatus">
        {formData.buStatusDesc}
      </Description>,
      <Description term={pageFieldJsonList.pid.displayName} key="pid">
        {formData.pname}
      </Description>,
      <Description term={pageFieldJsonList.inchargeResId.displayName} key="inchargeResId">
        {formData.inchargeResName}
      </Description>,
      <Description term={pageFieldJsonList.sumBuId.displayName} key="sumBuId">
        {formData.sumBuName}
      </Description>,
      <Description term={pageFieldJsonList.ouId.displayName} key="ouId">
        {formData.ouName}
      </Description>,
      <Description term={pageFieldJsonList.contactDesc.displayName} key="contactDesc">
        {formData.contactDesc}
      </Description>,
      <Description term={pageFieldJsonList.abNo.displayName} key="abNo">
        {formData.abNo}
      </Description>,
      <DescriptionList size="large" col={1} key="remark">
        <Description term={pageFieldJsonList.remark.displayName}>
          <pre>{formData.remark}</pre>
        </Description>
      </DescriptionList>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJsonList[field.key].visibleFlag === 1)
      .sort(
        (field1, field2) =>
          pageFieldJsonList[field1.key].sortNo - pageFieldJsonList[field2.key].sortNo
      );
    return (
      <DescriptionList size="large" col={2}>
        {filterList}
      </DescriptionList>
    );
  };

  render() {
    const { buBasicLinmon } = this.props;
    const { formData, pageConfig } = buBasicLinmon;

    return <>{formData && this.renderPage()}</>;
  }
}

export default BuBasicInfo;
