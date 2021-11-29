import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import moment from 'moment';
import { Input, DatePicker, Select } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { formatMessage } from 'umi/locale';
import { selectIamUsers } from '@/services/gen/list';
import { Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'calerdarList';
const { RangePicker } = DatePicker;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 16 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
@connect(({ loading, calerdarList }) => ({
  calerdarList,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class CalendarList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    // 进来选初始化搜索条件，再查询
    dispatch({ type: `${DOMAIN}/cleanSearchForm`, payload: {} });
    this.fetchData({
      sortBy: 'id',
      sortDirection: 'DESC',
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      loading,
      dispatch,
      calerdarList: { list = [], total = 0, searchForm },
    } = this.props;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: {},
      loading,
      total,
      dataSource: list,
      enableSelection: true,
      onChange: filters => this.fetchData(filters),
      searchForm,
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '任务',
          dataIndex: 'event',
          tag: <Input placeholder="请输入事项编号或事项名称" />,
        },
        {
          title: '任务状态',
          dataIndex: 'eventStatus',
          tag: <Selection.UDC code="COM:CAL_TASK_STATUS" placeholder="请选择状态" />,
        },
      ],
      columns: [
        {
          title: '事项ID',
          dataIndex: 'id',
          align: 'center',
        },
        {
          title: '事项编号',
          dataIndex: 'eventNo',
          align: 'center',
        },
        {
          title: '事项名称',
          dataIndex: 'eventName',
          align: 'center',
        },
        {
          title: '客户',
          dataIndex: 'custName',
          align: 'center',
        },
        {
          title: '项目',
          dataIndex: 'projectName',
          align: 'center',
        },
        {
          title: '责任人',
          align: 'center',
          dataIndex: 'mainPersonName',
        },
        {
          title: '起始日期',
          align: 'center',
          dataIndex: 'startDate',
        },
        {
          title: '结束日期',
          align: 'center',
          dataIndex: 'endDate',
        },
        {
          title: '循环频率',
          dataIndex: 'loopRateDesc',
          align: 'center',
        },
        {
          title: '状态',
          align: 'center',
          dataIndex: 'statusDesc',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.insert', desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: loading || false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/cservice/manage/calendarDetail?mode=create`);
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: '维护',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            router.push(`/cservice/manage/calendarDetail?mode=edit&configId=${id}`);
          },
        },
        {
          key: 'copy',
          icon: 'copy',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.copy`, desc: '复制' }),
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            router.push(`/cservice/manage/calendarDetailCopy?mode=copy&configId=${id}`);
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
            let errorFlag = false;
            selectedRows.forEach(item => {
              if (item.status === 'FINISHED') {
                errorFlag = true;
              }
            });
            if (errorFlag) {
              createMessage({ type: 'error', description: '已处理的数据不能删除，请检查' });
            } else {
              dispatch({
                type: `${DOMAIN}/delete`,
                payload: { ids: selectedRowKeys.join(',') },
              });
            }
          },
        },
        {
          key: 'generateDetail',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: '快速生成明细',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            let errorFlag = false;
            selectedRows.forEach(item => {
              if (item.lockFlag === 0) {
                errorFlag = true;
              }
            });
            if (errorFlag) {
              createMessage({ type: 'error', description: '所选数据有未提交，请检查' });
            } else {
              dispatch({
                type: `${DOMAIN}/generateDetail`,
                payload: { ids: selectedRowKeys.join(',') },
              });
            }
          },
        },
        {
          key: 'viewDetail',
          icon: 'search',
          className: 'tw-btn-primary',
          title: '查看明细',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            let errorFlag = false;
            selectedRows.forEach(item => {
              if (item.lockFlag === 0) {
                errorFlag = true;
              }
            });
            if (errorFlag) {
              createMessage({ type: 'error', description: '所选数据有未提交，请检查' });
            } else {
              const { id } = selectedRows[0];
              router.push(`/cservice/manage/ViewCalendarList?configId=${id}`);
            }
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="运维日历循环事项查询">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default CalendarList;
