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

const DOMAIN = 'userMessageInfo';

@connect(({ loading, dispatch, userMessageInfo }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  userMessageInfo,
}))
@mountToTab()
class MessageList extends PureComponent {
  componentDidMount() {
    this.fetchData({
      offset: 0,
      limit: 10,
      sortBy: 'id',
      sortDirection: 'DESC',
      isRead: 0,
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
      userMessageInfo: { dataSource, total, searchForm },
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
          title: '消息类型',
          dataIndex: 'releaseType',
          tag: <Selection.UDC code="ACC:MESSAGE_TPYE" placeholder="请选择消息类型" />,
        },
        {
          title: '消息级别',
          dataIndex: 'releaseLevel',
          tag: <Selection.UDC code="ACC:MESSAGE_LEVEL" placeholder="请选择消息级别" />,
        },
        /* {
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
        }, */
        {
          title: '发布来源',
          dataIndex: 'releaseSource',
          options: {
            initialValue: searchForm.releaseSource,
          },
          tag: <Input placeholder="请输入发布来源" />,
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
          title: '查看状态',
          dataIndex: 'isRead',
          options: {
            initialValue: searchForm.isRead || 0,
          },
          tag: (
            <Selection.Columns
              source={[{ id: 0, name: '未读' }, { id: 1, name: '已读' }]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择查看状态"
              showSearch
            />
          ),
        },
      ],
      columns: [
        {
          title: '标题',
          dataIndex: 'releaseTitle',
          key: 'releaseTitle',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/center/message/detail?id=${row.noticeId}`}>
              {value}
            </Link>
          ),
          width: '25%',
        },
        {
          title: '消息类型',
          align: 'center',
          dataIndex: 'releaseTypeName',
          key: 'releaseTypeName',
          width: '15%',
        },
        {
          title: '查看状态',
          align: 'center',
          dataIndex: 'releaseStatusName',
          key: 'releaseStatusName',
          width: '10%',
          render: (value, row, key) => (row.isRead === 1 ? '已读' : '未读'),
        },
        {
          title: '发布类型',
          align: 'center',
          dataIndex: 'releaseLevelName',
          key: 'releaseLevelName',
          width: '10%',
        },
        {
          title: '发布来源',
          align: 'center',
          dataIndex: 'releaseSource',
          key: 'releaseSource',
          width: '15%',
        },
        /* {
          title: '发布人',
          align: 'center',
          dataIndex: 'releaseUserIdName',
          key: 'releaseUserIdName',
          width: '10%',
        }, */
        {
          title: '发布时间',
          align: 'center',
          dataIndex: 'releaseTime',
          key: 'releaseTime',
          width: '15%',
        },
      ],
      leftButtons: [
        {
          key: 'shielding',
          className: 'tw-btn-primary',
          title: '屏蔽管理',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/user/center/message/personalShielding');
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
