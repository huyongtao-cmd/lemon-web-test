import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import moment from 'moment';
import { Input, DatePicker } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import { selectUsersWithBu, selectBus } from '@/services/gen/list';
import { TimePicker } from './components';

const DOMAIN = 'meetingReserveList';
const { RangePicker } = DatePicker;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];
@connect(({ loading, meetingReserveList }) => ({
  meetingReserveList,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class MeetingReserveList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  // 使用时间
  handleChangeTimeDate = (value, index) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateSearchForm`,
      payload: { time: value },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      meetingReserveList: { list, total, searchForm },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 1800 },
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
          title: '会议室名称',
          dataIndex: 'meetingName',
          options: {
            initialValue: searchForm.meetingName || undefined,
          },
          tag: <Input placeholder="请输入会议室名称" />,
        },
        {
          title: '使用日期',
          dataIndex: 'date',
          options: {
            initialValue: searchForm.date || undefined,
          },
          tag: <RangePicker />,
        },

        {
          title: '申请人',
          dataIndex: 'createUserId',
          options: {
            initialValue: searchForm.createUserId,
          },
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={particularColumns}
              placeholder="请选择申请人"
              showSearch
            />
          ),
        },
        {
          title: '申请BU',
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectBus()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择申请BU"
            />
          ),
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          options: {
            initialValue: searchForm.createTime || undefined,
          },
          tag: <RangePicker />,
        },
      ],
      columns: [
        {
          title: '会议室名称',
          dataIndex: 'meetingName',
          align: 'center',
          render: (val, row, index) => (
            <Link
              className="tw-link"
              to={`/user/meetingManage/meetingReserveList/detail?mode=view&id=${row.id}`}
            >
              {val}
            </Link>
          ),
        },
        {
          title: '参加会议人数',
          dataIndex: 'meetingPn',
          align: 'center',
        },
        {
          title: '使用开始日期',
          dataIndex: 'startDate',
          align: 'center',
        },
        {
          title: '使用开始时间',
          dataIndex: 'starTime',
          align: 'center',
        },
        {
          title: '使用结束日期',
          dataIndex: 'endDate',
        },
        {
          title: '使用结束时间',
          dataIndex: 'endTime',
          align: 'center',
        },
        {
          title: '是否需要电话会议系统',
          dataIndex: 'isNeedPhoneDesc',
          align: 'center',
        },
        {
          title: '是否需要投影仪',
          dataIndex: 'isNeedProjectorDesc',
          align: 'center',
        },
        {
          title: '是否需要视频会议系统',
          dataIndex: 'isNeedVideoDesc',
          align: 'center',
        },
        {
          title: '申请人',
          dataIndex: 'createUserName',
          align: 'center',
        },
        {
          title: '申请BU',
          dataIndex: 'buName',
          align: 'center',
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          align: 'center',
          render: (value, row) => <span>{moment(value).format('YYYY-MM-DD HH:mm:ss')}</span>,
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.insert', desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: loading || false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/user/meetingManage/meetingReserveList/detail?mode=create`);
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            router.push(`/user/meetingManage/meetingReserveList/detail?id=${id}&mode=edit`);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="会议室预定列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default MeetingReserveList;
