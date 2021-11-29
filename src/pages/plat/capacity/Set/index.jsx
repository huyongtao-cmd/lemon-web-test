import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { Radio, Switch } from 'antd';
import router from 'umi/router';
import Link from 'umi/link';

import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection, UdcSelect } from '@/pages/gen/field';
import CapaSetJobTypeTrigger from '@/pages/gen/field/CapaSetJobTypeTrigger';

const DOMAIN = 'platCapaSet';
const RadioGroup = Radio.Group;

@connect(({ loading, platCapaSet }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...platCapaSet,
}))
@mountToTab()
class CapaAbility extends PureComponent {
  componentDidMount() {
    this.cleanData();
    this.fetchData();
  }

  cleanData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        searchForm: {
          capasetStatus: 'ACTIVE',
        },
      },
    });
  };

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { sortBy: 'capasetNo', sortDirection: 'ASC', capasetStatus: 'ACTIVE', ...params },
    });
  };

  handleChangeJobType1 = (value, target) => {
    const { dispatch, form, searchForm } = this.props;
    target &&
      dispatch({
        type: `${DOMAIN}/updateJobType2`,
        payload: {
          parentVal: value,
          jobType1Name: target.props.title,
        },
      }).then(() => {
        searchForm.jobType2 = null;
      });
  };

  handleChangeJobType2 = (value, target) => {
    const { dispatch, searchForm } = this.props;
    target &&
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          searchForm: { ...searchForm, jobType2Name: target.props.title },
        },
      });
  };

  // 分类一 -> 分类二
  handleChangeJobType = (value, index) => {
    if (index === 0) {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { jobType2: [] },
      });
      dispatch({
        type: `${DOMAIN}/jobTypeChange`,
        payload: value[0],
      });
    }
  };

  render() {
    const { dispatch, loading, dataSource, total, searchForm, jobType2Data } = this.props;

    const tableProps = {
      rowKey: 'id',
      sortBy: 'capasetNo',
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
          title: '编号',
          dataIndex: 'capasetNo',
          options: {
            initialValue: searchForm.capasetNo,
          },
        },
        {
          title: '工种',
          dataIndex: 'jobType',
          options: {
            initialValue: searchForm.jobType,
          },
          tag: (
            <CapaSetJobTypeTrigger jobType2={jobType2Data} onChange={this.handleChangeJobType} />
          ),
        },
        {
          title: '状态',
          dataIndex: 'capasetStatus',
          options: {
            initialValue: searchForm.capasetStatus || '',
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
          title: '编号',
          dataIndex: 'capasetNo',
          sorter: true,
          align: 'center',
        },
        {
          title: '名称',
          dataIndex: 'jobTypeName',
          align: 'center',
          render: (value, rowData) => (
            <Link to={`/hr/capacity/set_det?id=${rowData.id}`}>
              {[rowData.jobType1Name, rowData.jobType2Name].join('-')}
            </Link>
          ),
        },
        {
          title: '工种',
          dataIndex: 'jobType1Name',
          align: 'center',
        },
        {
          title: '工种子类',
          dataIndex: 'jobType2Name',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'capasetStatus',
          align: 'center',
          width: 100,
          render: (val, row, index) => (
            <Switch
              checkedChildren="有效"
              unCheckedChildren="无效"
              checked={val === 'ACTIVE'}
              onChange={(bool, e) => {
                const capasetStatus = bool ? 'ACTIVE' : 'INACTIVE';
                dispatch({
                  type: `${DOMAIN}/queryLevelList`,
                  payload: { id: row.id, capasetStatus },
                }).then(res => {
                  dataSource[index].capasetStatus = capasetStatus;
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
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          icon: 'plus-circle',
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push(`/hr/capacity/set_create`),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          icon: 'form',
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push(`/hr/capacity/set_edit?id=${selectedRowKeys}`),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="复合能力主数据">
        <DataTable {...tableProps} />
        {/* -- modal -- */}
      </PageHeaderWrapper>
    );
  }
}

export default CapaAbility;
