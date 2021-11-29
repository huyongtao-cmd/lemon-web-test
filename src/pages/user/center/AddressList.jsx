import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import AsyncSelect from '@/components/common/AsyncSelect';
import DataTable from '@/components/common/DataTable';
import { UdcSelect } from '@/pages/gen/field';
import { selectBus } from '@/services/org/bu/bu';

const DOMAIN = 'addressList';

@connect(({ loading, addressList, dispatch }) => ({
  addressList,
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
}))
@mountToTab()
class AddressList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    // this.fetchList({ sortBy: 'resNo', sortDirection: 'ASC' });
  }

  fetchList = params => {
    const { dispatch } = this.props;
    // note: 通讯录按照需求，只给显示 10 条， 去掉分页(pagination:false)，需求就是这样==
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        offset: 0,
        limit: 10,
      },
    });
  };

  render() {
    const {
      loading,
      addressList: { list = [], total, searchForm },
      dispatch,
    } = this.props;

    const tableProps = {
      rowKey: 'resNo',
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      pagination: false,
      showExport: false,
      onChange: filters => {
        this.fetchList(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      showColumn: false,
      // enableDoubleClick: false,
      onRow: () => {},
      enableSelection: false,
      total,
      dataSource: list,
      searchBarForm: [
        {
          title: '资源查询',
          dataIndex: 'searchKey',
          options: {
            initialValue: searchForm.searchKey,
          },
          tag: <Input placeholder="编号/姓名" />,
        },
        {
          title: '工号',
          dataIndex: 'empNo',
          options: {
            initialValue: searchForm.empNo,
          },
        },
        {
          title: '所属组织',
          dataIndex: 'baseBuId',
          options: {
            initialValue: searchForm.baseBuId,
          },
          tag: (
            <AsyncSelect
              source={() => selectBus().then(resp => resp.response)}
              placeholder="请输入所属组织"
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            />
          ),
        },
        {
          title: '主服务地',
          dataIndex: 'baseCity',
          options: {
            initialValue: searchForm.baseCity,
          },
          tag: <UdcSelect code="COM.CITY" placeholder="请选择主服务地" />,
        },
        {
          title: '手机',
          dataIndex: 'mobile',
          options: {
            initialValue: searchForm.mobile,
          },
        },
        {
          title: '邮箱',
          dataIndex: 'searchEmail',
          options: {
            initialValue: searchForm.searchEmail,
          },
        },
      ],
      columns: [
        {
          title: '资源编号',
          dataIndex: 'resNo',
          className: 'text-center',
          sorter: true,
          width: '10%',
        },
        {
          title: '姓名',
          dataIndex: 'personName',
          className: 'text-center',
          sorter: true,
          width: '8%',
        },
        {
          title: '工号',
          dataIndex: 'empNo',
          className: 'text-center',
          sorter: true,
          width: '8%',
        },
        {
          title: '性别',
          dataIndex: 'gender',
          className: 'text-center',
          width: '5%',
          render: (value, row, index) => {
            if (!value) return <span />;
            return <span>{value === 'M' ? '男' : '女'}</span>;
          },
        },
        {
          title: '所属组织',
          dataIndex: 'buName',
          className: 'text-center',
          width: '10%',
        },
        {
          title: '主服务地',
          dataIndex: 'baseEntityName',
          className: 'text-center',
          width: '8%',
        },
        {
          title: '手机号码',
          dataIndex: 'mobile',
          className: 'text-center',
          width: '10%',
        },
        {
          title: '公司邮箱',
          dataIndex: 'emailAddr',
          width: '12%',
        },
        {
          title: '个人邮箱',
          dataIndex: 'email',
          width: '12%',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="基础组件参考">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default AddressList;
