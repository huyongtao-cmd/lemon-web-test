import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Form } from 'antd';
import router from 'umi/router';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { mountToTab } from '@/layouts/routerControl';
import { Selection, DatePicker } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { selectUsersWithBu } from '@/services/gen/list';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const DOMAIN = 'transferMoneyList';

@connect(({ loading, transferMoneyList, user }) => ({
  transferMoneyList,
  user,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class TransferMoneyList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/queryTransferCompany` });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      transferMoneyList: {
        list,
        total,
        searchForm,
        resDataSource,
        baseBuDataSource,
        collectionCompanyList,
        transferCompanyList,
      },
      form: { setFieldsValue },
      dispatch,
      user,
      loading,
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading,
      total,
      dataSource: list,
      searchForm,
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
          title: '申请人',
          dataIndex: 'applicantUserId',
          options: {
            initialValue: searchForm.applicantUserId || undefined,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={particularColumns}
              source={() => selectUsersWithBu()}
              placeholder="请选择申请人"
              showSearch
            />
          ),
        },
        {
          title: '申请人所属BU',
          dataIndex: 'applicantBuId',
          options: {
            initialValue: searchForm.applicantBuId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={baseBuDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择申请人所属BU"
            />
          ),
        },
        {
          title: '申请日期',
          dataIndex: 'applicantTime',
          options: {
            initialValue: searchForm.applicantTime,
          },
          tag: <DatePicker format="YYYY-MM-DD" />,
        },
        {
          title: '划款公司',
          dataIndex: 'transferCompany',
          options: {
            initialValue: searchForm.transferCompany || undefined,
          },
          tag: (
            <Selection
              className="x-fill-100"
              source={transferCompanyList}
              // columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择划款公司"
            />
          ),
        },
        {
          title: '收款公司',
          dataIndex: 'collectionCompany',
          options: {
            initialValue: searchForm.collectionCompany || undefined,
          },
          tag: (
            <Selection
              className="x-fill-100"
              source={collectionCompanyList}
              // columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择收款公司"
            />
          ),
        },
        {
          title: '状态',
          dataIndex: 'apprStatus',
          options: {
            initialValue: searchForm.apprStatus,
          },
          tag: <Selection.UDC code="COM:APPR_STATUS" placeholder="请选择审批状态" />,
        },
        {
          title: '资金划款编号',
          dataIndex: 'transferNo',
          options: {
            initialValue: searchForm.transferNo,
          },
          tag: <Input placeholder="请输入资金划款编号" />,
        },
      ],
      columns: [
        {
          title: '资金划款编号',
          dataIndex: 'transferNo',
          align: 'center',
          width: 120,
          render: (value, row, key) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            return (
              <Link
                className="tw-link"
                to={`/plat/expense/transferMoney/detail?id=${row.id}&${from}`}
              >
                {value}
              </Link>
            );
          },
        },
        {
          title: '申请人',
          dataIndex: 'applicantUserName',
          align: 'center',
          width: 100,
        },
        {
          title: '申请人所属部门',
          dataIndex: 'applicantBuIdName',
          width: 200,
        },
        {
          title: '申请日期',
          dataIndex: 'applicantTime',
          width: 150,
        },
        {
          title: '划款公司',
          dataIndex: 'transferCompanyName',
          width: 130,
        },
        {
          title: '划款账号',
          dataIndex: 'transferAccount',
          width: 130,
        },
        {
          title: '收款公司',
          dataIndex: 'collectionCompanyName',
          width: 100,
        },
        {
          title: '收款账号',
          dataIndex: 'collectionAccount',
          width: 100,
        },
        {
          title: '划款金额',
          dataIndex: 'transferMoney',
          width: 100,
        },
        {
          title: '支付方式',
          dataIndex: 'payWayName',
          width: 100,
        },
        {
          title: '状态',
          dataIndex: 'apprStatusName',
          width: 100,
        },
      ],
      leftButtons: [
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length || user.user.admin,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // 只有运维人员可以删除
            if (!user.user.admin) {
              createMessage({ type: 'warn', description: '只有管理员可以操作' });
              return;
            }
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { keys: selectedRowKeys.join(',') },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="资金拨付列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default TransferMoneyList;
