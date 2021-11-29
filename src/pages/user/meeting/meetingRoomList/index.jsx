import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import moment from 'moment';
import { Input, DatePicker, Select } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { formatMessage } from 'umi/locale';
import { selectIamUsers } from '@/services/gen/list';
import { Selection } from '@/pages/gen/field';

const DOMAIN = 'meetingRoomList';
const { RangePicker } = DatePicker;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
@connect(({ loading, meetingRoomList }) => ({
  meetingRoomList,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class MeetingRoomList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/getMeetingRoomPlace` });
    dispatch({ type: `${DOMAIN}/query` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      loading,
      dispatch,
      meetingRoomList: { list = [], total = 0, searchForm, meetingRoomPlace },
    } = this.props;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: {},
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
          title: '会议室地点',
          dataIndex: 'meetingPlace',
          options: {
            initialValue: searchForm.meetingPlace || undefined,
          },
          tag: (
            <Select className="x-fill-100" placeholder="请选择会议室地点" allowClear>
              {meetingRoomPlace.length > 0 &&
                meetingRoomPlace.map(item => (
                  <Select.Option key={item} value={item}>
                    {item}
                  </Select.Option>
                ))}
            </Select>
          ),
        },
        {
          title: '会议室状态',
          dataIndex: 'meetingRoomStatus',
          options: {
            initialValue: searchForm.meetingRoomStatus,
          },
          tag: <Selection.UDC code="RES:MEETING_ROOM_STATUS" placeholder="请选择状态" />,
        },
        {
          title: '创建人',
          dataIndex: 'createUserId',
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
        {
          title: '创建时间',
          dataIndex: 'createTime',
          options: {
            initialValue: searchForm.createTime,
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
              to={`/user/meetingManage/meetingRoomList/detail?mode=view&id=${row.id}`}
            >
              {val}
            </Link>
          ),
        },
        {
          title: '会议室地点',
          dataIndex: 'meetingPlace',
          align: 'center',
        },
        {
          title: '会议室状态',
          dataIndex: 'meetingRoomStatusDesc',
          align: 'center',
        },
        {
          title: '创建人',
          align: 'center',
          dataIndex: 'createUserName',
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
            router.push(`/user/meetingManage/meetingRoomList/detail?mode=create`);
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
            router.push(`/user/meetingManage/meetingRoomList/detail?mode=edit&id=${id}`);
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
      <PageHeaderWrapper title="会议室列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default MeetingRoomList;
