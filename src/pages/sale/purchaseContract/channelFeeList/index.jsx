import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Input, Tooltip } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { isNil } from 'ramda';

const DOMAIN = 'channelFeeList';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
@connect(({ loading, channelFeeList, dispatch, global }) => ({
  channelFeeList,
  loading,
  dispatch,
  global,
}))
class channelFeeList extends PureComponent {
  componentDidMount() {
    this.fetchData({
      offset: 0,
      limit: 10,
      sortBy: 'id',
      sortDirection: 'DESC',
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
      },
    });
  };

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      channelFeeList: { list },
      dispatch,
    } = this.props;

    const newDataSource = list;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { list: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      channelFeeList: { list = [], total = 0, searchForm },
      global: { userList },
    } = this.props;

    const tableLoading = loading.effects[`${DOMAIN}/query`];

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 3500 },
      loading: tableLoading,
      total,
      dataSource: list,
      enableSelection: false,
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
          title: '合同编号',
          dataIndex: 'contractNo',
          options: {
            initialValue: searchForm.contractNo || undefined,
          },
          tag: <Input placeholder="请输入合同编号" />,
        },
        {
          title: '合同名称',
          dataIndex: 'contractName',
          options: {
            initialValue: searchForm.contractName || undefined,
          },
          tag: <Input placeholder="请输入合同名称" />,
        },
        {
          title: '渠道费用单号',
          dataIndex: 'channelCostNo',
          options: {
            initialValue: searchForm.channelCostNo || undefined,
          },
          tag: <Input placeholder="请输入渠道费用处理单号" />,
        },
        {
          title: '关联单据号',
          dataIndex: 'documentNumber',
          options: {
            initialValue: searchForm.documentNumber || undefined,
          },
          tag: <Input placeholder="请输入关联单据号" />,
        },
        {
          title: '关联单据类型',
          dataIndex: 'docType',
          options: {
            initialValue: searchForm.docType || undefined,
          },
          tag: <Selection.UDC code="TSK:DOC_TYPE" placeholder="请选择关联单据类型" />,
        },
        {
          title: '申请人',
          dataIndex: 'applyResId',
          options: {
            initialValue: searchForm.applyResId,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={userList}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择申请人"
            />
          ),
        },
        {
          title: '申请BU',
          dataIndex: 'applyBuId',
          options: {
            initialValue: searchForm.applyBuId,
          },
          tag: <Selection.ColumnsForBu placeholder="请选择申请BU" />,
        },
        {
          title: '申请日期',
          dataIndex: 'date',
          options: {
            initialValue: searchForm.date,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '合同编号',
          key: 'contractNo',
          dataIndex: 'contractNo',
          align: 'center',
          width: 150,
          fixed: true,
          sorter: true,
        },
        {
          title: '合同名称',
          key: 'contractName',
          dataIndex: 'contractName',
          align: 'center',
          width: 150,
          fixed: true,
        },
        {
          title: '渠道费用单号',
          key: 'channelCostNo',
          dataIndex: 'channelCostNo',
          align: 'center',
          width: 150,
          fixed: true,
        },
        {
          title: '工作类型',
          key: 'workTypeName',
          dataIndex: 'workTypeName',
          align: 'center',
          width: 150,
          render: (value, row, index) => (row.minChannelCostConId ? '' : value),
        },
        {
          title: '具体理由',
          key: 'reason',
          dataIndex: 'reason',
          width: 250,
          render: (value, row, index) => (row.minChannelCostConId ? '' : value),
        },
        {
          title: '伙伴类型',
          key: 'coopTypeName',
          dataIndex: 'coopTypeName',
          align: 'center',
          width: 150,
          render: (value, row, index) => (row.minChannelCostConId ? '' : value),
        },
        {
          title: '合作方',
          key: 'channelCostRem',
          dataIndex: 'channelCostRem',
          width: 250,
          render: (value, row, index) => (row.minChannelCostConId ? '' : value),
        },
        {
          title: '基于',
          key: 'baseName',
          dataIndex: 'baseName',
          align: 'center',
          width: 100,
          render: (value, row, index) => (row.minChannelCostConId ? '' : value),
        },
        {
          title: '比例',
          key: 'proportion',
          dataIndex: 'proportion',
          align: 'center',
          width: 100,
          render: (value, row, index) => (row.minChannelCostConId ? '' : `${value || 0}%`),
        },
        {
          title: '金额(不含税)',
          key: 'amt',
          dataIndex: 'amt',
          align: 'right',
          width: 150,
          render: value => value?.toFixed(2) || '0.00',
        },
        {
          title: '税费率',
          key: 'taxRate',
          dataIndex: 'taxRate',
          align: 'center',
          width: 100,
          render: val => `${val || 0}%`,
        },
        {
          title: '税费',
          key: 'taxCost',
          dataIndex: 'taxCost',
          align: 'right',
          width: 100,
          render: val => (!isNil(val) && val.toFixed(2)) || '0.00',
        },
        {
          title: '税费承担方',
          key: 'reimExpDesc',
          dataIndex: 'reimExpDesc',
          align: 'center',
          width: 150,
          render: (value, row, index) => (row.minChannelCostConId ? '' : value),
        },
        {
          title: '净支付额',
          key: 'netPay',
          dataIndex: 'netPay',
          align: 'right',
          width: 150,
          render: val => (!isNil(val) && val.toFixed(2)) || '0.00',
        },
        {
          title: '具体支付方式',
          key: 'salaryMethodDesc',
          dataIndex: 'salaryMethodDesc',
          align: 'center',
          width: 200,
          render: (value, row, index) => (row.minChannelCostConId ? '' : value),
        },
        {
          title: '收款节点',
          key: 'receivingNodeDesc',
          dataIndex: 'receivingNodeDesc',
          align: 'center',
          width: 200,
          render: (value, row, index) => (row.minChannelCostConId ? '' : value),
        },
        {
          title: '线下合同&沟通签署状态',
          key: 'contractStatus',
          dataIndex: 'contractStatus',
          align: 'center',
          width: 250,
          render: (value, row, index) => (row.minChannelCostConId ? '' : value),
        },
        {
          title: '联系人姓名',
          key: 'contactName',
          dataIndex: 'contactName',
          align: 'center',
          width: 200,
          render: (value, row, index) => (row.minChannelCostConId ? '' : value),
        },
        {
          title: '联系人电话',
          key: 'contactPhone',
          dataIndex: 'contactPhone',
          align: 'center',
          width: 200,
          render: (value, row, index) => (row.minChannelCostConId ? '' : value),
        },
        {
          title: '关联单据类型',
          key: 'docType',
          dataIndex: 'docType',
          align: 'center',
          width: 150,
        },
        {
          title: '关联单据号',
          key: 'documentNumber',
          dataIndex: 'documentNumber',
          align: 'center',
          width: 200,
          render: (val, row) => {
            const href = `/sale/purchaseContract/Detail?id=${
              row.documentId
            }&pageMode=purchase&from=CONTRACT`;
            return (
              <Link className="tw-link" to={href}>
                {val}
              </Link>
            );
          },
        },
        {
          title: '明细状态',
          key: 'channelCostConDStatus',
          dataIndex: 'channelCostConDStatusName',
          align: 'center',
          width: 100,
        },
      ],
      leftButtons: [],
    };

    return (
      <PageHeaderWrapper title="渠道费用列表查询">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default channelFeeList;
