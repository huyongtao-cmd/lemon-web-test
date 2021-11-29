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

const DOMAIN = 'timingMessageInfo';

@connect(({ loading, dispatch, timingMessageInfo }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  timingMessageInfo,
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
      timingMessageInfo: { dataSource, total, searchForm },
    } = this.props;
    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
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
          title: '消息类型',
          dataIndex: 'releaseType',
          options: {
            initialValue: searchForm.releaseType,
          },
          tag: <Selection.UDC code="ACC:MESSAGE_TPYE" placeholder="请选择消息类型" />,
        },
        {
          title: '通知范围',
          dataIndex: 'timingNoticeScope',
          options: {
            initialValue: searchForm.timingNoticeScope,
          },
          tag: <Selection.UDC code="ACC:MESSAGE_TIMING_SCOPE" placeholder="请选择通知范围" />,
        },
        {
          title: '启用',
          dataIndex: 'timingUsable',
          options: {
            initialValue: searchForm.timingUsable,
          },
          tag: <Selection.UDC code="COM:YESNO" placeholder="请选择通知范围" />,
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          options: {
            initialValue: searchForm.createTime,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '标题',
          dataIndex: 'releaseTitle',
          key: 'releaseTitle',
          render: (value, row, key) => (
            <Link
              className="tw-link"
              to={`/plat/messageMgmt/timingMessage/detail?id=${row.messageId}`}
            >
              {value}
            </Link>
          ),
          width: '22%',
        },
        {
          title: '消息类型',
          align: 'center',
          dataIndex: 'releaseTypeName',
          key: 'releaseTypeName',
          width: '15%',
        },
        {
          title: '消息级别',
          align: 'center',
          dataIndex: 'releaseLevelName',
          key: 'releaseLevelName',
          width: '10%',
        },
        {
          title: '启用',
          align: 'center',
          dataIndex: 'timingUsableName',
          key: 'timingUsableName',
          width: '5%',
        },
        {
          title: '通知范围',
          align: 'center',
          dataIndex: 'timingNoticeScopeName',
          key: 'timingNoticeScopeName',
          width: '10%',
        },
        {
          title: '定时发送码',
          align: 'center',
          dataIndex: 'timingCode',
          key: 'timingCode',
          width: '15%',
        },
        {
          title: '创建人',
          align: 'center',
          dataIndex: 'createUserIdName',
          key: 'createUserIdName',
          width: '8%',
        },
        {
          title: '创建时间',
          align: 'center',
          dataIndex: 'createTime',
          key: 'createTime',
          width: '15%',
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
            router.push(`/plat/messageMgmt/timingMessage/edit`);
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '修改',
          icon: 'edit',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { messageId } = selectedRows[0];
            router.push(`/plat/messageMgmt/timingMessage/edit?id=${messageId}`);
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
            const timingUsable = selectedRowKeys.find(value => value.timingUsable === 'YES');
            return selectedRowKeys.length === 0 || timingUsable;
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
      ],
    };

    return (
      <PageHeaderWrapper title="定时消息模版列表">
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="定时消息模版列表" />}
        >
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default MessageList;
