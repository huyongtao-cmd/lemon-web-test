import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Card, Button } from 'antd';
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
import { div, mul } from '@/utils/mathUtils';
import { gte, isNil, isEmpty, clone } from 'ramda';
import { stringify } from 'qs';

const DOMAIN = 'purchasesContractDetail';
const { Description } = DescriptionList;

@connect(({ loading, dispatch, purchasesContractDetail }) => ({
  loading,
  dispatch,
  purchasesContractDetail,
}))
@mountToTab()
class PurchasesDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { pid, pcontractId, taskId } = fromQs();
    taskId &&
      dispatch({
        type: `${DOMAIN}/fetchConfig`,
        payload: taskId,
      });
    dispatch({
      type: `${DOMAIN}/queryPurchase`,
      payload: pid || pcontractId,
    });
    dispatch({
      type: `${DOMAIN}/queryPlanList`,
      payload: pid || pcontractId,
    });
  }

  handleCancel = () => {
    const { pcontractId, sourceUrl, mainId, purchasesId } = fromQs();
    if (pcontractId) {
      closeThenGoto('/plat/purchPay/purchase/list');
    } else if (sourceUrl && mainId && purchasesId) {
      // 从子合同的采购合同过来
      closeThenGoto(sourceUrl + '?&mainId=' + mainId + '&id=' + purchasesId);
    } else {
      closeThenGoto('/sale/contract/purchasesList');
    }
  };

  tableProps = () => {
    const {
      purchasesContractDetail: { list, formData },
      loading,
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      showSearch: false,
      loading: loading.effects[`${DOMAIN}/queryPlanList`],
      scroll: {
        x: 1700,
      },
      dataSource: list,
      enableSelection: false,
      columns: [
        {
          title: '行号',
          dataIndex: 'lineNo',
          className: 'text-center',
          width: 100,
          render: (value, record, index) => (value === -1 ? '合计' : value),
        },
        {
          title: '付款阶段号',
          dataIndex: 'stage',
          className: 'text-center',
          width: 200,
          render: (value, record, index) =>
            value === -1 ? undefined : `${formData.contractNo}-${record.lineNo}`,
        },
        {
          title: '付款阶段名称',
          dataIndex: 'phaseDesc',
          width: 200,
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '当期付款金额',
          dataIndex: 'payAmt',
          className: 'text-right',
          width: 200,
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '当期付款比例',
          dataIndex: 'payRatio',
          className: 'text-right',
          width: 200,
          render: (value, row, index) =>
            value === -1 ? 0 : `${mul(div(row.payAmt || 1, formData.amt || 1), 100).toFixed(2)}%`,
        },
        {
          title: '预计付款日期',
          dataIndex: 'planPayDate',
          width: 150,
          render: (value, row, index) => (value === -1 ? undefined : formatDT(value)),
        },
        {
          title: '付款状态',
          dataIndex: 'payStatusDesc',
          className: 'text-center',
          width: 150,
          render: (value, record, index) => (value === -1 ? undefined : value),
        },
        {
          title: '税率',
          dataIndex: 'taxRate',
          className: 'text-right',
          width: 100,
          render: (value, row, index) => (value === -1 ? undefined : `${value}%`),
        },
        {
          title: '当期实际付款金额',
          dataIndex: 'actualPayAmt',
          className: 'text-right',
          width: 100,
        },
        {
          title: '当期未付金额',
          dataIndex: 'unPayAmt',
          className: 'text-right',
          width: 100,
        },
      ],
      pagination: false,
    };
    return tableProps;
  };

  render() {
    const {
      purchasesContractDetail: { formData, fieldsConfig, flowForm },
      dispatch,
    } = this.props;
    const { taskId, id, pid } = fromQs();
    const { taskKey } = fieldsConfig;
    const urls = getUrl();
    const from = stringify({ from: markAsNoTab(urls) });
    return (
      <PageHeaderWrapper title="采购合同详情">
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          scope="TSK_S04"
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { key } = operation;
            if (taskKey === 'TSK_S04_01_PURCHASE_CONTRACT_SUBMIT_i') {
              if (key === 'FLOw_COMMIT') {
                return Promise.resolve(true);
              }
              if (key === 'FLOW_EDIT') {
                closeThenGoto(`/sale/contract/purchasesEdit?pid=${pid}&${from}`);
                return Promise.resolve(false);
              }
            }
            return Promise.resolve(true);
          }}
        >
          <Card className="tw-card-rightLine">
            {/* <Button
            className="tw-btn-primary"
            type="primary"
            icon="form"
            size="large"
            onClick={this.handleEdit}
          >
            {formatMessage({ id: `misc.edit`, desc: '编辑' })}
          </Button> */}

            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={this.handleCancel}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>

          <Card
            className="tw-card-adjust"
            bordered={false}
            title={
              <Title
                icon="profile"
                id="user.contract.menu.purchasesDetail"
                defaultMessage="采购合同详情"
              />
            }
          >
            <DescriptionList size="large" col={2} hasSeparator>
              <Description term="合同名称">{formData.contractName}</Description>
              {!isNil(formData.subContractId) && (
                <Description term="项目采购类型">{formData.serviceTypeDesc}</Description>
              )}
              <Description term="编号">{formData.contractNo}</Description>
              <Description term="平台合同类型">{formData.platTypeDesc}</Description>
              <Description term="签约日期">{formData.signDate}</Description>
              <Description term="采购类型">{formData.prchaseTypeDesc}</Description>
              <Description term="关联子合同">
                <Link
                  to={`/sale/contract/salesSubDetail?mainId=${formData.mainContractId}&id=${
                    formData.subContractId
                  }`}
                >
                  {formData.subContractName}
                  {`${formData.subContractNo ? `(${formData.subContractNo})` : ''}`}
                </Link>
              </Description>
              <Description term="采购大类">{formData.purchaseType1Desc}</Description>
              <Description term="采购小类">{formData.purchaseType2Desc}</Description>
              <Description term="采购产品">{formData.productName}</Description>
              <Description term="采购内容简述">{formData.briefDesc}</Description>
              <Description term="金额/税率">
                {formData.amt} / {formData.taxRate}%
              </Description>
              <Description term="不含税金额">
                {(formData.amt / (1 + +formData.taxRate / 100)).toFixed(2)}
              </Description>
              <Description term="采购主体BU">{formData.purchaseBuName}</Description>
              <Description term="采购主体法人/法人号">
                {formData.purchaseLegalName} / {formData.purchaseLegalNo}
              </Description>
              <Description term="供应商号/BU">
                {formData.supplierName} / {formData.supplierBuName}
              </Description>
              <Description term="供应商法人/法人号">
                {formData.supplierLegalName} / {formData.supplierLegalNo}
              </Description>
              <Description term="采购负责人">{formData.purchaseInchargeResName}</Description>
              <Description term="合同相关附件">
                <FileManagerEnhance
                  api="/api/op/v1/contract/purchase/sfs/token"
                  dataKey={formData.id}
                  listType="text"
                  disabled
                  preview
                />
              </Description>
              <Description term="比价资料">
                <FileManagerEnhance
                  api="/api/op/v1/contract/parity/sfs/token"
                  dataKey={formData.id}
                  listType="text"
                  disabled
                  preview
                />
              </Description>
              <Description term="是否第三方外包">
                {formData.thirdPartFlag ? '是' : '否'}
              </Description>
              <Description term="合同状态">{formData.contractStatusDesc}</Description>
              <Description term="关闭原因">{formData.closeReasonDesc}</Description>
              {formData.purchaseType &&
                formData.purchaseType === 'PROJECT' && (
                  <Description term="交付BU">{formData.deliBuName}</Description>
                )}
              {formData.purchaseType &&
                formData.purchaseType === 'PROJECT' && (
                  <Description term="交付负责人">{formData.deliResName}</Description>
                )}
              {formData.purchaseType &&
                formData.purchaseType === 'PROJECT' && (
                  <Description term="签单BU">{formData.signBuName}</Description>
                )}
              {formData.purchaseType &&
                formData.purchaseType === 'PROJECT' && (
                  <Description term="销售负责人">{formData.salesmanResName}</Description>
                )}
              <Description term="激活时间">{formData.activateDate}</Description>
              <Description term="关闭时间">{formData.closeDate}</Description>
              <Description term="币种">{formData.currCodeDesc}</Description>
              <Description term="特殊关联码">{formData.specCode}</Description>
              <DescriptionList size="large" col={1}>
                <Description term="备注">
                  <pre>{formData.remark}</pre>
                </Description>
              </DescriptionList>
              <Description term="创建人">{formData.createUserName}</Description>
              <Description term="创建日期">{formData.createTime}</Description>
            </DescriptionList>
          </Card>
          <Card className="tw-card-adjust" title="采购合同付款计划" bordered={false}>
            <DataTable {...this.tableProps()} />
          </Card>
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'TSK_S04' }]} />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default PurchasesDetail;
