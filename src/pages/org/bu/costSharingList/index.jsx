import React from 'react';
import { connect } from 'dva';
import { Checkbox, DatePicker, Input, Modal, Form, Select } from 'antd';
import { formatMessage } from 'umi/locale';
import { isEmpty, all, equals, isNil } from 'ramda';
import router from 'umi/router';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import DataTable from '@/components/common/DataTable';
import { selectUsersWithBu } from '@/services/gen/list';
import { mountToTab } from '@/layouts/routerControl';
import { Selection } from '@/pages/gen/field';
import { formatDT } from '@/utils/tempUtils/DateTime';

const DOMAIN = 'costSharingList';
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];
// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------
// test111
/**
 * 费用报销
 */
@connect(({ loading, costSharingList }) => ({
  loading,
  ...costSharingList, // 代表与该组件相关redux的model
}))
@Form.create()
@mountToTab()
class CostSharingList extends React.PureComponent {
  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
  }

  // --------------- 剩下的私有函数写在这里 -----------------
  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ...params },
    });
  };

  getTableProps = () => {
    const { dispatch, loading, searchForm, list, total } = this.props;
    return {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      dataSource: list,
      searchForm,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '报销单号',
          dataIndex: 'reimNo',
          options: {
            initialValue: searchForm.reimNo,
          },
          tag: <Input placeholder="请输入报销单号" />,
        },
        {
          title: '申请人',
          dataIndex: 'applicantResId',
          options: {
            initialValue: searchForm.applicantResId,
          },
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              placeholder="请选择申请人"
              showSearch
            />
          ),
        },
        {
          title: '分摊单号',
          dataIndex: 'sharingNo',
          options: {
            initialValue: searchForm.sharingNo,
          },
          tag: <Input placeholder="请输入分摊单号" />,
        },
        {
          title: '状态',
          dataIndex: 'apprStatus',
          options: {
            initialValue: searchForm.apprStatus,
          },
          tag: <Selection.UDC code="COM:APPR_STATUS" placeholder="请选择审批状态" />,
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          options: {
            initialValue: [searchForm.applyDateStart, searchForm.applyDateEnd],
          },
          tag: (
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} className="x-fill-100" />
          ),
        },
      ],
      columns: [
        {
          title: '报销单号',
          dataIndex: 'reimNo',
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/plat/expense/trip/view?id=${row.reimId}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '申请人',
          dataIndex: 'applicantResName',
          align: 'center',
          width: '200',
        },
        {
          title: '分摊单号',
          dataIndex: 'sharingNo',
          align: 'center',
          render: (value, row, key) => (
            <Link
              className="tw-link"
              to={`/org/bu/buReimbursementList/create?id=${row.id}&mode=view`}
            >
              {value}
            </Link>
          ),
        },
        {
          title: '状态',
          dataIndex: 'apprStatusName',
          align: 'center',
        },
        // {
        //   title: '创建时间',
        //   dataIndex: 'applicantTime',
        //   align: 'right',
        // },
        {
          title: '申请日期',
          dataIndex: 'applicantTime',
          align: 'center',
          render: value => formatDT(value, 'YYYY-MM-DD'),
        },
        {
          title: '报销单金额',
          dataIndex: 'reimAmt',
          align: 'right',
          render: value => (value ? value.toFixed(2) : null),
        },
      ],
      leftButtons: [],
    };
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    return (
      <PageHeaderWrapper title="BU报销单分摊列表">
        <DataTable {...this.getTableProps()} />
      </PageHeaderWrapper>
    );
  }
}

export default CostSharingList;
