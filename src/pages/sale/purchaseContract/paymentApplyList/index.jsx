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
import { selectIamUsers, selectAllAbOu } from '@/services/gen/list';
import AsyncSelect from '@/components/common/AsyncSelect';
import { Selection } from '@/pages/gen/field';
import { selectContract } from '@/services/user/Contract/sales';

const DOMAIN = 'paymentApplyList';
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
@connect(({ loading, paymentApplyList }) => ({
  paymentApplyList,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class PaymentApplyList extends PureComponent {
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
        createTimeStart:
          params.createTime && params.createTime[0]
            ? `${params.createTime[0].format('YYYY-MM-DD')}T00:00:00`
            : undefined,
        createTimeEnd:
          params.createTime && params.createTime[1]
            ? `${params.createTime[1].format('YYYY-MM-DD')}T00:00:00`
            : undefined,
      },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      paymentApplyList: { list = [], total = 0, searchForm },
    } = this.props;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: {
        x: 2800,
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
          title: '付款申请单名称',
          dataIndex: 'purchaseName',
          options: {
            initialValue: searchForm.purchaseName || undefined,
          },
          tag: <Input placeholder="请输入付款申请单名称" />,
        },
        {
          title: '申请单类型',
          dataIndex: 'paymentApplicationType',
          options: {
            initialValue: searchForm.paymentApplicationType || undefined,
          },
          tag: <Selection.UDC code="TSK:PAYMENT_APPLICATION_TYPE" placeholder="请选择申请单类型" />,
        },
        {
          title: '付款公司',
          dataIndex: 'paymentCompany1',
          options: {
            initialValue: searchForm.paymentCompany1,
          },
          tag: <Selection.UDC code="RES:MEETING_ROOM_STATUS" placeholder="请选择付款公司" />,
        },
        {
          title: '供应商',
          dataIndex: 'supplierLegalNo',
          options: {
            initialValue: searchForm.supplierLegalNo,
          },
          tag: (
            <Selection.Columns
              columns={particularColumns}
              source={() => selectAllAbOu()}
              placeholder="请选择供应商"
              showSearch
            />
          ),
        },
        {
          title: '付款单申请状态',
          dataIndex: 'state',
          options: {
            initialValue: searchForm.state,
          },
          tag: <Selection.UDC code="TSK:PAYMENT_APPLY_STATE" placeholder="请选择付款单申请状态" />,
        },
        {
          title: '验收方式',
          dataIndex: 'acceptanceType',
          options: {
            initialValue: searchForm.acceptanceType,
          },
          tag: <Selection.UDC code="TSK:ACCEPTANCE_TYPE" placeholder="请选择验收方式" />,
        },
        {
          title: '关联销售合同',
          dataIndex: 'relatedSalesContract',
          options: {
            initialValue: searchForm.relatedSalesContract,
          },
          tag: (
            <AsyncSelect
              source={() => selectContract().then(resp => resp.response)}
              placeholder="请选择关联销售合同"
            />
          ),
        },
        {
          title: '关联项目号',
          dataIndex: 'relatedProjectNo',
          options: {
            initialValue: searchForm.relatedProjectNo,
          },
          tag: <Input placeholder="请输入关联项目号" />,
        },
        {
          title: '创建人',
          dataIndex: 'createUser',
          options: {
            initialValue: searchForm.createUser,
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
          title: '创建时间',
          dataIndex: 'createTime',
          options: {
            initialValue: searchForm.createTime,
          },
          tag: <RangePicker style={{ width: '100%' }} />,
        },
      ],
      columns: [
        {
          title: '申请单单号',
          width: 200,
          dataIndex: 'paymentNo',
          align: 'center',
          render: (val, row, index) => (
            <Link
              className="tw-link"
              to={`/sale/purchaseContract/${
                PAYMENT_APPLY_TYPE[row.paymentApplicationType]
              }/edit?mode=view&id=${row.id}&scene=${row.scene}`}
            >
              {val}
            </Link>
          ),
        },
        {
          title: '付款申请单名称',
          dataIndex: 'purchaseName',
          align: 'center',
          width: 200,
        },
        {
          title: '申请单类型',
          width: 200,
          dataIndex: 'paymentApplicationTypeName',
          align: 'center',
        },
        {
          title: '付款公司',
          dataIndex: 'paymentCompany1Name',
          align: 'center',
          width: 300,
        },
        {
          title: '供应商',
          align: 'center',
          dataIndex: 'supplierLegalNoName',
          width: 300,
        },
        {
          title: '关联单据类型',
          dataIndex: 'docTypeName',
          align: 'center',
          width: 100,
        },
        {
          title: '关联单据号',
          dataIndex: 'docNo',
          align: 'center',
          width: 200,
        },
        {
          title: '付款申请单状态',
          dataIndex: 'stateName',
          align: 'center',
          width: 90,
        },
        {
          title: '金额',
          dataIndex: 'currPaymentAmt',
          align: 'center',
          width: 100,
        },
        {
          title: '税率',
          dataIndex: 'rate',
          align: 'center',
          width: 90,
        },
        {
          title: '币种',
          dataIndex: 'currCodeName',
          align: 'center',
          width: 100,
        },
        {
          title: '申请日期',
          dataIndex: 'applicationDate',
          align: 'center',
          render: (value, row) => <span>{value && moment(value).format('YYYY-MM-DD')}</span>,
          width: 150,
        },
        {
          title: '关联销售合同',
          dataIndex: 'relatedSalesContract',
          align: 'center',
          width: 200,
        },
        {
          title: '关联项目号',
          dataIndex: 'relatedProjectNo',
          align: 'center',
          width: 200,
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
          align: 'center',
          width: 100,
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          align: 'center',
          width: 200,
          render: (value, row) => <span>{moment(value).format('YYYY-MM-DD HH:mm:ss')}</span>,
        },
      ],
      leftButtons: [
        // {
        //   key: 'add',
        //   icon: 'plus-circle',
        //   className: 'tw-btn-primary',
        //   title: '新建',
        //   loading: false,
        //   hidden: false,
        //   disabled: loading || false,
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     router.push(`/sale/purchaseContract/prePaymentApply/edit?mode=create`);
        //   },
        // },
        {
          key: 'writeOff',
          icon: 'form',
          className: 'tw-btn-primary',
          title: '预付款核销',
          loading: false,
          hidden: false,
          minSelections: 0,
          disabled: (selectedRowKeys, selectedRows) => selectedRowKeys.length !== 1,
          // minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id, paymentApplicationType, state, apprStatus } = selectedRows[0];
            if (paymentApplicationType === 'ADVANCEPAY') {
              if (state === 'PAID') {
                router.push(`/sale/purchaseContract/prePayWriteOff/edit?mode=create&preId=${id}`);
              } else {
                createMessage({ type: 'warn', description: '状态为已付款状态才能核销' });
              }
            } else {
              createMessage({ type: 'warn', description: '只有预付款才能发起核销' });
            }
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: '编辑',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const {
              id,
              paymentApplicationType,
              scene,
              docNo = '',
              state,
              apprStatus,
            } = selectedRows[0];
            if (state === 'NEW') {
              if (apprStatus === 'REJECTED') {
                createMessage({ type: 'warn', description: '该状态为被退回状态不能编辑' });
              } else if (apprStatus === 'WITHDRAW') {
                createMessage({ type: 'warn', description: '该状态为被撤回状态不能编辑' });
              } else {
                router.push(
                  `/sale/purchaseContract/${
                    PAYMENT_APPLY_TYPE[paymentApplicationType]
                  }/edit?mode=edit&id=${id}&scene=${scene}`
                );
              }
            } else {
              createMessage({ type: 'warn', description: '该状态为流程状态不能编辑' });
            }
          },
        },
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
            const { id, state, apprStatus } = selectedRows[0];
            if (state === 'NEW') {
              if (apprStatus === 'REJECTED') {
                createMessage({ type: 'warn', description: '该状态为被退回状态不能删除' });
              } else if (apprStatus === 'WITHDRAW') {
                createMessage({ type: 'warn', description: '该状态为被撤回状态不能删除' });
              } else {
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: id,
                });
              }
            } else {
              createMessage({ type: 'warn', description: '该状态为流程状态不能删除' });
            }
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="付款申请单列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default PaymentApplyList;
