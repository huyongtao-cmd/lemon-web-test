import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { mountToTab } from '@/layouts/routerControl';
import Link from 'umi/link';
import router from 'umi/router';
import { createConfirm } from '@/components/core/Confirm';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/production/stringUtil';
import { Input } from 'antd';
import { selectInternalOus } from '@/services/gen/list';

const DOMAIN = 'performanceTarget';
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, performanceTarget, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  performanceTarget,
  dispatch,
}))
@mountToTab()
class PerformanceTargetList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchData({
      offset: 0,
      limit: 10,
      sortBy: 'id',
      sortDirection: 'DESC',
    });
    dispatch({
      type: `${DOMAIN}/getPeriodList`,
    });
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      dispatch,
      loading,
      performanceTarget: { dataSource, total, searchForm, targetPeriodList },
    } = this.props;
    const { mode } = fromQs();
    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      dataSource,
      searchForm,
      leftButtons: [
        // {
        //   key: 'edit',
        //   title: '修改',
        //   className: 'tw-btn-primary',
        //   icon: 'form',
        //   loading: false,
        //   hidden: false,
        //   disabled: selectedRows => !selectedRows.length,
        //   minSelections: 1,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     if (selectedRows[0].status === 'CREATE') {
        //       router.push(
        //         `/hr/prefMgmt/performanceTarget/targetEdit?mode=Edit&id=${selectedRowKeys[0]}`
        //       );
        //     } else {
        //       createMessage({ type: 'warn', description: '只有新建状态的数据才可以修改！' });
        //     }
        //   },
        // },
        {
          key: 'replace',
          className: 'tw-btn-primary',
          title: '代发起',
          loading: false,
          hidden: !(mode && mode === 'hrList'),
          disabled: loading || false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/cleanState`,
            });
            router.push(`/hr/prefMgmt/performanceTarget/targetEdit?mode=replaceEdit`);
          },
        },
      ],
      onChange: filters => {
        this.fetchData(filters);
      },
      searchBarForm: [
        {
          title: '目标名称',
          dataIndex: 'targetName',
          options: {
            initialValue: searchForm?.targetName || undefined,
          },
          formItemLayout,
          tag: <Input placeholder="请输入周期名称" />,
        },
        {
          title: '员工姓名',
          dataIndex: 'resName',
          formItemLayout,
          options: {
            initialValue: searchForm?.resName,
          },
          tag: <Input placeholder="请输入员工姓名" />,
        },
        {
          title: '负责人',
          dataIndex: 'presName',
          formItemLayout,
          options: {
            initialValue: searchForm?.presName,
          },
          tag: <Input placeholder="请输入负责人" />,
        },
        {
          title: '目标周期',
          dataIndex: 'periodId',
          formItemLayout,
          options: {
            initialValue: searchForm?.periodId,
          },
          tag: (
            <Selection
              className="x-fill-100"
              source={targetPeriodList}
              transfer={{ key: 'id', code: 'id', name: 'periodName' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onValueChange={e => {}}
              placeholder="请选择目标周期"
              allowClear={false}
            />
          ),
        },
        {
          title: '公司名称',
          dataIndex: 'ouId',
          formItemLayout,
          options: {
            initialValue: searchForm?.ouId,
          },
          tag: <Selection source={() => selectInternalOus()} placeholder="请选择公司名称" />,
        },
        {
          title: '状态',
          dataIndex: 'status',
          formItemLayout,
          options: {
            initialValue: searchForm?.status,
          },
          tag: <Selection.UDC code="KPI:KPI_TARGET_STATUS" placeholder="请选择状态" />,
        },
      ],
      columns: [
        {
          title: '目标名称',
          dataIndex: 'targetName',
          align: 'center',
          render: (value, row, index) => (
            <Link
              className="tw-link"
              to={`/user/performance/performanceTarget/detail?mode=detail&id=${row.id}`}
            >
              {row?.targetName}
              -绩效目标
            </Link>
          ),
        },
        {
          title: '公司名称',
          dataIndex: 'ouName',
          align: 'center',
        },
        {
          title: '员工姓名',
          dataIndex: 'resName',
          align: 'center',
        },
        {
          title: '直属负责人',
          dataIndex: 'presName',
          align: 'center',
        },
        {
          title: '目标周期',
          dataIndex: 'periodName',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'statusName',
          align: 'center',
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
          align: 'center',
        },
        {
          title: '最近修改时间',
          dataIndex: 'createTime',
          align: 'center',
          render: value => value.replace('T', ' '),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="绩效目标管理">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default PerformanceTargetList;
