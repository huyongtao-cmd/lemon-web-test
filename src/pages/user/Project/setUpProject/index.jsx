import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Form } from 'antd';
import router from 'umi/router';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { mountToTab } from '@/layouts/routerControl';
import { Selection } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const DOMAIN = 'projectSetUpList';

@connect(({ loading, projectSetUpList, user }) => ({
  projectSetUpList,
  user,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class ProjectSetUpList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      projectSetUpList: { list, total, searchForm, resDataSource, baseBuDataSource },
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
          title: '申请编号',
          dataIndex: 'projNo',
          options: {
            initialValue: searchForm.projNo,
          },
          tag: <Input placeholder="请输入申请编号" />,
        },
        {
          title: '申请状态',
          dataIndex: 'processStatus',
          options: {
            initialValue: searchForm.processStatus,
          },
          tag: <Selection.UDC code="ACC:PROJECT_REQUEST_STATUS" placeholder="请选择申请状态" />,
        },
        {
          title: '项目名称',
          dataIndex: 'projName',
          options: {
            initialValue: searchForm.projName,
          },
          tag: <Input placeholder="请输入项目名称" />,
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuId',
          options: {
            initialValue: searchForm.deliBuId || undefined,
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
              placeholder="请选择交付BU"
            />
          ),
        },
        {
          title: '交付负责人',
          dataIndex: 'deliResId',
          options: {
            initialValue: searchForm.deliResId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择交付负责人"
            />
          ),
        },
        {
          title: '销售负责人',
          dataIndex: 'salesmanResId',
          options: {
            initialValue: searchForm.salesmanResId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择销售负责人"
            />
          ),
        },
        {
          title: '项目经理',
          dataIndex: 'pmResId',
          options: {
            initialValue: searchForm.pmResId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择项目经理"
            />
          ),
        },
        {
          title: '合同编号/名称',
          dataIndex: 'contractNmNo',
          options: {
            initialValue: searchForm.contractNmNo,
          },
          tag: <Input placeholder="请输入子合同编号/名称" />,
        },
      ],
      columns: [
        {
          title: '申请编号',
          dataIndex: 'projNo',
          align: 'center',
          width: 120,
          render: (value, row, key) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            return (
              <Link
                className="tw-link"
                to={`/user/project/setUpProject/detail?id=${row.id}&${from}`}
              >
                {value}
              </Link>
            );
          },
        },
        {
          title: '申请状态',
          dataIndex: 'processStatusName',
          align: 'center',
          width: 100,
        },
        {
          title: '项目名称',
          dataIndex: 'projName',
          width: 200,
        },
        {
          title: '相关子合同',
          dataIndex: 'contractName',
          width: 150,
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuName',
          width: 130,
        },
        {
          title: '交付负责人',
          dataIndex: 'deliResName',
          width: 130,
        },
        {
          title: '项目经理',
          dataIndex: 'pmResName',
          width: 100,
        },
        {
          title: '销售负责人',
          dataIndex: 'salesmanResName',
          width: 100,
        },
        {
          title: '申请人',
          dataIndex: 'resIdName',
          width: 100,
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          width: 100,
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            !(selectedRows.length === 1 && selectedRows[0].processStatus === 'CREATE'),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // id、状态  只有新建状态才可以修改
            const { id, processStatus } = selectedRows[0];
            if (processStatus === 'CREATE') {
              router.push(
                `/user/project/setUpProject/flowCreate?id=${selectedRowKeys}&mode=update`
              );
            }
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
            // 只有运维人员可以删除
            let flag = false;
            selectedRows.map((item, key) => {
              if (item.processStatus !== 'CREATE') {
                flag = true;
              }
              return true;
            });
            if (flag) {
              createMessage({ type: 'warn', description: '只有创建状态的项目立项申请才能删除' });
              return;
            }
            if (!user.user.admin) {
              createMessage({ type: 'warn', description: '只有管理员可以操作' });
              return;
            }
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="项目立项列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default ProjectSetUpList;
