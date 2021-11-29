import React, { PureComponent } from 'react';
import { Input, Radio } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { Selection, DatePicker } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectProjectConditional } from '@/services/user/project/project';
import { selectFinperiod } from '@/services/user/Contract/sales';
import { selectUsersWithBu } from '@/services/gen/list';
import SyntheticField from '@/components/common/SyntheticField';

const DOMAIN = 'phaseSettleListList';
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@connect(({ loading, phaseSettleListList, dispatch, user }) => ({
  loading,
  ...phaseSettleListList,
  dispatch,
  user,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
@mountToTab()
class PhaseSettleListList extends PureComponent {
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
    const { loading, list, total, searchForm, dispatch, user } = this.props;
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
          title: '项目',
          dataIndex: 'projId',
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectProjectConditional({})}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          ),
        },

        {
          title: '汇报日期',
          dataIndex: 'applyDate',
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '汇报人',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.applyResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={SEL_COL}
              source={() => selectUsersWithBu()}
              placeholder="请选择汇报人"
              showSearch
            />
          ),
        },
      ],
      columns: [
        {
          title: '名称',
          dataIndex: 'listName',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/user/project/phaseSettleListDetail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '创建人',
          dataIndex: 'resName',
        },
        {
          title: '项目',
          dataIndex: 'projName',
        },
        {
          title: '总金额',
          dataIndex: 'amt',
        },
        {
          title: '总天数',
          dataIndex: 'days',
        },
        {
          title: '汇报日期',
          dataIndex: 'applyDate',
        },
        {
          title: '工时日期开始',
          dataIndex: 'startDate',
        },
        {
          title: '工时日期结束',
          dataIndex: 'endDate',
        },
        {
          title: '收款阶段名称',
          dataIndex: 'phaseName',
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          hidden: true,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id, briefStatus } = selectedRows[0];
            if (briefStatus === 'CREATE') {
              router.push('/user/project/projectReport?id=' + id);
            } else {
              createMessage({ type: 'warn', description: '只有新建状态的可以修改！' });
            }
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          hidden: true,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const flag = selectedRows.filter(item => item.briefStatus !== 'CREATE').length;
            if (flag) {
              createMessage({ type: 'warn', description: '只有新建状态的可以删除！' });
              return;
            }
            const ids = selectedRows.map(selected => selected.id);
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { keys: ids.join(',') },
            });
          },
        },
        {
          key: 'add',
          title: '新增',
          className: 'tw-btn-info',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/user/project/phaseSettleListEdit`);
          },
        },
      ],
    };

    return tableProps;
  };

  render() {
    return (
      <PageHeaderWrapper title="阶段结算单列表">
        <DataTable {...this.tablePropsConfig()} />
      </PageHeaderWrapper>
    );
  }
}

export default PhaseSettleListList;
