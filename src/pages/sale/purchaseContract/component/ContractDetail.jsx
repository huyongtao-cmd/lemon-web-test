import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Divider, Tooltip, Input } from 'antd';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import { FileManagerEnhance } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsNoTab } from '@/layouts/routerControl';
import { formatDT } from '@/utils/tempUtils/DateTime';
import router from 'umi/router';
import createMessage from '@/components/core/AlertMessage';
import Link from 'umi/link';
import { getLink } from '@/pages/sale/purchaseContract/linkConfig';
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

  paymentTableProps = () => {
    const {
      salePurchaseDetail: { detailData, pageConfig },
      loading,
    } = this.props;
    const { from } = fromQs();

    const currentBlockConfig = pageConfig.pageBlockViews.filter(
      item => item.blockKey === 'PURCHASE_CON_MAN_PAY_PLAN_DEL'
    )[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });

    const btnJson = {};
    if (pageConfig && pageConfig.pageButtonViews && pageConfig.pageButtonViews.length > 0) {
      pageConfig.pageButtonViews.forEach(btn => {
        btnJson[btn.buttonKey] = btn;
      });
    }
    const payBtns =
      from === 'list'
        ? [
            {
              key: 'handlePay',
              className: 'tw-btn-primary',
              title: '发起付款',
              loading: false,
              hidden: false,
              // disabled: selectedRows => selectedRows.length <= 0,
              disabled: false,
              minSelections: 0,
              cb: (selectedRowKeys, selectedRows, queryParams) => {
                if (detailData.contractStatus === 'ACTIVE') {
                  const sceneTypeObj = {
                    SERVICES_TRADE: '1',
                    PRODUCT_TRADE: '2',
                    CHANNEL_COST: '4',
                    TENDER_BOND: '3',
                    IND_PRE_RES_OUT: '5',
                    CON_RES_OUT: '6',
                    CON_RES_OUT_SOME: '7',
                    IND_RES_OUT: '8',
                    MARKET: '9',
                    RESEARCH: '10',
                    ADMINISTRATIVE: '11',
                    MANAGEMENT: '12',
                    RESOURCE: '13',
                    RENT: '18', // 房屋租赁
                    SUNDRY: '19', // 杂项采购
                  };
                  let sceneType = '';
                  if (
                    detailData.purchaseType === 'CONTRACT' ||
                    detailData.purchaseType === 'PROJECT'
                  ) {
                    sceneType = sceneTypeObj[detailData.businessType];
                  } else {
                    sceneType = sceneTypeObj[detailData.purchaseType];
                  }
                  router.push(
                    `/sale/purchaseContract/paymentApplyList/edit?docNo=${
                      detailData.contractNo
                    }&scene=${sceneType}&mode=create`
                  );
                } else {
                  createMessage({
                    type: 'warn',
                    description: '采购合同状态为激活时才允许发起付款',
                  });
                }
              },
            },
            {
              key: 'handlePrePay',
              className: 'tw-btn-primary',
              title: '发起预付款',
              loading: false,
              hidden: false,
              // disabled: selectedRows => selectedRows.length <= 0,
              disabled: false,
              minSelections: 0,
              cb: (selectedRowKeys, selectedRows, queryParams) => {
                if (detailData.contractStatus === 'ACTIVE') {
                  router.push(
                    `/sale/purchaseContract/prePaymentApply/edit?docNo=${
                      detailData.contractNo
                    }&scene=14&mode=create`
                  );
                } else {
                  createMessage({
                    type: 'warn',
                    description: '采购合同状态为激活时才允许发起预付款',
                  });
                }
              },
            },
          ]
        : [];
    const payBtnsFilterList = payBtns.filter(
      btn => !btn.key || !btnJson[btn.key] || btnJson[btn.key].visibleFlag === 1
    );
    const columnsList = [
      {
        title: '序号',
        dataIndex: 'id',
        className: 'text-center',
        width: 50,
        render: (value, record, index) => index + 1,
      },
      {
        title: `${pageFieldJson.paymentStage.displayName}`,
        sortNo: `${pageFieldJson.paymentStage.sortNo}`,
        key: 'paymentStage',
        dataIndex: 'paymentStage',
        className: 'text-center',
        width: 200,
      },
      {
        title: `${pageFieldJson.currentPaymentAmt.displayName}`,
        sortNo: `${pageFieldJson.currentPaymentAmt.sortNo}`,
        key: 'currentPaymentAmt',
        dataIndex: 'currentPaymentAmt',
        className: 'text-center',
        width: 200,
      },
      {
        title: `${pageFieldJson.paymentAmt.displayName}`,
        sortNo: `${pageFieldJson.paymentAmt.sortNo}`,
        key: 'paymentAmt',
        dataIndex: 'paymentAmt',
        className: 'text-right',
        width: 200,
      },
      {
        title: `${pageFieldJson.paymentProportion.displayName}`,
        sortNo: `${pageFieldJson.paymentProportion.sortNo}`,
        key: 'paymentProportion',
        dataIndex: 'paymentProportion',
        className: 'text-right',
        width: 200,
        render: (value, row, index) => `${value}%`,
      },
      {
        title: `${pageFieldJson.estimatedPaymentDate.displayName}`,
        sortNo: `${pageFieldJson.estimatedPaymentDate.sortNo}`,
        key: 'estimatedPaymentDate',
        dataIndex: 'estimatedPaymentDate',
        className: 'text-center',
        width: 150,
        render: (value, row, index) => formatDT(value),
      },
      {
        title: `${pageFieldJson.paymentApplicationType.displayName}`,
        sortNo: `${pageFieldJson.paymentApplicationType.sortNo}`,
        key: 'paymentApplicationType',
        dataIndex: 'paymentApplicationTypeName',
        className: 'text-center',
        width: 200,
      },
      {
        title: `${pageFieldJson.paymentApplyId.displayName}`,
        sortNo: `${pageFieldJson.paymentApplyId.sortNo}`,
        key: 'paymentApplyId',
        dataIndex: 'paymentNo',
        className: 'text-center',
        width: 200,
        render: (value, row, index) => {
          const { paymentApplicationType, paymentApplyId, scene } = row;
          return (
            <Link
              className="tw-link"
              to={getLink('TSK:PAYMENT_APPLICATION_TYPE', paymentApplicationType, {
                id: paymentApplyId,
                scene,
              })}
            >
              {value}
            </Link>
          );
        },
      },
      {
        title: `${pageFieldJson.state.displayName}`,
        sortNo: `${pageFieldJson.state.sortNo}`,
        key: 'state',
        dataIndex: 'stateName',
        className: 'text-center',
        width: 150,
      },
      {
        title: `${pageFieldJson.contractNode.displayName}`,
        sortNo: `${pageFieldJson.contractNode.sortNo}`,
        key: 'contractNode',
        dataIndex: 'contractNodeName',
        className: 'text-center',
        width: 200,
      },
      {
        title: `${pageFieldJson.recvStatus.displayName}`,
        sortNo: `${pageFieldJson.recvStatus.sortNo}`,
        key: 'recvStatus',
        dataIndex: 'recvStatusName',
        className: 'text-center',
        width: 200,
      },
      {
        title: `${pageFieldJson.actualRecvAmt.displayName}`,
        sortNo: `${pageFieldJson.actualRecvAmt.sortNo}`,
        key: 'actualRecvAmt',
        dataIndex: 'actualRecvAmt',
        className: 'text-center',
        width: 200,
      },
      {
        title: `${pageFieldJson.milestone.displayName}`,
        sortNo: `${pageFieldJson.milestone.sortNo}`,
        key: 'milestone',
        dataIndex: 'milestoneName',
        className: 'text-center',
        width: 200,
      },
      {
        title: `${pageFieldJson.milestoneStatus.displayName}`,
        sortNo: `${pageFieldJson.milestoneStatus.sortNo}`,
        key: 'milestoneStatus',
        dataIndex: 'milestoneStatusName',
        className: 'text-center',
        width: 200,
      },
    ];
    const columnsFilterList = columnsList.filter(
      field => !field.key || pageFieldJson[field.key].visibleFlag === 1
    );
    const tableProps = {
      rowKey: 'id',
      showSearch: false,
      // loading: loading.effects[`${DOMAIN}/queryDetail`],
      scroll: {
        x: 1700,
      },
      dataSource: detailData.purchasePaymentPlanViews,
      // enableSelection: from === 'list' && payBtnsFilterList.length > 0,
      enableSelection: false,
      columns: columnsFilterList,
      leftButtons: [...payBtnsFilterList],
      pagination: false,
    };
    return tableProps;
  };

  purchaseTableProps = () => {
    const {
      salePurchaseDetail: { detailData, pageConfig },
      loading,
    } = this.props;

    const currentBlockConfig = pageConfig.pageBlockViews.filter(
      item => item.blockKey === 'PURCHASE_CON_MAN_DETAILS_DEL'
    )[0];
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
        dataIndex: 'relatedProductName',
        className: 'text-center',
        width: 200,
      },
      {
        title: `${pageFieldJson.note.displayName}`,
        sortNo: `${pageFieldJson.note.sortNo}`,
        key: 'note',
        dataIndex: 'note',
        className: 'text-center',
        width: 200,
      },
      {
        title: `${pageFieldJson.classId.displayName}`,
        sortNo: `${pageFieldJson.classId.sortNo}`,
        key: 'classId',
        dataIndex: 'classIdName',
        className: 'text-center',
        width: 200,
      },
      {
        title: `${pageFieldJson.subClassId.displayName}`,
        sortNo: `${pageFieldJson.subClassId.sortNo}`,
        key: 'subClassId',
        dataIndex: 'subClassIdName',
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
      // loading: loading.effects[`${DOMAIN}/queryDetail`],
      scroll: {
        x: 1700,
      },
      dataSource: detailData.purchaseDetailsViews,
      enableSelection: false,
      columns: columnsFilterList,
      pagination: false,
    };
    return tableProps;
  };

  render() {
    const {
      salePurchaseDetail: { closeReason, pageConfig, fieldsConfig, detailData: formData },
      dispatch,
      loading,
    } = this.props;
    const { pageMode, taskId } = fromQs();
    const { taskKey } = fieldsConfig;
    // 页面配置数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews.filter(
      item => item.blockKey === 'PURCHASE_CON_MAN_DEL'
    )[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const mainFields = [
      <Description
        term={pageFieldJson.contractNo.displayName}
        key="contractNo"
        sortno={pageFieldJson.contractNo.sortNo}
      >
        {formData.contractNo}
      </Description>,
      <Description
        term={pageFieldJson.contractName.displayName}
        key="contractName"
        sortno={pageFieldJson.contractName.sortNo}
      >
        {formData.contractName}
      </Description>,
      <Description
        term={pageFieldJson.platType.displayName}
        key="platType"
        sortno={pageFieldJson.platType.sortNo}
      >
        {formData.platTypeDesc}
      </Description>,
      <Description
        term={pageFieldJson.purchaseType.displayName}
        key="purchaseType"
        sortno={pageFieldJson.purchaseType.sortNo}
      >
        {formData.purchaseTypeDesc}
      </Description>,
      <Description
        term={pageFieldJson.businessType.displayName}
        key="businessType"
        sortno={pageFieldJson.businessType.sortNo}
      >
        {formData.businessTypeDesc}
      </Description>,
      <Description
        term={pageFieldJson.acceptanceType.displayName}
        key="acceptanceType"
        sortno={pageFieldJson.acceptanceType.sortNo}
      >
        {formData.acceptanceTypeDesc}
      </Description>,
      <Description
        term={pageFieldJson.purchaseLegalNo.displayName}
        key="purchaseLegalNo"
        sortno={pageFieldJson.purchaseLegalNo.sortNo}
      >
        <Tooltip
          title={`${formData.purchaseLegalName || ''} / ${formData.purchaseLegalNo || ''}`}
          className={style.ellipsis}
        >
          {formData.purchaseLegalName} / {formData.purchaseLegalNo}
        </Tooltip>
      </Description>,
      <Description
        term={pageFieldJson.purchaseBuId.displayName}
        key="purchaseBuId"
        sortno={pageFieldJson.purchaseBuId.sortNo}
      >
        {formData.purchaseBuName}
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
          title={`${formData.supplierLegalName || ''} / ${formData.supplierLegalNo || ''}`}
          className={style.ellipsis}
        >
          {formData.supplierLegalName} / {formData.supplierLegalNo}
        </Tooltip>
      </Description>,
      <Description
        term={pageFieldJson.signDate.displayName}
        key="signDate"
        sortno={pageFieldJson.signDate.sortNo}
      >
        {formData.signDate}
      </Description>,
      <Description
        term={pageFieldJson.applicationDate.displayName}
        key="applicationDate"
        sortno={pageFieldJson.applicationDate.sortNo}
      >
        {formData.applicationDate}
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
      <Description
        term={`${pageFieldJson.taxRate.displayName}/${pageFieldJson.taxAmt.displayName}`}
        key="taxRate"
        sortno={pageFieldJson.taxRate.sortNo}
      >
        {formData.taxRate} / {formData.taxAmt}
      </Description>,
      <DescriptionList key="remark" size="large" col={1}>
        <Description
          term={pageFieldJson.remark.displayName}
          key="remark"
          sortno={pageFieldJson.remark.sortNo}
        >
          <pre>{formData.remark}</pre>
        </Description>
      </DescriptionList>,
    ];
    const mainFilterList = mainFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    const relatedFields = [
      <Description term="比价资料">
        <FileManagerEnhance
          api="/api/op/v1/purchase_contract_management/parity/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled
          preview
        />
      </Description>,
      <Description term="合同附件">
        <FileManagerEnhance
          api="/api/op/v1/purchase_contract_management/purchase/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled
          preview
        />
      </Description>,
      <Description term="上传盖章附件">
        <FileManagerEnhance
          api="/api/op/v1/purchase_contract_management/seal/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled
          preview
        />
      </Description>,
      <Description
        term={pageFieldJson.relatedSalesContract.displayName}
        key="relatedSalesContract"
        sortno={pageFieldJson.relatedSalesContract.sortNo}
      >
        <Link
          className="tw-link"
          to={getLink('salesContract', null, { id: formData.relatedSalesContract })}
        >
          {formData.relatedSalesContractName}
        </Link>
      </Description>,
      <Description
        term={pageFieldJson.relatedAgreement.displayName}
        key="relatedAgreement"
        sortno={pageFieldJson.relatedAgreement.sortNo}
      >
        {formData.relatedAgreementName}
      </Description>,
      <Description
        term={pageFieldJson.demandNo.displayName}
        key="demandNo"
        sortno={pageFieldJson.demandNo.sortNo}
      >
        {formData.demandNo}
      </Description>,
      <Description
        term={pageFieldJson.relatedProjectId.displayName}
        key="relatedProjectId"
        sortno={pageFieldJson.relatedProjectId.sortNo}
      >
        <Link className="tw-link" to={getLink('project', null, { id: formData.relatedProjectId })}>
          {formData.relatedProjectName}
        </Link>
      </Description>,
      <Description
        term={pageFieldJson.relatedTask.displayName}
        key="relatedTask"
        sortno={pageFieldJson.relatedTask.sortNo}
      >
        <Link className="tw-link" to={getLink('task', null, { id: formData.relatedTask })}>
          {formData.relatedTaskName}
        </Link>
      </Description>,
    ];
    const relatedFilterList = relatedFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    const financeFields = [
      <Description
        term={pageFieldJson.invoice.displayName}
        key="invoice"
        sortno={pageFieldJson.invoice.sortNo}
      >
        {formData.invoiceName}
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
        {pageMode === 'over' ? (
          <Card className="tw-card-adjust" bordered={false}>
            <div className="tw-card-title">终止原因</div>
            <Input.TextArea
              style={{
                width: '80%',
                margin: '10px 0 0 50px',
              }}
              defaultValue={closeReason}
              rows={5}
              onChange={e => {
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: { closeReason: e.target.value },
                });
              }}
              disabled={
                !taskId ||
                (taskKey !== 'TSK_S09_01_PUR_CON_SUBMIT_i' &&
                  taskKey !== 'TSK_S11_01_PUR_CON_SUBMIT_i')
              }
            />
          </Card>
        ) : (
          ''
        )}
        <Card className="tw-card-adjust" bordered={false}>
          <div className="tw-card-title">采购合同信息</div>
          <DescriptionList size="large" col={3} className={style.fill}>
            {mainFilterList}
          </DescriptionList>
        </Card>
        <Divider dashed />
        <Card className="tw-card-adjust" bordered={false}>
          <div className="tw-card-title">相关单据</div>
          <DescriptionList size="large" col={3} className={style.fill}>
            {relatedFilterList}
          </DescriptionList>
        </Card>
        <Divider dashed />
        <Card className="tw-card-adjust" bordered={false}>
          <div className="tw-card-title">采购明细</div>
          <DataTable {...this.purchaseTableProps()} />
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
          <div className="tw-card-title">付款计划</div>
          <DataTable {...this.paymentTableProps()} />
        </Card>
      </>
    );
  }
}

export default Detail;
