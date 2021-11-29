import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Input } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import router from 'umi/router';
import Link from 'umi/link';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { Selection, DatePicker } from '@/pages/gen/field';
import { selectIamUsers } from '@/services/gen/list';

const DOMAIN = 'messageInfo';

@connect(({ loading, dispatch, messageInfo }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  messageInfo,
}))
@mountToTab()
class MessageList extends PureComponent {
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
      payload: params,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      messageInfo: { dataSource, total, searchForm },
    } = this.props;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'messageId',
      sortBy: 'messageId',
      sortDirection: 'DESC',
      dataSource,
      total,
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
          title: '标题',
          dataIndex: 'releaseTitle',
          options: {
            initialValue: searchForm.releaseTitle,
          },
          tag: <Input placeholder="请输入标题" />,
        },
        {
          title: '内容类型',
          dataIndex: 'releaseType',
          tag: <Selection.UDC code="ACC:MESSAGE_TPYE" placeholder="请选择内容类型" />,
        },
        {
          title: '消息级别',
          dataIndex: 'releaseLevel',
          tag: <Selection.UDC code="ACC:MESSAGE_LEVEL" placeholder="请选择消息级别" />,
        },
        {
          title: '发布者',
          dataIndex: 'releaseUserId',
          options: {
            initialValue: searchForm.releaseUserId || undefined,
          },
          tag: (
            <Selection.Columns
              source={selectIamUsers}
              columns={[
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择发布者"
              showSearch
            />
          ),
        },
        {
          title: '发布时间',
          dataIndex: 'releaseTime',
          options: {
            initialValue: searchForm.releaseTime,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },

        {
          title: '发布状态',
          dataIndex: 'releaseStatus',
          options: {
            initialValue: searchForm.releaseStatus,
          },
          tag: <Selection.UDC code="ACC:RELEASE_STATUS" placeholder="请选择查看状态" />,
        },
      ],
      columns: [
        {
          title: '标题',
          dataIndex: 'releaseTitle',
          key: 'releaseTitle',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/plat/messageMgmt/message/detail?id=${row.messageId}`}>
              {value}
            </Link>
          ),
          width: '25%',
        },
        {
          title: '内容类型',
          align: 'center',
          dataIndex: 'releaseTypeName',
          key: 'releaseTypeName',
        },
        {
          title: '发布来源',
          align: 'center',
          dataIndex: 'releaseSource',
          key: 'releaseSource',
        },
        {
          title: '通知范围',
          align: 'center',
          dataIndex: 'timingNoticeScopeName',
          key: 'timingNoticeScopeName',
        },
        {
          title: '消息级别',
          align: 'center',
          dataIndex: 'releaseLevelName',
          key: 'releaseLevelName',
        },
        {
          title: '发布时间',
          align: 'center',
          dataIndex: 'releaseTime',
          key: 'releaseTime',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          title: '新增',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/plat/messageMgmt/message/edit`);
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '修改',
          icon: 'edit',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => {
            const published = selectedRowKeys.find(value => value.releaseStatus === 'PUBLISHED');
            return selectedRowKeys.length !== 1 || published;
          },
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { messageId } = selectedRows[0];
            router.push(`/plat/messageMgmt/message/edit?id=${messageId}`);
          },
        },
        {
          key: 'delete',
          className: 'tw-btn-error',
          title: '删除',
          icon: 'delete',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => {
            const published = selectedRowKeys.find(value => value.releaseStatus === 'PUBLISHED');
            return selectedRowKeys.length === 0 || published;
          },
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const deleteArr = selectedRows.map(item => item.messageId);
            dispatch({
              type: `${DOMAIN}/del`,
              payload: deleteArr.join(','),
            });
          },
        },
        {
          key: 'recall',
          className: 'tw-btn-error',
          title: '撤回',
          icon: 'undo',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => {
            const published = selectedRowKeys.find(value => value.releaseStatus !== 'PUBLISHED');
            return selectedRowKeys.length === 0 || published;
          },
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const deleteArr = selectedRows.map(item => item.messageId);
            const { messageId } = selectedRows[0];
            dispatch({
              type: `${DOMAIN}/recall`,
              payload: deleteArr.join(','),
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="消息通知列表">
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="消息通知列表" />}
        >
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default MessageList;
