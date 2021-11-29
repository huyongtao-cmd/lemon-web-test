import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Input, Form } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const DOMAIN = 'customer';

@connect(({ loading, customer }) => ({
  customer,
  loading,
}))
@Form.create({})
@mountToTab()
class CustomerFuzzyList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { mode } = fromQs();
    !mode && dispatch({ type: `${DOMAIN}/cleansearchFuzzyForm` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/fuzzyQuery`, payload: { ...params } });
  };

  render() {
    const {
      customer: { searchFuzzyForm, fuzzyList, fuzzyTotal },
      dispatch,
      loading,
    } = this.props;
    const fuzzyLoading = loading.effects[`${DOMAIN}/fuzzyQuery`];

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: '100%' },
      loading: fuzzyLoading,
      total: fuzzyTotal,
      dataSource: fuzzyList,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchFuzzyForm`,
          payload: allValues,
        });
      },
      searchForm: searchFuzzyForm,
      searchBarForm: [
        {
          title: '公司名称',
          dataIndex: 'custName',
          colProps: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12,
            xl: 12,
          },
          options: {
            initialValue: searchFuzzyForm.custName || '',
          },
          tag: <Input placeholder="请输入公司名称" />,
        },
        {
          title: '电话',
          dataIndex: 'tel',
          colProps: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12,
            xl: 12,
          },
          options: {
            initialValue: searchFuzzyForm.tel || '',
          },
          tag: <Input placeholder="请输入电话" />,
        },
        {
          title: '邮箱',
          dataIndex: 'email',
          colProps: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12,
            xl: 12,
          },
          options: {
            initialValue: searchFuzzyForm.email || '',
          },
          tag: <Input placeholder="请输入邮箱" />,
        },
        {
          title: '地址',
          dataIndex: 'address',
          colProps: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12,
            xl: 12,
          },
          options: {
            initialValue: searchFuzzyForm.address || '',
          },
          tag: <Input placeholder="请输入地址" />,
        },
      ],
      columns: [
        {
          title: '公司名称',
          dataIndex: 'custName',
          width: 250,
          render: (value, rowData) => {
            const url = stringify({ from: `${getUrl().split('?')[0]}?mode=true` });

            if (rowData.custType === 'POTENTIAL_CUST') {
              const href = `/sale/management/customerDetails?id=${rowData.id}&${url}`;
              return (
                <Link className="tw-link" to={href}>
                  {value}
                </Link>
              );
            }
            if (rowData.custType === 'COOPERATION_CUST') {
              const href = `/plat/addr/view?no=${rowData.abNo}&${url}`;
              return (
                <Link className="tw-link" to={href}>
                  {value}
                </Link>
              );
            }
            return null;
          },
        },
        {
          title: '状态',
          dataIndex: 'custStatusName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '客户类型',
          dataIndex: 'custTypeName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '总机固话',
          dataIndex: 'switchBoard',
          className: 'text-center',
          width: 150,
        },
        {
          title: '电话(董事长)',
          dataIndex: 'chairManTel',
          className: 'text-center',
          width: 150,
        },
        {
          title: '电话(IT负责人)',
          dataIndex: 'itAdminTel',
          className: 'text-center',
          width: 150,
        },
        {
          title: '电话(其他负责人)',
          dataIndex: 'otherPicTel',
          className: 'text-center',
          width: 150,
        },
        {
          title: '公司邮箱',
          dataIndex: 'companyEmail',
          width: 250,
        },
        {
          title: '邮箱(董事长)',
          dataIndex: 'chairManEmail',
          width: 250,
        },
        {
          title: '邮箱(IT负责人)',
          dataIndex: 'itAdminEmail',
          width: 250,
        },
        {
          title: '邮箱(其他负责人)',
          dataIndex: 'otherPicEmail',
          width: 250,
        },
        {
          title: '区域-省份-城市',
          dataIndex: 'custRegIon',
          className: 'text-center',
          width: 150,
          render: (value, rowData) => {
            const { custRegIonName, provInceName, cityName } = rowData;
            return `${custRegIonName || ''}${custRegIonName ? '-' : ''}${provInceName || ''}${
              provInceName ? '-' : ''
            }${cityName || ''}`;
          },
        },
        {
          title: '总部地址',
          dataIndex: 'headOfficeAddr',
          width: 150,
          render: (value, rowData) => <pre>{value}</pre>,
        },
      ],
      leftButtons: [
        {
          key: 'signInvalid',
          icon: 'close',
          className: 'tw-btn-primary',
          title: '标记为无效',
          loading: false,
          hidden: false,
          disabled: selectedRows => {
            let flag = true;
            selectedRows.forEach(v => {
              if (v.custType !== 'POTENTIAL_CUST') {
                flag = false;
              }
            });
            return fuzzyLoading || !selectedRows.length || !flag;
          },
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/signInvalid`,
              payload: selectedRowKeys.join(','),
            });
          },
        },
      ],
    };

    return <DataTable {...tableProps} scroll={{ x: 3000 }} />;
  }
}

export default CustomerFuzzyList;
