import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Input, Tooltip } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { selectBus } from '@/services/org/bu/bu';

const DOMAIN = 'findCoop';

@connect(({ loading, findCoop }) => ({
  findCoop,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class FindCoopList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;

    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    !(_refresh === '0') &&
      dispatch({
        type: `${DOMAIN}/updateSearchForm`,
      });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      loading,
      dispatch,
      findCoop: { list, total, searchForm },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 1280 },
      loading,
      total,
      dataSource: list,
      enableSelection: false,
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
          title: '合作伙伴关键词',
          dataIndex: 'coopKey',
          options: {
            initialValue: searchForm.coopKey || '',
          },
          tag: <Input placeholder="请输入合作伙伴关键词" />,
        },
        {
          title: '合作伙伴名称',
          dataIndex: 'abName',
          options: {
            initialValue: searchForm.abName || '',
          },
          tag: <Input placeholder="请输入合作伙伴名称" />,
        },
        {
          title: '合作伙伴类型',
          dataIndex: 'coopType',
          options: {
            initialValue: searchForm.coopType || undefined,
          },
          tag: <Selection.UDC code="TSK:COOP_TYPE" placeholder="请选择合作伙伴类型" />,
        },
        {
          title: '合作状态',
          dataIndex: 'coopStatus',
          options: {
            initialValue: searchForm.coopStatus || undefined,
          },
          tag: <Selection.UDC code="TSK:COOP_STATUS" placeholder="请选择合作状态" />,
        },
        {
          title: '合作区域',
          dataIndex: 'coopArea',
          options: {
            initialValue: searchForm.coopArea || undefined,
          },
          tag: <Input placeholder="请输入合作区域" />,
        },
        {
          title: '我司负责人BU',
          dataIndex: 'pdmBuId',
          options: {
            initialValue: searchForm.pdmBuId || undefined,
          },
          tag: <Selection source={() => selectBus()} placeholder="请选择我司负责人BU" />,
        },
      ],
      columns: [
        {
          title: '合作伙伴名称',
          dataIndex: 'abName',
          width: 250,
          render: (value, row) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/sale/productHouse/findCoop/Detail?id=${row.id}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '合作伙伴编码',
          dataIndex: 'abNo',
          align: 'center',
          width: 100,
        },
        {
          title: '合作伙伴类型',
          dataIndex: 'coopTypeDesc',
          align: 'center',
          width: 100,
        },
        {
          title: '合作状态',
          dataIndex: 'coopStatusDesc',
          align: 'center',
          width: 100,
        },
        {
          title: '合作区域',
          dataIndex: 'coopArea',
          align: 'center',
          width: 100,
        },
        {
          title: '合作伙伴关键词',
          dataIndex: 'coopKey',
          align: 'center',
          width: 150,
          render: (value, row, index) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
        {
          title: '合作伙伴发展经理',
          dataIndex: 'pdmName',
          align: 'center',
          width: 100,
        },
        {
          title: '我司负责人BU',
          dataIndex: 'pdmBuName',
          align: 'center',
          width: 200,
        },
        {
          title: '我司负责人电话',
          dataIndex: 'pdmTel',
          align: 'center',
          width: 150,
        },
        {
          title: '我司负责人邮箱',
          dataIndex: 'pdmEmail',
          align: 'center',
          width: 200,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="合作伙伴">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default FindCoopList;
