import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isNil } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import Link from '@/components/production/basic/Link.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
import message from '@/components/production/layout/Message';
// @ts-ignore
import {
  purchaseListPaging,
  purchaseLogicalDelete,
  purchasePartialModify,
} from '@/services/production/pur';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { remindString } from '@/components/production/basic/Remind.tsx';
import { Modal } from 'antd';
import { fromQs } from '@/utils/production/stringUtil.ts';

const DOMAIN = 'purchaseList';

@connect(({ loading, dispatch, purchaseList }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...purchaseList,
}))
class PurchaseList extends React.PureComponent {
  state = { visible: false, selectedRowKey: '', refreshDataFunction: '' };

  constructor(props) {
    super(props);
    const pathParam = fromQs();
    this.state = { defaultSearchForm: pathParam };
  }

  componentDidMount() {}

  fetchData = async params => {
    const { data } = await outputHandle(purchaseListPaging, params);
    return data;
  };

  deleteData = async keys =>
    outputHandle(purchaseLogicalDelete, { keys: keys.join(',') }, undefined, false);

  // 修改model层state
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  // 调用model层异步方法
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  renderSearchForm = () => [
    <SearchFormItem
      key="poNameOrNo"
      fieldType="BaseInput"
      label="采购名称/单号"
      fieldKey="poNameOrNo"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="poStatus"
      fieldType="BaseSelect"
      label="状态"
      fieldKey="poStatus"
      defaultShow
      advanced
      parentKey="COM:DOC_STATUS"
    />,
    <SearchFormItem
      key="supplierId"
      fieldType="SupplierSimpleSelect"
      label="供应商"
      fieldKey="supplierId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="chargeProjectId"
      fieldType="ProjectSimpleSelect"
      label="费用承担项目"
      fieldKey="chargeProjectId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="poClass1"
      fieldType="BaseCustomSelect"
      label="采购类型1"
      fieldKey="poClass1"
      defaultShow
      advanced
      parentKey="CUS:PO_CLASS1"
    />,
    <SearchFormItem
      key="poClass2"
      fieldType="BaseCustomSelect"
      label="采购类型2"
      fieldKey="poClass2"
      defaultShow
      advanced
      parentKey="CUS:PO_CLASS2"
    />,
    <SearchFormItem
      key="chargeClassification"
      fieldType="BaseCustomSelect"
      label="费用归属"
      fieldKey="chargeClassification"
      defaultShow
      advanced
      parentKey="CUS:CHARGE_CLASSIFICATION"
    />,
    <SearchFormItem
      key="chargeCompany"
      defaultShow
      advanced
      fieldType="BaseCustomSelect"
      label="费用承担公司"
      fieldKey="chargeCompany"
      parentKey="CUS:INTERNAL_COMPANY"
    />,
    <SearchFormItem
      key="chargeBuId"
      fieldType="BuSimpleSelect"
      label="费用承担部门"
      fieldKey="chargeBuId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="enabledFlag"
      fieldType="BudgetSimpleSelect"
      label="相关预算"
      fieldKey="relatedBudgetId"
      defaultShow
    />,
    <SearchFormItem
      key="relatedContractId"
      fieldType="ContractSimpleSelect"
      label="相关合同"
      fieldKey="relatedContractId"
      defaultShow
    />,
    <SearchFormItem
      key="relatedProductId"
      fieldType="ProductSimpleSelect"
      label="相关产品"
      fieldKey="relatedProductId"
      defaultShow
    />,
    <SearchFormItem
      key="inchargeResId"
      fieldType="ResSimpleSelect"
      label="采购负责人"
      fieldKey="inchargeResId"
      defaultShow
    />,
    <SearchFormItem
      key="originalCurrency"
      fieldType="BaseSelect"
      label="采购币种"
      fieldKey="originalCurrency"
      parentKey="COMMON_CURRENCY"
      defaultShow
    />,
    <SearchFormItem
      key="createUserId"
      fieldType="UserSimpleSelect"
      label="创建人"
      fieldKey="createUserId"
      defaultShow
    />,
    <SearchFormItem
      key="createDateFrom"
      fieldType="BaseDatePicker"
      label="创建日期起"
      fieldKey="createDateFrom"
      defaultShow
    />,
    <SearchFormItem
      key="createDateTo"
      fieldType="BaseDatePicker"
      label="创建日期止"
      fieldKey="createDateTo"
      defaultShow
    />,
  ];

  /**
   * 调整
   */
  // checkPurchase = async key => {
  //   const response = outputHandle(purchasePartialModify, { id: key, poStatus: 'CLOSE' });
  //   return response;
  // };
  /**
   * 激活
   */
  activePurchase = async key => {
    this.setState({
      visible: false,
    });
    const response = outputHandle(purchasePartialModify, { id: key, poStatus: 'ACTIVE' });
    return response;
  };

  /**
   * 关闭
   */
  closePurchase = async key => {
    const response = outputHandle(purchasePartialModify, { id: key, poStatus: 'CLOSE' });
    return response;
  };

  handleOk = e => {
    this.setState({
      visible: false,
    });
    const { selectedRowKey, refreshDataFunction } = this.state;
    this.activePurchase(selectedRowKey).then(() => refreshDataFunction());
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { form, treeLoading, formData, formMode, selectionList, ...rest } = this.props;
    const { visible, selectedRowKey, refreshDataFunction } = this.state;

    const columns = [
      {
        title: '采购单号',
        dataIndex: 'poNo',
        ellipsis: true,
        sorter: true,
        render: (value, row, index) => (
          <Link
            onClick={() =>
              router.push(`/workTable/pur/purchaseDisplayPage?id=${row.id}&mode=DESCRIPTION`)
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '采购单名称',
        dataIndex: 'poName',
        ellipsis: true,
        sorter: true,
      },
      {
        title: '采购类型',
        dataIndex: 'poClass1Desc',
        ellipsis: true,
      },
      {
        title: '采购小类',
        dataIndex: 'poClass2Desc',
        ellipsis: true,
      },
      {
        title: '供应商',
        dataIndex: 'supplierName',
        ellipsis: true,
      },
      {
        title: '采购负责人',
        dataIndex: 'inchargeResName',
        ellipsis: true,
      },
      {
        title: '采购币种',
        dataIndex: 'originalCurrencyDesc',
        ellipsis: true,
      },
      {
        title: '采购金额',
        dataIndex: 'originalCurrencyAmt',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '状态',
        dataIndex: 'poStatusDesc',
        ellipsis: true,
      },
      {
        title: '费用归属',
        dataIndex: 'chargeClassificationDesc',
        ellipsis: true,
      },
      {
        title: '费用承担项目',
        dataIndex: 'chargeProjectName',
        ellipsis: true,
      },
      {
        title: '费用承担公司',
        dataIndex: 'chargeCompanyDesc',
        ellipsis: true,
      },
      {
        title: '费用承担部门',
        dataIndex: 'chargeBuName',
        ellipsis: true,
      },
      {
        title: '相关预算',
        dataIndex: 'relatedBudgetName',
        ellipsis: true,
      },
      {
        title: '相关合同',
        dataIndex: 'relatedContractName',
        ellipsis: true,
      },
      {
        title: '相关产品',
        dataIndex: 'relatedProductName',
      },
      {
        title: '创建人',
        dataIndex: 'createUserName',
      },
      {
        title: '创建日期',
        dataIndex: 'createTime',
      },
    ];

    const { defaultSearchForm } = this.state;
    const { chargeBuId, chargeCompany, chargeProjectId, relatedProductId } = fromQs();

    return (
      <PageWrapper>
        <SearchTable
          searchTitle={undefined}
          defaultAdvancedSearch={false}
          showSearchCardTitle={false}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          searchForm={this.renderSearchForm()}
          defaultSearchForm={defaultSearchForm}
          fetchData={this.fetchData}
          columns={columns}
          tableExtraProps={{ scroll: { x: 2400 } }}
          onAddClick={() => {
            if (fromQs().chargeBuId) {
              //判断是否是从相关概览跳转到采购页，如果是点击新增的时候把对应的数据带过去
              router.push(
                `/workTable/pur/purchaseDisplayPage?mode=EDIT&chargeBuId=${chargeBuId}&chargeCompany=${chargeCompany}&chargeProjectId=${chargeProjectId}&relatedProductId=${relatedProductId}`
              );
            } else {
              router.push('/workTable/pur/purchaseDisplayPage?mode=EDIT');
            }
          }}
          onEditClick={data => {
            if (data.poStatus === 'CREATE') {
              router.push(`/workTable/pur/purchaseDisplayPage?id=${data.id}&mode=EDIT`);
            } else {
              message({
                type: 'error',
                content: remindString({
                  remindCode: 'COM:E:ALLOW_MODIFY_CHECK',
                  defaultMessage: '仅“新建”状态允许修改',
                }),
              });
            }
          }}
          deleteData={this.deleteData}
          extraButtons={[
            {
              key: 'check',
              title: '调整',
              type: 'info',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, refreshData, selectedRows } = internalState;
                if (selectedRows[0].poStatus === 'ACTIVE') {
                  router.push(
                    `/workTable/pur/purchaseDisplayPage?id=${
                      selectedRows[0].id
                    }&mode=EDIT&flag=CHECK`
                  );
                } else {
                  message({
                    type: 'error',
                    content: remindString({
                      remindCode: 'COM:ALLOW_ADJUST_CHECK',
                      defaultMessage: '仅“激活”状态允许调整',
                    }),
                  });
                }
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'active',
              title: '激活',
              type: 'info',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, refreshData, selectedRows } = internalState;
                if (selectedRows[0].poStatus === 'CLOSE') {
                  this.setState({
                    visible: true,
                    selectedRowKey: selectedRowKeys[0],
                    refreshDataFunction: refreshData,
                  });
                  // this.activePurchase(selectedRowKeys[0]).then(() => refreshData());
                } else {
                  message({
                    type: 'error',
                    content: remindString({
                      remindCode: 'COM:E:ALLOW_REACTIVE_CHECK',
                      defaultMessage: '仅“已关闭”的采购单允许重新激活',
                    }),
                  });
                }
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'close',
              title: '关闭',
              type: 'info',
              size: 'large',
              loading: false,
              cb: internalState => {
                // eslint-disable-next-line no-console
                // 获得刷新数据方法，并且刷新数据
                const { selectedRowKeys, refreshData, selectedRows } = internalState;
                if (selectedRows[0].poStatus === 'ACTIVE') {
                  // TODO 2.	校验2：联动检查该采购单的付款计划所关联的付款申请单的状态，如果存在付款申请状态（PAYMENT_REQUEST_STATUS）<>“完成付款”的付款申请单，则不允许关闭，提示“该采购单还存在进行中的付款申请流程，必须等付款流程处理完毕或将流程撤销后才能关闭！”（PUR:E:PO_RELATED_PAYMENT_CHECK）
                  // TODO 3.	校验2：联动检查该采购单的付款计划所关联的付款申请单的状态，如果存在付款申请状态（PAYMENT_REQUEST_STATUS）<>“完成付款”的付款申请单，则不允许关闭，提示“该采购单还存在进行中的付款申请流程，必须等付款流程处理完毕或将流程撤销后才能关闭！”（PUR:E:PO_RELATED_PAYMENT_CHECK）
                  this.closePurchase(selectedRowKeys[0]).then(() => refreshData());
                } else {
                  message({
                    type: 'error',
                    content: remindString({
                      remindCode: 'COM:ALLOW_CLOSE_CHECK',
                      defaultMessage: '仅“激活”状态允许关闭',
                    }),
                  });
                }
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
          ]}
        />

        <Modal title="提示" visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <span>继续操作将重新激活选中的数据，请确认是否继续？</span>
        </Modal>
      </PageWrapper>
    );
  }
}

export default PurchaseList;
