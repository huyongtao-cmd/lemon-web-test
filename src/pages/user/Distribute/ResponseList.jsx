import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
// import router from 'umi/router';
// import Link from 'umi/link';
import { Input } from 'antd';
import Link from 'umi/link';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatDT } from '@/utils/tempUtils/DateTime';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { mountToTab } from '@/layouts/routerControl';
import router from 'umi/router';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { TagOpt } from '@/utils/tempUtils';
import { Selection } from '@/pages/gen/field';

const DOMAIN = 'userDistResponse';
const BROADCASTING = 'BROADCASTING';
@connect(({ loading, userDistResponse }) => ({
  loading,
  userDistResponse,
}))
@mountToTab()
class DistributeResponseList extends PureComponent {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;
    const defaultSearchForm = {
      distStatus: 'BROADCASTING',
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        searchForm: defaultSearchForm,
        dataSource: [],
        total: 0,
      },
    });
    // this.fetchData({ offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' });
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
      userDistResponse: { dataSource, total, searchForm },
    } = this.props;

    const tableProps = {
      rowKey: 'tdrId',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      dataSource,
      onChange: filters => {
        this.fetchData(searchForm);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '派发编号',
          dataIndex: 'distNo',
          options: {
            initialValue: searchForm.distNo,
          },
          tag: <Input placeholder="请输入派发编号" />,
        },
        {
          title: '派发状态',
          dataIndex: 'distStatus',
          options: {
            initialValue: searchForm.distStatus,
          },
          tag: (
            <Selection.UDC code="TSK:DISTRIBUTE_STATUS" placeholder="请选择派发状态" showSearch />
          ),
        },
        {
          title: '响应状态',
          dataIndex: 'respStatus',
          options: {
            initialValue: searchForm.respStatusDesc,
          },
          tag: <Selection.UDC code="TSK:RESPOND_STATUS" placeholder="请选择派发状态" />,
        },
        {
          title: '派发对象',
          dataIndex: 'reasonName',
          options: {
            initialValue: searchForm.reasonName,
          },
          tag: <Input placeholder="请输入派发对象" />,
        },
      ],
      columns: [
        // 响应人,响应内容,响应时间,派发编号,派发对象^v,派发状态,派发时间,派发说明
        {
          title: '响应人',
          dataIndex: 'respondentResName',
          align: 'center',
          render: (value, row) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/hr/res/resPortrayal?id=${row.respondentResId}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '响应状态',
          dataIndex: 'respStatusDesc',
          align: 'center',
        },
        {
          title: '响应内容',
          dataIndex: 'respDesc',
        },
        {
          title: '响应时间',
          dataIndex: 'respTime',
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: '是否邀请',
          dataIndex: 'inviteFlag',
          align: 'center',
          render: value => (
            <TagOpt
              value={value}
              opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
              palette="red|green"
            />
          ),
        },
        {
          title: '派发编号',
          dataIndex: 'distNo',
          align: 'center',
          render: (value, row, index) => {
            const { distId } = row;
            return (
              <Link className="tw-link" to={`/user/distribute/detail?id=${distId}`}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '派发对象',
          dataIndex: 'reasonName',
          render: (value, row, index) => {
            const { distId } = row;
            return (
              <Link className="tw-link" to={`/user/distribute/detail?id=${distId}`}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '派发状态',
          dataIndex: 'distStatusDesc',
          align: 'center',
        },
        {
          title: '派发时间',
          dataIndex: 'distTime',
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: '派发说明',
          dataIndex: 'distDesc',
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.distribute`, desc: '派发' }),
          icon: 'form',
          loading: false,
          hidden: false, // TODO: 张勇强说这个按钮砍掉
          disabled: row => row.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].distStatus !== 'BROADCASTING') {
              createMessage({
                type: 'warn',
                description: `只有派发状态为广播中的可以派发！！`,
              });
              return;
            }
            const { taskId, respondentResId } = selectedRows[0];
            router.push(
              `/user/distribute/create?taskId=${taskId}&respondentResId=${respondentResId}&flag=true`
            );
          },
        },
        {
          key: 'respond',
          className: 'tw-btn-primary',
          title: '响应处理',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: row => row.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { distId } = selectedRows[0];
            router.push(`/user/distribute/create?id=${distId}&mode=update`);
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="我收到的响应">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default DistributeResponseList;
