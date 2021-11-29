import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Input, Radio, Switch } from 'antd';
import { formatMessage } from 'umi/locale';
import { stringify } from 'qs';
import { mountToTab, markAsNoTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { Selection, DatePicker } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';

const RadioGroup = Radio.Group;

const DOMAIN = 'listTopMgmt';

@connect(({ loading, listTopMgmt }) => ({
  listTopMgmt,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class ListTopMgmtList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    // !(_refresh === '0') &&
    //   this.fetchData({
    //     offset: 0,
    //     limit: 10,
    //     sortBy: 'id',
    //     sortDirection: 'DESC',
    //   });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      loading,
      dispatch,
      listTopMgmt: { list, total, searchForm },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading,
      total,
      dataSource: list,
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
          title: '榜单名称',
          dataIndex: 'topListName',
          options: {
            initialValue: searchForm.topListName,
          },
          tag: <Input placeholder="请输入榜单名称" />,
        },
        {
          title: '数据来源',
          dataIndex: 'dataSource',
          options: {
            initialValue: searchForm.dataSource,
          },
          tag: <Selection.UDC code="COM:TOP_LIST_DATA_SOURCE" placeholder="请选择数据来源" />,
        },
        {
          title: '榜单形式',
          dataIndex: 'layoutType',
          options: {
            initialValue: searchForm.layoutType,
          },
          tag: <Selection.UDC code="COM:TOP_LIST_LAYOUT_TYPE" placeholder="请选择榜单形式" />,
        },
        {
          title: '是否显示',
          dataIndex: 'showFlag',
          options: {
            initialValue: searchForm.showFlag || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="YES">是</Radio>
              <Radio value="NO">否</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
        },
        {
          title: '公示截止日',
          dataIndex: 'publieEndDate',
          options: {
            initialValue: searchForm.publieEndDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '更新时间',
          dataIndex: 'date',
          options: {
            initialValue: searchForm.date,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '榜单名称',
          dataIndex: 'topListName',
          align: 'center',
          render: (value, row) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/sys/system/ListTopMgmt/view?id=${row.id}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '数据来源',
          dataIndex: 'dataSourceDesc',
          align: 'center',
        },
        {
          title: '榜单形式',
          dataIndex: 'layoutTypeDesc',
          align: 'center',
        },
        {
          title: '是否显示',
          dataIndex: 'showFlag',
          align: 'center',
          render: (val, row, index) => (
            <Switch
              checkedChildren="显示"
              unCheckedChildren="不显示"
              checked={val === 'YES'}
              onChange={(bool, e) => {
                const parmas = bool ? 'YES' : 'NO';
                dispatch({
                  type: `${DOMAIN}/changeShowFlag`,
                  payload: {
                    id: row.id,
                    showFlag: parmas,
                  },
                });
              }}
            />
          ),
        },
        {
          title: '显示顺序',
          dataIndex: 'showSeq',
          align: 'center',
        },
        {
          title: '公示截止日',
          dataIndex: 'publieEndDate',
          align: 'center',
        },
        {
          title: '更新时间',
          dataIndex: 'dataUpdTime',
          align: 'center',
        },
        {
          title: '本次统计期间',
          dataIndex: 'date',
          align: 'center',
          render: (value, row, index) =>
            `${row.startDate || ''} ${row.startDate ? '~' : ''} ${row.endDate || ''}`,
        },
      ],
      leftButtons: [
        {
          key: 'create',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const urls = getUrl();
            const from = stringify({ from: markAsNoTab(urls) });
            router.push(`/sys/system/ListTopMgmt/edit?${from}`);
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: markAsNoTab(urls) });
            router.push(`/sys/system/ListTopMgmt/edit?id=${id}&${from}`);
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
      <PageHeaderWrapper title="榜单列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default ListTopMgmtList;
