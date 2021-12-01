import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { Selection, DatePicker } from '@/pages/gen/field';
import { fromQs } from '@/utils/production/stringUtil';
import { selectInternalOus } from '@/services/gen/list';
import AssessmentResultModal from './AssessmentResultModal';

const DOMAIN = 'performanceReporting';
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const isConfirmStatus = [{ code: true, value: '是' }, { code: false, value: '否' }];

@connect(({ loading, performanceReporting, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  performanceReporting,
  dispatch,
}))
@mountToTab()
class PerformanceReportList extends PureComponent {
  state = {
    isVisible: false,
  };

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

  // 关闭弹窗。
  periodModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        targetPeriodList: [],
      },
    });
    this.setState({
      isVisible: false,
    });
  };

  // 保存按钮事件
  periodSubmitModal = () => {
    this.setState({
      isVisible: false,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      performanceReporting: { dataSource, total, searchForm, targetPeriodList },
    } = this.props;
    const { mode } = fromQs();
    const { isVisible } = this.state;
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
        //   key: 'add',
        //   icon: 'plus-circle',
        //   className: 'tw-btn-primary',
        //   title: '新增',
        //   loading: false,
        //   hidden: false,
        //   disabled: loading || false,
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     router.push(`/user/performance/performanceReport/reportEdit?mode=creat`);
        //   },
        // },
        {
          key: 'edit',
          title: '修改',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: !(mode && mode === 'hrList'),
          disabled: selectedRows => !selectedRows.length,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].status === 'APPROVED') {
              router.push(
                `/hr/prefMgmt/performanceReport/reportEdit?mode=hrEdit&id=${selectedRowKeys[0]}`
              );
            } else {
              createMessage({ type: 'warn', description: '只有已审批状态的数据才可以修改！' });
            }
          },
        },
        {
          key: 'delete',
          className: 'tw-btn-primary',
          title: '开放考核结果',
          loading: false,
          hidden: !(mode && mode === 'hrList'),
          disabled: loading || false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/getPeriodList`,
            });
            this.setState({
              isVisible: true,
            });
          },
        },
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
        {
          title: '确定状态',
          dataIndex: 'confirmStatus',
          formItemLayout,
          options: {
            initialValue: searchForm?.confirmStatus,
          },
          tag: (
            <Selection
              className="x-fill-100"
              source={isConfirmStatus}
              transfer={{ key: 'code', code: 'code', name: 'value' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onValueChange={e => {}}
              placeholder="请选择目标周期"
              allowClear={false}
            />
          ),
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
              to={`/user/performance/performanceReport/detail?mode=detail&id=${row.id}`}
            >
              {row?.targetName}
              -述职报告
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
          title: '确定状态',
          dataIndex: 'confirmStatus',
          align: 'center',
          render: (value, row, index) => (value === true ? '是' : '否'),
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
        {
          title: '绩效考核等级',
          dataIndex: 'grade',
          align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="年末述职管理">
        <DataTable {...tableProps} />
        <AssessmentResultModal
          formData={dataSource}
          visible={isVisible}
          handleCancel={this.periodModal}
          handleOk={this.periodSubmitModal}
        />
      </PageHeaderWrapper>
    );
  }
}

export default PerformanceReportList;
