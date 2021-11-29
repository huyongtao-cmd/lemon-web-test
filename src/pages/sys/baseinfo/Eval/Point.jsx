import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Switch } from 'antd';
import { mountToTab } from '@/layouts/routerControl';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import AddMainModal from './modal/AddPoint';

const DOMAIN = 'sysEvalPoint';

@connect(({ loading, sysEvalPoint, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
  sysEvalPoint,
}))
@mountToTab()
class EvalPoint extends PureComponent {
  state = {
    visible: false,
    modalTitle: 1,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/updateState`, payload: { searchForm: {} } });
    this.fetchData({
      limit: 10,
      offset: 0,
      sortBy: 'id',
      sortDirection: 'DESC',
    });
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  toggle = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      sysEvalPoint: { dataSource, total, searchForm },
    } = this.props;
    const { visible, modalTitle } = this.state;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showColumn: false,
      showExport: false,
      dataSource,
      total,
      searchForm,
      rowSelection: {
        type: 'radio',
      },
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
          title: '评价点',
          dataIndex: 'evalPoint',
          options: {
            initialValue: searchForm.evalPoint,
          },
          tag: <Input placeholder="评价点" />,
        },
        {
          title: '状态',
          dataIndex: 'evalStatus',
          options: {
            initialValue: searchForm.evalStatus,
          },
          tag: <Selection.UDC code="COM.STATUS1" placeholder="状态" />,
        },
      ],
      leftButtons: [
        {
          key: 'add',
          title: '新增',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({ modalTitle: 1 });
            this.toggle();
          },
        },
        {
          key: 'edit',
          title: '修改',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({ modalTitle: 0 });
            dispatch({
              type: `${DOMAIN}/infoById`,
              payload: selectedRowKeys[0],
            }).then(() => this.toggle());
          },
        },
      ],
      columns: [
        {
          title: '评价点',
          dataIndex: 'evalPoint',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'evalStatus',
          align: 'center',
          render: (val, row) => (
            <Switch
              checkedChildren="有效"
              unCheckedChildren="无效"
              checked={val === 'ACTIVE'}
              onChange={bool => {
                dispatch({
                  type: `${DOMAIN}/status`,
                  payload: {
                    id: row.id,
                    status: bool ? 'ACTIVE' : 'INACTIVE',
                  },
                });
              }}
            />
          ),
        },
        {
          title: '分数下限',
          dataIndex: 'scoreFrom',
          align: 'center',
        },
        {
          title: '分数上限',
          dataIndex: 'scoreTo',
          align: 'center',
        },
        {
          title: '默认分数',
          dataIndex: 'defaultScore',
          align: 'center',
        },
        {
          title: '评分标准',
          dataIndex: 'standardDesc',
          width: '40%',
          render: value => <pre>{value}</pre>,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="评价点主数据">
        <DataTable {...tableProps} />
        <AddMainModal visible={visible} toggle={this.toggle} title={modalTitle} />
      </PageHeaderWrapper>
    );
  }
}

export default EvalPoint;
