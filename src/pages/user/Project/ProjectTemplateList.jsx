import React, { PureComponent } from 'react';
import { Input, Select } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { Selection } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { selectProjectConditional } from '@/services/user/project/project';

const DOMAIN = 'projectTemplateList';
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, projectTemplateList, dispatch, user }) => ({
  loading,
  ...projectTemplateList,
  dispatch,
  user,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
@mountToTab()
class ProjectTemplateList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    this.fetchData({ offset: 0, limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  tablePropsConfig = () => {
    const { loading, list, total, searchForm, dispatch } = this.props;
    const loadingStatus = loading.effects[`${DOMAIN}/query`];

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: loadingStatus,
      total,
      dataSource: list,
      onChange: filters => this.fetchData(filters),
      searchForm, // 把这个注入，可以切 tab 保留table状态
      onSearchBarChange: (changedValues, allValues) => {
        // 搜索条件变化，通过这里更新到 redux
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '模板名称',
          dataIndex: 'tmplName',
          options: {
            initialValue: searchForm.tmplName,
          },
          tag: <Input allowClear placeholder="模板名称" />,
        },
        {
          title: '适用类型',
          dataIndex: 'workType',
          tag: <Selection.UDC code="TSK:WORK_TYPE" placeholder="请选择适用类型" />,
        },
        // {
        //   title: '交易日期',
        //   dataIndex: 'settleDate',
        //   tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        // },
        {
          title: '是否启用',
          dataIndex: 'enabledFlag',
          tag: (
            <Select placeholder="请选择是否启用" allowClear>
              <Select.Option value="1">是</Select.Option>
              <Select.Option value="0">否</Select.Option>
            </Select>
          ),
        },
      ],
      columns: [
        {
          title: '模板名称',
          dataIndex: 'tmplName',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/user/project/projectTemplateDetail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '适用类型',
          dataIndex: 'workTypeDesc',
        },
        {
          title: '是否启用',
          dataIndex: 'enabledFlag',
          render: (value, rowData) => (value === 1 ? '是' : '否'),
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
        },
      ],
      leftButtons: [
        {
          key: 'insert',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/user/project/projectTemplateCreate');
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            if (id) {
              router.push('/user/project/projectTemplateCreate?id=' + id);
            } else {
              createMessage({ type: 'warn', description: '请勾选一条记录' });
            }
          },
        },
        {
          key: 'toggleEnabled',
          className: 'tw-btn-primary',
          title: '切换启用',
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (!selectedRows[0]) {
              createMessage({ type: 'warn', description: '请勾选一条记录' });
              return;
            }
            const { id } = selectedRows[0];
            let { enabledFlag } = selectedRows[0];
            if (enabledFlag === 1) {
              enabledFlag = 0;
            } else {
              enabledFlag = 1;
            }
            dispatch({
              type: `${DOMAIN}/toggleEnabled`,
              payload: { id, status: enabledFlag },
            });
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // const flag = selectedRows.filter(item => item.briefStatus !== 'CREATE').length;
            // if (flag) {
            //   createMessage({ type: 'warn', description: '只有新建状态的可以删除！' });
            //   return;
            // }
            const ids = selectedRows.map(selected => selected.id);
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { ids: ids.join(',') },
            });
          },
        },
      ],
    };

    return tableProps;
  };

  render() {
    return (
      <PageHeaderWrapper title="项目模板列表">
        <DataTable {...this.tablePropsConfig()} />
      </PageHeaderWrapper>
    );
  }
}

export default ProjectTemplateList;
