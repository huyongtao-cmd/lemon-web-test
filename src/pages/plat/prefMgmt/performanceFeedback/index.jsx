import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { omit } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import Link from 'umi/link';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { Input } from 'antd';
import { selectInternalOus } from '@/services/gen/list';

const DOMAIN = 'performanceFeedback';
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
@connect(({ loading, performanceFeedback, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  performanceFeedback,
  dispatch,
}))
@mountToTab()
class PerformanceFeedbackList extends PureComponent {
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
    const { createTime, ...restparams } = params;
    if (Array.isArray(createTime) && (createTime[0] || createTime[1])) {
      [restparams.createTimeBegin, restparams.createTimeEnd] = createTime;
    }
    dispatch({ type: `${DOMAIN}/query`, payload: { ...restparams } });
  };

  render() {
    const {
      dispatch,
      loading,
      performanceFeedback: { dataSource, total, searchForm, targetPeriodList },
    } = this.props;
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
        //     router.push(
        //       `/user/performance/performanceFeedback/feedbackEdit?mode=edit&id=${
        //         selectedRowKeys[0]
        //       }`
        //     );
        //   },
        // },
      ],
      onChange: filters => {
        this.fetchData(filters);
      },
      searchBarForm: [
        {
          title: '报告名称',
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
          title: '状态',
          dataIndex: 'status',
          formItemLayout,
          options: {
            initialValue: searchForm?.status,
          },
          tag: <Selection.UDC code="KPI:KPI_STAGE_ASSESSMENT_STATUS" placeholder="请选择状态" />,
        },
        {
          title: '申请时间',
          dataIndex: 'createTime',
          formItemLayout,
          options: {
            initialValue: searchForm?.createTime,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '报告名称',
          dataIndex: 'targetName',
          align: 'center',
          render: (value, row, index) => (
            <Link
              className="tw-link"
              to={`/user/performance/performanceFeedback/detail?mode=detail&id=${row.id}`}
            >
              {row?.targetName}
              -年中反馈
            </Link>
          ),
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
          title: '申请时间',
          dataIndex: 'createTime',
          align: 'center',
          render: value => value.replace('T', ' '),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="年中KPI回顾管理">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default PerformanceFeedbackList;
