import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Card, Button, Divider, Tooltip, Input } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { getUrl } from '@/utils/flowToRouter';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import FlowButton from '@/components/common/FlowButton';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { FileManagerEnhance } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsNoTab } from '@/layouts/routerControl';
import { formatDT } from '@/utils/tempUtils/DateTime';
import router from 'umi/router';
import { div, mul } from '@/utils/mathUtils';
import { gte, isNil, isEmpty, clone } from 'ramda';
import { stringify } from 'qs';
import style from '../style.less';

const DOMAIN = 'salePurchaseAgreementsDetail';
const { Description } = DescriptionList;

@connect(({ loading, dispatch, salePurchaseAgreementsDetail }) => ({
  loading,
  dispatch,
  salePurchaseAgreementsDetail,
}))
@mountToTab()
class Detail extends PureComponent {
  componentDidMount() {}

  purchaseTableProps = () => {
    const {
      salePurchaseAgreementsDetail: { detailData, pageConfig },
      loading,
    } = this.props;

    const currentBlockConfig = pageConfig.pageBlockViews.find(
      item => item.blockKey === 'PUR_AGREEMENT_DETAILS_DTL'
    );
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const columnsList = [
      {
        title: '序号',
        dataIndex: 'id',
        className: 'text-center',
        width: 50,
        render: (value, record, index) => index + 1,
      },
      {
        title: `${pageFieldJson.relatedProductId.displayName}`,
        sortNo: `${pageFieldJson.relatedProductId.sortNo}`,
        key: 'relatedProductId',
        dataIndex: 'relatedProductDesc',
        className: 'text-center',
        width: 200,
      },
      {
        title: `${pageFieldJson.note.displayName}`,
        sortNo: `${pageFieldJson.note.sortNo}`,
        key: 'note',
        dataIndex: 'note',
        className: 'text-left',
        width: 200,
      },
      {
        title: `${pageFieldJson.classId.displayName}`,
        sortNo: `${pageFieldJson.classId.sortNo}`,
        key: 'classId',
        dataIndex: 'classDesc',
        className: 'text-center',
        width: 200,
      },
      {
        title: `${pageFieldJson.subClassId.displayName}`,
        sortNo: `${pageFieldJson.subClassId.sortNo}`,
        key: 'subClassId',
        dataIndex: 'subClassDesc',
        className: 'text-center',
        width: 200,
      },
      {
        title: `${pageFieldJson.quantity.displayName}`,
        sortNo: `${pageFieldJson.quantity.sortNo}`,
        key: 'quantity',
        dataIndex: 'quantity',
        className: 'text-right',
        width: 100,
      },
      {
        title: `${pageFieldJson.taxPrice.displayName}`,
        sortNo: `${pageFieldJson.taxPrice.sortNo}`,
        key: 'taxPrice',
        dataIndex: 'taxPrice',
        className: 'text-right',
        width: 150,
      },
      {
        title: `${pageFieldJson.taxRate.displayName}`,
        sortNo: `${pageFieldJson.taxRate.sortNo}`,
        key: 'taxRate',
        dataIndex: 'taxRate',
        className: 'text-right',
        width: 100,
        render: (value, row, index) => `${value}%`,
      },
      {
        title: `${pageFieldJson.taxAmt.displayName}`,
        sortNo: `${pageFieldJson.taxAmt.sortNo}`,
        key: 'taxAmt',
        dataIndex: 'taxAmt',
        className: 'text-right',
        width: 150,
      },
      {
        title: `${pageFieldJson.taxNotAmt.displayName}`,
        sortNo: `${pageFieldJson.taxNotAmt.sortNo}`,
        key: 'taxNotAmt',
        dataIndex: 'taxNotAmt',
        className: 'text-right',
        width: 150,
      },
      {
        title: `${pageFieldJson.deliveryDate.displayName}`,
        sortNo: `${pageFieldJson.deliveryDate.sortNo}`,
        key: 'deliveryDate',
        dataIndex: 'deliveryDate',
        className: 'text-center',
        width: 150,
      },
    ];
    const columnsFilterList = columnsList.filter(
      field => !field.key || pageFieldJson[field.key].visibleFlag === 1
    );
    const tableProps = {
      rowKey: 'id',
      showSearch: false,
      loading: loading.effects[`${DOMAIN}/queryDetail`],
      scroll: {
        x: 1700,
      },
      dataSource: detailData.agreementDetailsViews,
      enableSelection: false,
      columns: columnsFilterList,
      pagination: false,
    };
    return tableProps;
  };

  render() {
    const {
      salePurchaseAgreementsDetail: { detailData: formData, pageConfig },
      dispatch,
      loading,
    } = this.props;

    // 页面配置数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews.find(
      item => item.blockKey === 'PUR_AGREEMENT_MASTER_SCOPE_DTL'
    );
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const mainFields = [
      <Description
        term={pageFieldJson.purchaseAgreementNo.displayName}
        key="purchaseAgreementNo"
        sortno={pageFieldJson.purchaseAgreementNo.sortNo}
      >
        {formData.purchaseAgreementNo}
      </Description>,
      <Description
        term={pageFieldJson.purchaseAgreementName.displayName}
        key="purchaseAgreementName"
        sortno={pageFieldJson.purchaseAgreementName.sortNo}
      >
        {formData.purchaseAgreementName}
      </Description>,
      <Description
        term={pageFieldJson.agreementType.displayName}
        key="agreementType"
        sortno={pageFieldJson.agreementType.sortNo}
      >
        {formData.agreementTypeDesc}
      </Description>,
      <Description
        term={pageFieldJson.acceptanceType.displayName}
        key="acceptanceType"
        sortno={pageFieldJson.acceptanceType.sortNo}
      >
        {formData.acceptanceTypeDesc}
      </Description>,
      <Description
        term={pageFieldJson.signDate.displayName}
        key="signDate"
        sortno={pageFieldJson.signDate.sortNo}
      >
        {formData.signDate}
      </Description>,
      <Description
        term={pageFieldJson.effectiveStartDate.displayName}
        key="effectiveStartDate"
        sortno={pageFieldJson.effectiveStartDate.sortNo}
      >
        {`${formData.effectiveStartDate || ''} ~ ${formData.effectiveEndDate || ''}`}
      </Description>,
      <Description
        term={pageFieldJson.signingLegalNo.displayName}
        key="signingLegalNo"
        sortno={pageFieldJson.signingLegalNo.sortNo}
      >
        <Tooltip
          title={`${formData.signingLegalDesc || ''} / ${formData.signingLegalNo || ''}`}
          className={style.ellipsis}
        >
          {formData.signingLegalDesc} / {formData.signingLegalNo}
        </Tooltip>
      </Description>,
      <Description
        term={pageFieldJson.signingBuId.displayName}
        key="signingBuId"
        sortno={pageFieldJson.signingBuId.sortNo}
      >
        {formData.signingBuDesc}
      </Description>,
      <Description
        term={pageFieldJson.purchaseInchargeResId.displayName}
        key="purchaseInchargeResId"
        sortno={pageFieldJson.purchaseInchargeResId.sortNo}
      >
        {formData.purchaseInchargeResName}
      </Description>,
      <Description
        term={pageFieldJson.supplierLegalNo.displayName}
        key="supplierLegalNo"
        sortno={pageFieldJson.supplierLegalNo.sortNo}
      >
        <Tooltip
          title={`${formData.supplierLegalDesc || ''} / ${formData.supplierLegalNo || ''}`}
          className={style.ellipsis}
        >
          {formData.supplierLegalDesc} / {formData.supplierLegalNo}
        </Tooltip>
      </Description>,
      <Description
        term={pageFieldJson.currCode.displayName}
        key="currCode"
        sortno={pageFieldJson.currCode.sortNo}
      >
        {formData.currCodeDesc}
      </Description>,
      <Description term={pageFieldJson.amt.displayName} key="amt" sortno={pageFieldJson.amt.sortNo}>
        {formData.amt}
      </Description>,
      <DescriptionList key="taxRate" size="large" col={1}>
        <Description
          term={`${pageFieldJson.taxRate.displayName}/${pageFieldJson.taxAmt.displayName}`}
          key="taxRate"
          sortno={pageFieldJson.taxRate.sortNo}
        >
          {formData.taxRate} / {formData.taxAmt}
        </Description>
      </DescriptionList>,
      <DescriptionList key="agreementContent" size="large" col={1}>
        <Description
          term={pageFieldJson.agreementContent.displayName}
          key="agreementContent"
          sortno={pageFieldJson.agreementContent.sortNo}
        >
          <pre>{formData.agreementContent}</pre>
        </Description>
      </DescriptionList>,
    ];
    const mainFilterList = mainFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);

    const financeFields = [
      <Description
        term={pageFieldJson.invoice.displayName}
        key="invoice"
        sortno={pageFieldJson.invoice.sortNo}
      >
        {formData.invoiceDesc}
      </Description>,
      <Description
        term={pageFieldJson.payMethod.displayName}
        key="payMethod"
        sortno={pageFieldJson.payMethod.sortNo}
      >
        {formData.payMethodName}
      </Description>,
    ];
    const financeFilterList = financeFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);

    return (
      <>
        <Card className="tw-card-adjust" bordered={false}>
          <div className="tw-card-title">采购协议信息</div>
          <DescriptionList size="large" col={3} className={style.fill}>
            {mainFilterList}
          </DescriptionList>
        </Card>
        <Divider dashed />
        <Card className="tw-card-adjust" bordered={false}>
          <div className="tw-card-title">相关单据</div>
          <DescriptionList size="large" col={3} className={style.fill}>
            <Description term="比价资料">
              <FileManagerEnhance
                api="/api/op/v1/purchase_agreement/parity/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
                preview
              />
            </Description>
            <Description term="协议附件">
              <FileManagerEnhance
                api="/api/op/v1/purchase_agreement/agreement/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
                preview
              />
            </Description>
            <Description term="上传盖章附件">
              <FileManagerEnhance
                api="/api/op/v1/purchase_agreement/seal/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
                preview
              />
            </Description>
          </DescriptionList>
        </Card>
        <Divider dashed />
        <Card className="tw-card-adjust" bordered={false}>
          <div className="tw-card-title">财务信息</div>
          <DescriptionList size="large" col={3} className={style.fill}>
            {financeFilterList}
          </DescriptionList>
        </Card>
        <Divider dashed />
        <Card className="tw-card-adjust" bordered={false}>
          <div className="tw-card-title">采购明细</div>
          <DataTable {...this.purchaseTableProps()} />
        </Card>
      </>
    );
  }
}

export default Detail;
