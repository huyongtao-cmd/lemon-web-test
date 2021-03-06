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
          title: '????????????',
          dataIndex: 'distNo',
          options: {
            initialValue: searchForm.distNo,
          },
          tag: <Input placeholder="?????????????????????" />,
        },
        {
          title: '????????????',
          dataIndex: 'distStatus',
          options: {
            initialValue: searchForm.distStatus,
          },
          tag: (
            <Selection.UDC code="TSK:DISTRIBUTE_STATUS" placeholder="?????????????????????" showSearch />
          ),
        },
        {
          title: '????????????',
          dataIndex: 'respStatus',
          options: {
            initialValue: searchForm.respStatusDesc,
          },
          tag: <Selection.UDC code="TSK:RESPOND_STATUS" placeholder="?????????????????????" />,
        },
        {
          title: '????????????',
          dataIndex: 'reasonName',
          options: {
            initialValue: searchForm.reasonName,
          },
          tag: <Input placeholder="?????????????????????" />,
        },
      ],
      columns: [
        // ?????????,????????????,????????????,????????????,????????????^v,????????????,????????????,????????????
        {
          title: '?????????',
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
          title: '????????????',
          dataIndex: 'respStatusDesc',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'respDesc',
        },
        {
          title: '????????????',
          dataIndex: 'respTime',
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: '????????????',
          dataIndex: 'inviteFlag',
          align: 'center',
          render: value => (
            <TagOpt
              value={value}
              opts={[{ code: 0, name: '???' }, { code: 1, name: '???' }]}
              palette="red|green"
            />
          ),
        },
        {
          title: '????????????',
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
          title: '????????????',
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
          title: '????????????',
          dataIndex: 'distStatusDesc',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'distTime',
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: '????????????',
          dataIndex: 'distDesc',
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.distribute`, desc: '??????' }),
          icon: 'form',
          loading: false,
          hidden: false, // TODO: ??????????????????????????????
          disabled: row => row.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].distStatus !== 'BROADCASTING') {
              createMessage({
                type: 'warn',
                description: `???????????????????????????????????????????????????`,
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
          title: '????????????',
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
      <PageHeaderWrapper title="??????????????????">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default DistributeResponseList;
