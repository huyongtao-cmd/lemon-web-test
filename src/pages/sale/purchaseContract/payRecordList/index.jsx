import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import moment from 'moment';
import { Input, DatePicker, Select } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { formatMessage } from 'umi/locale';
import { selectIamUsers } from '@/services/gen/list';
import AsyncSelect from '@/components/common/AsyncSelect';
import { Selection } from '@/pages/gen/field';
import { selectContract } from '@/services/user/Contract/sales';
import Ellipsis from '@/components/common/Ellipsis';

const DOMAIN = 'payRecordList';
const { RangePicker } = DatePicker;

const PAYMENT_APPLY_TYPE = {
  CONTRACT: 'paymentApplyList',
  AGREEMENT: 'paymentApplyList',
  ADVANCEPAY: 'prePaymentApply', // 预付款
  ADVANCEPAYWRITEOFF: 'prePayWriteOff', // 付款核销
  SALARYPAYMENT: 'paymentApplyList',
  OTHERPAYMENT: 'paymentApplyList',
};
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
@connect(({ loading, payRecordList }) => ({
  payRecordList,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class PayRecordList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        createTime: undefined,
        purchaseDateStart:
          params.createTime && params.createTime[0]
            ? params.createTime[0].format('YYYY-MM-DD')
            : undefined,
        purchaseDateEnd:
          params.createTime && params.createTime[1]
            ? params.createTime[1].format('YYYY-MM-DD')
            : undefined,
      },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      payRecordList: { list = [], total = 0, searchForm },
    } = this.props;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: {
        x: 3000,
      },
      loading,
      total,
      dataSource: list,
      enableSelection: true,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        {
          title: '付款申请单编号',
          dataIndex: 'paymentNo',
          options: {
            initialValue: searchForm.paymentNo || undefined,
          },
          tag: <Input placeholder="请输入付款申请单编号" />,
        },
        {
          title: '申请人',
          dataIndex: 'applicationUserId',
          options: {
            initialValue: searchForm.applicationUserId,
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
        {
          title: '付款公司',
          dataIndex: 'psubjecteCompany',
          options: {
            initialValue: searchForm.psubjecteCompany,
          },
          tag: <Selection.UDC code="RES:MEETING_ROOM_STATUS" placeholder="请选择付款公司" />,
        },
        {
          title: '供应商',
          dataIndex: 'supplierLegalNo',
          options: {
            initialValue: searchForm.supplierLegalNo,
          },
          tag: <Selection.UDC code="TSK:BUSINESS_TYPE" placeholder="请选择供应商" />,
        },
        // {
        //   title: '工作流状态',
        //   dataIndex: 'paymentApplicationType',
        //   options: {
        //     initialValue: searchForm.paymentApplicationType || undefined,
        //   },
        //   tag: <Selection.UDC code="TSK:PAYMENT_APPLICATION_TYPE" placeholder="请选择申请单类型" />,
        // },
        // {
        //   title: '付款事由',
        //   dataIndex: 'paymentApplicationType',
        //   options: {
        //     initialValue: searchForm.paymentApplicationType || undefined,
        //   },
        //   tag: <Selection.UDC code="TSK:PAYMENT_APPLICATION_TYPE" placeholder="请选择申请单类型" />,
        // },
        // {
        //   title: '付款单备注',
        //   dataIndex: 'paymentApplicationType',
        //   options: {
        //     initialValue: searchForm.paymentApplicationType || undefined,
        //   },
        //   tag: <Selection.UDC code="TSK:PAYMENT_APPLICATION_TYPE" placeholder="请选择申请单类型" />,
        // },
        {
          title: '付款记录单状态',
          dataIndex: 'state',
          options: {
            initialValue: searchForm.state,
          },
          tag: <Selection.UDC code="TSK:PAYMENT_SLIP_STATUS" placeholder="请选择付款记录单状态" />,
        },
        {
          title: '付款日期',
          dataIndex: 'createTime',
          options: {
            initialValue: searchForm.createTime,
          },
          tag: <RangePicker style={{ width: '100%' }} />,
        },
      ],
      columns: [
        {
          title: '付款申请单',
          dataIndex: 'paymentNo',
          align: 'center',
          width: 200,
          render: (val, row, index) => (
            <Link
              className="tw-link"
              to={`/sale/purchaseContract/payRecordList/edit?mode=view&id=${row.id}`}
            >
              {val}
            </Link>
          ),
        },
        {
          title: '付款事由',
          dataIndex: 'paymentNote',
          align: 'center',
          width: 200,
        },
        {
          title: '付款申请人',
          dataIndex: 'applicationUserName',
          align: 'center',
          width: 100,
        },
        // {
        //   title: '工作流状态',
        //   dataIndex: 'createUserName',
        //   align: 'center',
        // },
        {
          title: '付款银行',
          dataIndex: 'psubjecteBank',
          align: 'center',
          width: 120,
        },
        {
          title: '付款账号',
          dataIndex: 'paymentAccount',
          align: 'center',
          width: 300,
        },
        {
          title: '付款公司',
          dataIndex: 'psubjecteCompanyName',
          align: 'center',
          width: 300,
        },
        {
          title: '科目说明(记账科目)',
          dataIndex: 'psubjecteThatName',
          align: 'center',
          width: 300,
        },
        {
          title: '付款方式',
          dataIndex: 'payMethodName',
          align: 'center',
          width: 150,
        },
        // {
        //   title: '付款金额',
        //   dataIndex: 'createUserName',
        //   align: 'center',
        // },
        {
          title: '付款日期',
          dataIndex: 'purchaseDate',
          align: 'center',
          render: (value, row) => (
            <span>{value && moment(value).format('YYYY-MM-DD HH:mm:ss')}</span>
          ),
          width: 200,
        },
        {
          title: '收款银行',
          dataIndex: 'collectionBank',
          align: 'center',
          width: 100,
        },
        {
          title: '收款账号',
          dataIndex: 'collectionId',
          align: 'center',
          width: 300,
        },
        {
          title: '收款公司',
          dataIndex: 'collectionCompany',
          align: 'center',
          width: 300,
        },
        {
          title: '状态',
          dataIndex: 'stateName',
          align: 'center',
          width: 100,
        },
        {
          title: '备注',
          dataIndex: 'note',
          align: 'center',
          width: 300,
          render: val => <Ellipsis length={300}>{val}</Ellipsis>,
        },
      ],
      leftButtons: [
        {
          key: 'delete',
          icon: 'form',
          className: 'tw-btn-primary',
          title: '删除',
          loading: false,
          hidden: false,
          minSelections: 0,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: id,
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="付款记录列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default PayRecordList;
