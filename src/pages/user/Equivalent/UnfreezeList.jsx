import React, { PureComponent } from 'react';
import { Input, Switch } from 'antd';
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
import { selectProjectConditional } from '@/services/user/project/project';
import { selectUsersWithBu } from '@/services/gen/list';
import { selectFinperiod } from '@/services/user/Contract/sales';

import { saveAs } from 'file-saver';

const DOMAIN = 'unfreezeList';
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, unfreezeList, dispatch, user }) => ({
  loading,
  ...unfreezeList,
  dispatch,
  user,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
@mountToTab()
class UnfreezeList extends PureComponent {
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
    const { loading, dataSource, total, searchForm, dispatch, user } = this.props;
    const loadingStatus = loading.effects[`${DOMAIN}/query`];
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: loadingStatus,
      total,
      dataSource,
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
          title: '单据号',
          dataIndex: 'unfreezeNo',
          options: {
            initialValue: searchForm.withdrawNo,
          },
          tag: <Input placeholder="请输入单据号" />,
        },
        {
          title: '申请人',
          dataIndex: 'resId',
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu({})}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          ),
        },
        {
          title: '审批状态',
          dataIndex: 'apprStatus',
          tag: <Selection.UDC code="COM.APPR_STATUS" placeholder="请选择审批状态" />,
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '单据号',
          dataIndex: 'unfreezeNo',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/user/center/UnfreezeDetail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '申请人',
          dataIndex: 'resName',
        },
        {
          title: '状态',
          dataIndex: 'apprStatusDesc',
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
        },
        {
          title: '当量',
          dataIndex: 'unfreezeEqva',
        },
        {
          title: '金额',
          dataIndex: 'unfreezeAmt',
        },
        {
          title: '备注',
          dataIndex: 'remark',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push('/plat/intelStl/unfreezeCreate'),
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          hidden: true,
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
      ],
    };

    return tableProps;
  };

  render() {
    return (
      <PageHeaderWrapper title="质保金解冻">
        <DataTable {...this.tablePropsConfig()} />
      </PageHeaderWrapper>
    );
  }
}

export default UnfreezeList;
