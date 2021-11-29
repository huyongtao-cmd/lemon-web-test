import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card } from 'antd';
import DescriptionList from '@/components/layout/DescriptionList';
import { mountToTab } from '@/layouts/routerControl';
import style from '../style.less';

const DOMAIN = 'salePurchaseDetail';
const { Description } = DescriptionList;

@connect(({ loading, dispatch, salePurchaseDetail }) => ({
  loading,
  dispatch,
  salePurchaseDetail,
}))
@mountToTab()
class Detail extends PureComponent {
  componentDidMount() {}

  render() {
    const {
      salePurchaseDetail: {
        detailData: { contractDetailPurchaseView: formData },
        pageConfig,
      },
      dispatch,
      loading,
    } = this.props;
    // 页面配置数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews.filter(
      item => item.blockKey === 'PURCHASE_CON_MAN_CONTRACT'
    )[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const fields = [
      <Description
        term={pageFieldJson.relatedContractNo.displayName}
        key="relatedContractNo"
        sortno={pageFieldJson.relatedContractNo.sortNo}
      >
        {formData.relatedcontractNo}
      </Description>,
      <Description
        term={pageFieldJson.custId.displayName}
        key="custId"
        sortno={pageFieldJson.custId.sortNo}
      >
        {formData.custName}
      </Description>,
      <Description
        term={pageFieldJson.contractStatus.displayName}
        key="contractStatus"
        sortno={pageFieldJson.contractStatus.sortNo}
      >
        {formData.contractStatusDesc}
      </Description>,
      <Description
        term={pageFieldJson.signBuId.displayName}
        key="signBuId"
        sortno={pageFieldJson.signBuId.sortNo}
      >
        {formData.signBuName}
      </Description>,
      <Description
        term={pageFieldJson.deliBuId.displayName}
        key="deliBuId"
        sortno={pageFieldJson.deliBuId.sortNo}
      >
        {formData.deliBuName}
      </Description>,
      <Description
        term={pageFieldJson.preSaleBuId.displayName}
        key="preSaleBuId"
        sortno={pageFieldJson.preSaleBuId.sortNo}
      >
        {formData.preSaleBuName}
      </Description>,
      <Description
        term={pageFieldJson.salesmanResId.displayName}
        key="salesmanResId"
        sortno={pageFieldJson.salesmanResId.sortNo}
      >
        {formData.salesmanResName}
      </Description>,
      <Description
        term={pageFieldJson.deliResId.displayName}
        key="deliResId"
        sortno={pageFieldJson.deliResId.sortNo}
      >
        {formData.deliResName}
      </Description>,
      <Description
        term={pageFieldJson.preSaleResId.displayName}
        key="preSaleResId"
        sortno={pageFieldJson.preSaleResId.sortNo}
      >
        {formData.preSaleResName}
      </Description>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    return (
      <Card className="tw-card-adjust" bordered={false}>
        <div className="tw-card-title">销售合同信息</div>
        <DescriptionList size="large" col={3} className={style.fill}>
          {filterList}
        </DescriptionList>
      </Card>
    );
  }
}

export default Detail;
