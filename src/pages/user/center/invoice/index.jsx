import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import moment from 'moment';
import { Input, DatePicker, Select } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { selectIamUsers } from '@/services/gen/list';
import { Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import BatchEditModal from './modal/batchEditModal';

const DOMAIN = 'invoiceList';
const { RangePicker } = DatePicker;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
@connect(({ loading, invoiceList, user }) => ({
  invoiceList,
  loading,
  user,
}))
@mountToTab()
class InvoiceList extends PureComponent {
  state = {
    batchEditVisible: false,
    ownerSelectedKeys: [],
  };

  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    const {
      dispatch,
      invoiceList: { module },
      user,
    } = this.props;
    if (module === '/user/center/invoice') {
      const params = { userId: user.user.id };
      dispatch({ type: `${DOMAIN}/query`, payload: params });
    } else {
      dispatch({ type: `${DOMAIN}/query` });
    }
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'INVOICE_LIST' },
    });
  }

  fetchData = params => {
    const {
      dispatch,
      invoiceList: { module },
      user,
    } = this.props;
    let newParams = params;
    if (module === '/user/center/invoice') {
      newParams = { ...newParams, userId: user.user.id };
    }
    dispatch({ type: `${DOMAIN}/query`, payload: { ...newParams } });
  };

  // 打开/关闭批量修改弹窗
  batchEditModal = flag => {
    const {
      invoiceList: { searchForm },
    } = this.props;
    const { batchEditVisible } = this.state;
    if (flag === 'YES') {
      // createMessage({ type: 'success', description: '修改成功' });
      this.fetchData(searchForm);
    }
    this.setState({
      batchEditVisible: !batchEditVisible,
      ownerSelectedKeys: [],
    });
  };

  tableProps = () => {
    const {
      loading,
      dispatch,
      invoiceList: { list = [], total = 0, searchForm, pageConfig, module },
      user,
    } = this.props;

    // 页面配置信息数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentQueryConfig = [];
    let currentListConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.blockKey === 'INVOICE_LIST_SEARCH') {
        // 发票池
        currentQueryConfig = view; // 查询条件区域
      } else if (view.blockKey === 'INVOICE_LIST') {
        currentListConfig = view; // 主区域
      }
    });
    const { pageFieldViews: pageFieldViewsQuery } = currentQueryConfig; // 查询区域
    const { pageFieldViews: pageFieldViewsList } = currentListConfig; // 列表区域

    const pageFieldJsonQuery = {}; // 查询区域
    const pageFieldJsonList = {}; // 列表区域
    if (pageFieldViewsQuery) {
      pageFieldViewsQuery.forEach(field => {
        pageFieldJsonQuery[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsList) {
      pageFieldViewsList.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }

    const {
      invType = {},
      invState = {},
      invReimStatus = {},
      invOwnerId = {},
      invLtype = {},
      baiwangInvId = {},
      billId = {},
      fileId = {},
      isDeduct = {},
      deductTax = {},
      invoiceType = {},
      isDel = {},
      hasPicture = {},
      hasPosition = {},
      baiwangCreateTime = {},
      baiwangUpdateTime = {},
      inspectionTime = {},
      inspectionStatus = {},
      inspectionErrorDesc = {},
      zeroTaxRateSign = {},
      invoiceState = {},
      verifyStatus = {},
      reimburseStatus = {},
      collectUseType = {},
      userAccount = {},
      userId = {},
      userName = {},
      orgId = {},
      orgName = {},
      administrativeDivisionNo = {},
      administrativeDivisionName = {},
      invoiceCode = {},
      invoiceNo = {},
      invoiceDate = {},
      purchaserName = {},
      purchaserTaxNo = {},
      purchaserBank = {},
      purchaserAddressPhone = {},
      saleName = {},
      saleTaxNo = {},
      saleAddressPhone = {},
      saleBank = {},
      totalAmount = {},
      totalTax = {},
      amountTax = {},
      amountTaxCn = {},
      otherTax = {},
      civilAviationFund = {},
      checkCode = {},
      machineCode = {},
      ciphertext = {},
      baiwangRemark = {},
      drawer = {},
      leaveCity = {},
      arriveCity = {},
      leaveTime = {},
      arriveTime = {},
      trainNumber = {},
      trainSeat = {},
      idNum = {},
      mileage = {},
      taxRate = {},
      buyerIdentification = {},
      marketTaxNo = {},
      sellerId = {},
      orientation = {},
      hasSeal = {},
      carNo = {},
      carCode = {},
      carEngineCode = {},
      machineInvoiceNo = {},
      machineInvoiceCode = {},
      asyncCode = {},
      invoicePositionX1 = {},
      invoicePositionY1 = {},
      invoicePositionX2 = {},
      invoicePositionY2 = {},
      invoiceTemplateType = {},
      invoiceTemplateName = {},
      invoiceCiphertext = {},
      taxAuthoritiesCode = {},
      taxAuthoritiesName = {},
      carModel = {},
      certificateNo = {},
      marketName = {},
      registrationNo = {},
      serialNum = {},
      premium = {},
      printNumber = {},
      invoiceTime = {},
      entrance = {},
      roadExit = {},
      isHighway = {},
      remark = {},
      delFlag = {},
      createUserId = {},
      createTime = {},
      modifyUserId = {},
      modifyTime = {},
      createUserName = {},
      invOwnerName = {},
    } = pageFieldJsonList;

    return {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 2000 },
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      dataSource: list,
      enableSelection: true,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        if (module === '/user/center/invoice') {
          dispatch({
            type: `${DOMAIN}/updateSearchForm`,
            payload: { ...allValues, userId: user.user.id },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/updateSearchForm`,
            payload: allValues,
          });
        }
      },
      searchForm,
      searchBarForm: [
        pageFieldJsonQuery.invoiceNo.visibleFlag && {
          title: `${pageFieldJsonQuery.invoiceNo.displayName}`,
          dataIndex: 'invoiceNo',
          sortNo: `${pageFieldJsonQuery.invoiceNo.sortNo}`,
          options: {
            placeholder: '发票号码',
            initialValue: searchForm.invoiceNo,
          },
          tag: <Input placeholder="请输入发票号码" />,
        },
        pageFieldJsonQuery.invOwnerId.visibleFlag && {
          title: `${pageFieldJsonQuery.invOwnerId.displayName}`,
          dataIndex: 'invOwnerId',
          sortNo: `${pageFieldJsonQuery.invOwnerId.sortNo}`,
          options: {
            initialValue: searchForm.invOwnerId,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectIamUsers()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择归属人"
            />
          ),
        },
        pageFieldJsonQuery.createUserId.visibleFlag && {
          title: `${pageFieldJsonQuery.createUserId.displayName}`,
          dataIndex: 'createUserId',
          sortNo: `${pageFieldJsonQuery.createUserId.sortNo}`,
          options: {
            initialValue: searchForm.createUserId,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectIamUsers()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择创建人"
            />
          ),
        },
        pageFieldJsonQuery.invoiceDate.visibleFlag && {
          title: `${pageFieldJsonQuery.invoiceDate.displayName}`,
          dataIndex: 'invoiceDate',
          sortNo: `${pageFieldJsonQuery.invoiceDate.sortNo}`,
          options: {
            initialValue: searchForm.invoiceDate,
          },
          tag: <RangePicker />,
        },
        // pageFieldJsonQuery.purchaserName.visibleFlag && {
        //   title: `${pageFieldJsonQuery.purchaserName.displayName}`,
        //   dataIndex: 'purchaserName',
        //   sortNo: `${pageFieldJsonQuery.purchaserName.sortNo}`,
        //   options: {
        //     initialValue: searchForm.purchaserName,
        //   },
        //   tag: <Input placeholder="请输入购方名称" />,
        // },
        pageFieldJsonQuery.saleName.visibleFlag && {
          title: `${pageFieldJsonQuery.saleName.displayName}`,
          dataIndex: 'saleName',
          sortNo: `${pageFieldJsonQuery.saleName.sortNo}`,
          options: {
            initialValue: searchForm.saleName,
          },
          tag: <Input placeholder="请输入销方名称" />,
        },
        pageFieldJsonQuery.invState.visibleFlag && {
          title: `${pageFieldJsonQuery.invState.displayName}`,
          dataIndex: 'invState',
          sortNo: `${pageFieldJsonQuery.invState.sortNo}`,
          options: {
            initialValue: searchForm.invState,
          },
          tag: <Selection.UDC code="ACC:INV_STATUS" placeholder="请选择发票状态" />,
        },
        pageFieldJsonQuery.invReimStatus.visibleFlag && {
          title: `${pageFieldJsonQuery.invReimStatus.displayName}`,
          dataIndex: 'invReimStatus',
          sortNo: `${pageFieldJsonQuery.invReimStatus.sortNo}`,
          options: {
            initialValue: searchForm.invReimStatus,
          },
          tag: <Selection.UDC code="ACC:INV_REIMB_STATUS" placeholder="请选择报销状态" />,
        },
      ],
      columns: [
        {
          title: `${invoiceType.displayName}`,
          dataIndex: 'invoiceType',
          align: 'center',
        },

        {
          title: `${createUserId.displayName}`,
          dataIndex: 'createUserName',
          align: 'center',
        },
        {
          title: `${invoiceCode.displayName}`,
          dataIndex: 'invoiceCode',
          align: 'center',
        },
        {
          title: `${invoiceNo.displayName}`,
          dataIndex: 'invoiceNo',
          align: 'center',
          render: (val, row, index) => (
            <Link className="tw-link" to={`/user/center/invoice/detail?mode=view&id=${row.id}`}>
              {val}
            </Link>
          ),
        },
        {
          title: `${invOwnerId.displayName}`,
          dataIndex: 'invOwnerName',
          align: 'center',
        },
        {
          title: `${invoiceDate.displayName}`,
          dataIndex: 'invoiceDate',
          align: 'center',
          // render: (value, row) => <span>{moment(value).format('YYYY-MM-DD HH:mm:ss')}</span>,
        },
        {
          title: `${checkCode.displayName}`,
          dataIndex: 'checkCode',
          align: 'center',
        },
        {
          title: `${amountTax.displayName}`,
          dataIndex: 'amountTax',
          align: 'center',
        },
        {
          title: `${totalTax.displayName}`,
          dataIndex: 'totalTax',
          align: 'center',
        },
        {
          title: `${invState.displayName}`,
          dataIndex: 'invState',
          align: 'center',
          render: (val, row, index) => row.invStateDesc,
        },
        {
          title: `${invReimStatus.displayName}`,
          dataIndex: 'invReimStatus',
          align: 'center',
          render: (val, row, index) => row.invReimStatusDesc,
        },
        {
          title: `${saleName.displayName}`,
          dataIndex: 'saleName',
          align: 'center',
        },
        {
          title: `${saleTaxNo.displayName}`,
          dataIndex: 'saleTaxNo',
          align: 'center',
        },
        {
          title: `${saleAddressPhone.displayName}`,
          dataIndex: 'saleAddressPhone',
          align: 'center',
        },
        {
          title: `${saleBank.displayName}`,
          dataIndex: 'saleBank',
          align: 'center',
        },
        {
          title: `${taxRate.displayName}`,
          dataIndex: 'taxRate',
          align: 'center',
        },
        {
          title: `${drawer.displayName}`,
          dataIndex: 'drawer',
          align: 'center',
        },
        {
          title: `${leaveCity.displayName}`,
          dataIndex: 'leaveCity',
          align: 'center',
        },
        {
          title: `${arriveCity.displayName}`,
          dataIndex: 'arriveCity',
          align: 'center',
        },
        {
          title: `${trainNumber.displayName}`,
          dataIndex: 'trainNumber',
          align: 'center',
        },
        {
          title: `${idNum.displayName}`,
          dataIndex: 'idNum',
          align: 'center',
        },
        {
          title: `${trainSeat.displayName}`,
          dataIndex: 'trainSeat',
          align: 'center',
        },
        {
          title: `${leaveTime.displayName}`,
          dataIndex: 'leaveTime',
          align: 'center',
        },
        {
          title: `${arriveTime.displayName}`,
          dataIndex: 'arriveTime',
          align: 'center',
        },
        {
          title: `${mileage.displayName}`,
          dataIndex: 'mileage',
          align: 'center',
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: '新增',
          loading: false,
          hidden: false,
          disabled: true,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // router.push(`/user/meetingManage/invoiceList/detail?mode=create`);
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: '修改',
          loading: false,
          hidden: false,
          disabled: true,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // const { id } = selectedRows[0];
            // router.push(`/user/meetingManage/invoiceList/detail?mode=edit&id=${id}`);
          },
        },
        // {
        //   key: 'invalid',
        //   className: 'tw-btn-primary',
        //   title: '作废',
        //   loading: false,
        //   hidden: false,
        //   disabled: module !== '/user/center/invoice' ? true : selectedRows => !selectedRows.length,
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     if (selectedRows.length === 0) {
        //       createMessage({ type: 'error', description: '请至少选择一条数据' });
        //       return;
        //     }
        //     if (selectedRows.filter(i => i.invReimStatus !== 'NEW').length > 0) {
        //       createMessage({ type: 'error', description: '只能作废未使用的发票' });
        //       return;
        //     }
        //     createConfirm({
        //       content: '确定要作废这些发票吗?',
        //       onOk: () => {
        //         dispatch({
        //           type: `${DOMAIN}/invalid`,
        //           payload: { ids: selectedRowKeys.join(',') },
        //         });
        //       },
        //     });
        //   },
        // },
        {
          key: 'order',
          className: 'tw-btn-primary',
          title: '查看报销单',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { reimType2, reimNo, reimId } = selectedRows[0];
            if (!(reimId && reimNo && reimType2)) {
              createMessage({ type: 'error', description: '发票尚未关联报销单' });
              return;
            }
            let type;
            switch (reimType2) {
              // 差旅报销
              case 'TRIP': {
                type = 'trip';
                break;
              }
              // 行政订票报销
              case 'TICKET': {
                type = 'trip';
                break;
              }
              // 专项费用报销
              case 'SPEC': {
                type = 'spec';
                break;
              }
              // 特殊费用报销 -因公报销
              case 'BSPECIAL': {
                type = 'particular';
                break;
              }
              // 特殊费用报销 -个人报销
              case 'PSPECIAL': {
                type = 'particular';
                break;
              }
              // 提现付款报销
              case 'WITHDRAW_PAY': {
                type = 'withdrawFlowPay';
                break;
              }
              // 非差旅报销
              default: {
                type = 'normal';
                break;
              }
            }
            router.push(`/plat/expense/${type}/view?id=${reimId}`);
          },
        },
        {
          key: 'owner',
          className: 'tw-btn-primary',
          title: '修改归属人',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows.length === 0) {
              createMessage({ type: 'error', description: '请至少选择一条数据' });
              return;
            }
            this.setState({
              batchEditVisible: true,
              ownerSelectedKeys: selectedRowKeys,
            });
          },
        },
        {
          key: 'syncMyInvoice',
          className: 'tw-btn-primary',
          title: '同步最新发票',
          loading: loading.effects[`${DOMAIN}/getMyInvoiceFromBaiwang`],
          hidden: false,
          disabled: module !== '/user/center/invoice',
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (module === '/user/center/invoice') {
              dispatch({
                type: `${DOMAIN}/updateSearchForm`,
                payload: { ...searchForm, userId: user.user.id },
              });
            } else {
              dispatch({
                type: `${DOMAIN}/updateSearchForm`,
                payload: searchForm,
              });
            }

            dispatch({
              type: `${DOMAIN}/getMyInvoiceFromBaiwang`,
            });
          },
        },
      ],
    };
  };

  render() {
    const {
      loading,
      dispatch,
      invoiceList: { list = [], total = 0, searchForm, pageConfig },
    } = this.props;
    const { batchEditVisible, ownerSelectedKeys } = this.state;

    return (
      <PageHeaderWrapper title="发票池">
        {pageConfig && <DataTable {...this.tableProps()} />}
        {batchEditVisible ? (
          <BatchEditModal
            visible={batchEditVisible}
            selectedKeys={ownerSelectedKeys}
            closeModal={this.batchEditModal}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default InvoiceList;
