import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { Radio, Switch } from 'antd';

import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection } from '@/pages/gen/field';
import TypeTrigger from '@/pages/gen/field/TypeTrigger';

const DOMAIN = 'platCapa';
const RadioGroup = Radio.Group;

@connect(({ loading, platCapa }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...platCapa,
}))
@mountToTab()
class CapaMain extends PureComponent {
  componentDidMount() {
    this.cleanData();
    this.fetchData({ sortBy: 'capaNo', sortDirection: 'ASC', capaStatus: 'ACTIVE' });
  }

  cleanData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        searchForm: {
          capaStatus: 'ACTIVE',
        },
      },
    });
  };

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  handleChangeType = (value, index) => {
    if (index === 0) {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { type2: [] },
      });
      dispatch({
        type: `${DOMAIN}/typeChange`,
        payload: value[0],
      });
    }
  };

  render() {
    const { dispatch, loading, searchForm, dataSource, total, type2 } = this.props;

    const tableProps = {
      rowKey: 'id',
      sortBy: 'capaNo',
      sortDirection: 'ASC',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: {
            ...searchForm,
            ...changedValues,
          },
        });
      },
      searchBarForm: [
        {
          title: formatMessage({ id: `plat.capa.capa.noOrName` }),
          dataIndex: 'capaNoName',
          options: {
            initialValue: searchForm.capaNoName,
          },
        },
        {
          title: formatMessage({ id: `plat.capa.capa.capaType` }),
          dataIndex: 'type',
          options: {
            initialValue: searchForm.capaType1,
          },
          tag: (
            <TypeTrigger type2={type2} code="RES:CAPACITY_TYPE1" onChange={this.handleChangeType} />
          ),
        },
        {
          title: '状态',
          dataIndex: 'capaStatus',
          options: {
            initialValue: searchForm.capaStatus || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="ACTIVE">有效</Radio>
              <Radio value="INACTIVE">无效</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
        },
      ],
      columns: [
        {
          title: formatMessage({ id: `plat.capa.capa.capaNo` }),
          dataIndex: 'capaNo',
          className: 'text-center',
          sorter: true,
        },
        {
          title: formatMessage({ id: 'plat.capa.capa.capaName', desc: '' }),
          dataIndex: 'capaName',
          sorter: true,
          render: (value, rowData, key) => (
            <Link to={`/hr/capacity/capa_det?id=${rowData.id}`}>{value}</Link>
          ),
        },
        {
          title: formatMessage({ id: 'plat.capa.capa.capaType1', desc: '分类一' }),
          dataIndex: 'capaType1Name',
          className: 'text-center',
        },
        {
          title: formatMessage({ id: 'plat.capa.capa.capaType2', desc: '分类二' }),
          dataIndex: 'capaType2Name',
          className: 'text-center',
        },
        {
          title: '状态',
          dataIndex: 'capaStatus',
          align: 'center',
          width: 100,
          render: (val, row, index) => (
            <Switch
              checkedChildren="有效"
              unCheckedChildren="无效"
              checked={val === 'ACTIVE'}
              onChange={(bool, e) => {
                const capaStatus = bool ? 'ACTIVE' : 'INACTIVE';
                dispatch({
                  type: `${DOMAIN}/queryLevelList`,
                  payload: { id: row.id, capaStatus },
                }).then(res => {
                  dataSource[index].capaStatus = capaStatus;
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: dataSource,
                  });
                });
              }}
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.insert', desc: '新增' }),
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push('/hr/capacity/capa_create'),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.update', desc: '修改' }),
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push(`/hr/capacity/capa_edit?id=${selectedRowKeys}`),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="能力主数据">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default CapaMain;
