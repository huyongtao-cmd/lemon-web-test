import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { mountToTab } from '@/layouts/routerControl';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const DOMAIN = 'messageConfigList';

@connect(({ loading, dispatch, messageConfigList }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  messageConfigList,
}))
@mountToTab()
class MessageConfigList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
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
      messageConfigList: { list, total, searchForm },
    } = this.props;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      dataSource: list,
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
          dataIndex: 'configurationTitle',
          options: {
            initialValue: searchForm.configurationTitle,
          },
          tag: <Input placeholder="请输入标题" />,
        },
        {
          title: '编码',
          dataIndex: 'configurationNo',
          options: {
            initialValue: searchForm.configurationNo,
          },
          tag: <Input placeholder="请输入编码" />,
        },
        {
          title: '发布来源',
          dataIndex: 'releaseSource',
          options: {
            initialValue: searchForm.releaseSource,
          },
          tag: <Input placeholder="请输入发布来源" />,
        },
      ],
      columns: [
        {
          title: '标题',
          align: 'center',
          dataIndex: 'configurationTitle',
          key: 'configurationTitle',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/sys/system/MessageConfig/detail?id=${row.id}`}>
              {value}
            </Link>
          ),
          width: '25%',
        },
        {
          title: '编码',
          align: 'center',
          dataIndex: 'configurationNo',
          key: 'releaseTypeName',
          width: '15%',
        },
        {
          title: '发布来源',
          align: 'center',
          dataIndex: 'releaseSource',
          key: 'releaseSource',
          width: '10%',
        },
        {
          title: '通知方式',
          align: 'center',
          dataIndex: 'noticeWayName',
          key: 'noticeWayName',
          width: '10%',
        },
        {
          title: '通知范围',
          align: 'center',
          dataIndex: 'noticeScopeName',
          key: 'noticeScopeName',
          width: '15%',
        },
        {
          title: '触发方式',
          align: 'center',
          dataIndex: 'triggerModeName',
          key: 'triggerModeName',
          width: '10%',
        },
        {
          title: '是否有效',
          align: 'center',
          dataIndex: 'enabledFlag',
          key: 'enabledFlag',
          width: '15%',
          render: (value, rowData) => (value === 1 ? '是' : '否'),
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
          disabled: loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/sys/system/MessageConfig/edit?${from}`);
          },
        },
        {
          key: 'shieldingManagement',
          className: 'tw-btn-primary',
          title: '屏蔽管理',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/sys/system/MessageConfig/shielding');
          },
        },
        {
          key: 'labelManagement',
          className: 'tw-btn-primary',
          title: '标签管理',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/sys/system/MessageConfig/tagManage');
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
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/sys/system/MessageConfig/edit?id=${id}&${from}`);
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
      <PageHeaderWrapper title="消息通知列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default MessageConfigList;
