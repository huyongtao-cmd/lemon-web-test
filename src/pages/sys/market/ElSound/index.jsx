import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from '@/components/production/basic/Link';
import { Switch, Input, Select, Radio, InputNumber } from 'antd';
import { isNil, isEmpty } from 'ramda';
import { injectUdc, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { formatMessage } from 'umi/locale';

const RadioGroup = Radio.Group;
const DOMAIN = 'sysMarketElSound';

@connect(({ loading, sysMarketElSound }) => ({
  sysMarketElSound,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class BannerMgmt extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({
      sortBy: 'id',
      sortDirection: 'DESC',
      offset: 0,
      limit: 10,
      // title: '',
      // category: '',
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const { loading, sysMarketElSound, dispatch } = this.props;
    const { list, total, searchForm } = sysMarketElSound;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: '100%' },
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
          title: formatMessage({ id: 'sys.market.elSound.artTitle', desc: '新闻标题' }),
          dataIndex: 'artTitle',
          options: {
            initialValue: searchForm.artTitle,
          },
          tag: <Input placeholder="请输入名称或简称" />,
        },
        {
          title: formatMessage({ id: 'sys.market.elSound.artAuthor', desc: '作者' }),
          dataIndex: 'artAuthor',
          options: {
            initialValue: searchForm.artAuthor,
          },
          tag: <Input placeholder="请输入作者名称" />,
        },
        {
          title: formatMessage({ id: 'sys.market.banner.category', desc: '分类' }),
          dataIndex: 'category',
          options: {
            initialValue: searchForm.category,
          },
          tag: <Selection.UDC code="OPE:BANNER_CATEGORY" placeholder="请选择分类" />,
        },
        {
          title: formatMessage({ id: 'sys.market.elSound.artOrtop', desc: '是否置顶' }),
          dataIndex: 'artOrtop',
          options: {
            initialValue: searchForm.artOrtop,
          },
          tag: (
            <RadioGroup initialValue={searchForm.artOrtop || ''}>
              <Radio value={1} defaultChecked="true">
                是
              </Radio>
              <Radio value={0}>否</Radio>
            </RadioGroup>
          ),
        },
      ],
      columns: [
        {
          title: formatMessage({ id: 'sys.market.elSound.artTitle', desc: '新闻标题' }),
          dataIndex: 'artTitle',
          render: (value, row, index) => (
            <Link twUri={`/plat/contentMgmt/elSound/Detail?id=${row.id}`}>{value}</Link>
          ),
        },
        {
          title: formatMessage({ id: 'sys.market.elSound.artSource', desc: '来源' }),
          dataIndex: 'artSource',
          className: 'text-center',
        },
        {
          title: formatMessage({ id: 'sys.market.elSound.artAuthor', desc: '作者' }),
          dataIndex: 'artAuthor',
        },
        {
          title: formatMessage({ id: 'sys.market.elSound.createTime', desc: '创建时间' }),
          dataIndex: 'createTime',
          className: 'text-center',
        },
        {
          title: formatMessage({ id: 'sys.market.elSound.updateTime', desc: '更新时间' }),
          dataIndex: 'modifyTime',
        },
        {
          title: formatMessage({ id: 'sys.market.elSound.artSort', desc: '排序' }),
          dataIndex: 'artSort',
        },
        {
          title: formatMessage({ id: 'sys.market.elSound.artOrtop', desc: '是否置顶' }),
          dataIndex: 'artOrtop',
          render: (value, record, index) => {
            if (value === 1) return '是';
            if (value === 0) return '否';
            return value;
          },
        },
        {
          title: formatMessage({ id: 'sys.market.elSound.artTypeName', desc: '类型' }),
          dataIndex: 'artTypeName',
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
            router.push('/plat/contentMgmt/elSound/create');
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/plat/contentMgmt/elSound/Edit?id=${selectedRows[0].id}`);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: selectedRowKeys,
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="BANNER管理">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default BannerMgmt;
