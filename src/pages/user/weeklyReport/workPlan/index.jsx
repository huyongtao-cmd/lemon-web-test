import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Input, Form, Radio, Switch, Tooltip } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { Selection, DatePicker } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { selectIamUsers } from '@/services/gen/list';
import { stringify } from 'qs';
import { isNil } from 'ramda';

const RadioGroup = Radio.Group;

const DOMAIN = 'workPlan';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, workPlan, dispatch, user }) => ({
  workPlan,
  dispatch,
  user,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class WorkPlan extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      user: {
        user: { extInfo },
      },
    } = this.props;

    if (!isNil(extInfo)) {
      const { resId } = extInfo;
      dispatch({ type: `${DOMAIN}/taskAll`, payload: { resId } });
    } else {
      createMessage({
        type: 'warn',
        description: '当前账号为管理员账号，不能选择任务包和相关活动',
      });
    }
    dispatch({ type: `${DOMAIN}/res` });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanTableFrom` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      workPlan: { list, total, searchForm, resDataSource, taskAllList, activityList },
      form: { setFieldsValue },
      dispatch,
      loading,
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 2150 },
      loading,
      total,
      dataSource: list,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        {
          title: '编号/任务',
          dataIndex: 'taskInfo',
          options: {
            initialValue: searchForm.taskInfo || '',
          },
          tag: <Input placeholder="请输入编号/任务" />,
        },
        {
          title: '状态',
          dataIndex: 'planStatus',
          options: {
            initialValue: searchForm.planStatus || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="PLAN">计划中</Radio>
              <Radio value="FINISHED">已完成</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
        },
        {
          title: '执行人',
          dataIndex: 'planResId',
          options: {
            initialValue: searchForm.planResId || undefined,
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
              placeholder="请选择执行人"
            />
          ),
        },
        {
          title: '汇报对象',
          dataIndex: 'reportedResId',
          options: {
            initialValue: searchForm.reportedResId || undefined,
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
              placeholder="请选择汇报对象"
              mode="multiple"
            />
          ),
        },
        {
          title: '相关人',
          dataIndex: 'relevantResId',
          options: {
            initialValue: searchForm.relevantResId || undefined,
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
              placeholder="请选择相关人"
              mode="multiple"
            />
          ),
        },
        {
          title: '创建人',
          dataIndex: 'createUserId',
          options: {
            initialValue: searchForm.createUserId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectIamUsers()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择创建人"
            />
          ),
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          options: {
            initialValue: searchForm.createTime,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '相关任务包',
          dataIndex: 'taskId',
          options: {
            initialValue: searchForm.taskId || undefined,
          },
          tag: (
            <Selection
              className="x-fill-100"
              source={taskAllList}
              dropdownMatchSelectWidth={false}
              showSearch
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择相关任务包"
              onColumnsChange={value => {}}
              onChange={value => {
                if (value) {
                  dispatch({ type: `${DOMAIN}/activity`, payload: { taskId: value } });
                }
                dispatch({
                  type: `${DOMAIN}/updateSearchForm`,
                  payload: { activityId: undefined },
                });
                setFieldsValue({
                  activityId: undefined,
                });
              }}
            />
          ),
        },
        {
          title: '相关活动',
          dataIndex: 'activityId',
          options: {
            initialValue: searchForm.activityId || undefined,
          },
          tag: (
            <Selection
              className="x-fill-100"
              source={activityList}
              dropdownMatchSelectWidth={false}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              showSearch
              placeholder="请选择相关活动"
              onColumnsChange={value => {}}
            />
          ),
        },
        {
          title: '任务备注1',
          dataIndex: 'remark1',
          options: {
            initialValue: searchForm.remark1 || '',
          },
          tag: <Input placeholder="请输入任务备注1" />,
        },
        {
          title: '任务备注2',
          dataIndex: 'remark2',
          options: {
            initialValue: searchForm.remark2 || '',
          },
          tag: <Input placeholder="请输入任务备注2" />,
        },
      ],
      columns: [
        {
          title: '编号',
          dataIndex: 'planNo',
          align: 'center',
          sorter: true,
          width: 100,
        },
        {
          title: '优先级',
          dataIndex: 'priority',
          align: 'center',
          sorter: true,
          width: 100,
        },
        {
          title: '任务',
          dataIndex: 'taskName',
          width: 200,
        },
        {
          title: '状态',
          dataIndex: 'planStatus',
          align: 'center',
          width: 100,
          render: (val, row, index) => (
            <Switch
              checkedChildren="已完成"
              unCheckedChildren="计划中"
              checked={val === 'FINISHED'}
              onChange={(bool, e) => {
                const parmas = bool ? 'FINISHED' : 'PLAN';
                dispatch({
                  type: `${DOMAIN}/ChangeStatus`,
                  payload: { ids: row.id, planStatus: parmas },
                }).then(res => {
                  list[index].planStatus = parmas;
                  list[index].planStatusName = parmas === 'FINISHED' ? '已完成' : '计划中';
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: list,
                  });
                });
              }}
            />
          ),
        },
        {
          title: '计划开始日期',
          dataIndex: 'dateFrom',
          className: 'text-center',
          width: 150,
        },
        {
          title: '计划结束日期',
          dataIndex: 'dateTo',
          className: 'text-center',
          width: 150,
        },
        {
          title: '执行人',
          dataIndex: 'planResName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '汇报对象',
          dataIndex: 'reportedResName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '相关人',
          dataIndex: 'relevantResName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '任务备注1',
          dataIndex: 'remark1',
          width: 200,
          render: (value, row, key) =>
            value && value.length > 10 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <span>{`${value.substr(0, 10)}...`}</span>
              </Tooltip>
            ) : (
              <span>{value}</span>
            ),
        },
        {
          title: '任务备注2',
          dataIndex: 'remark2',
          width: 200,
          render: (value, row, key) =>
            value && value.length > 10 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <span>{`${value.substr(0, 10)}...`}</span>
              </Tooltip>
            ) : (
              <span>{value}</span>
            ),
        },
        {
          title: '相关任务包',
          dataIndex: 'taskIdName',
          className: 'text-center',
          width: 150,
        },
        {
          title: '相关活动',
          dataIndex: 'activityName',
          className: 'text-center',
          width: 200,
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          className: 'text-center',
          width: 150,
          render: (value, row, key) => value.split(' ')[0],
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
          disabled: loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/user/weeklyReport/workPlan/edit?${from}&fromFlag=WORK`);
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/user/weeklyReport/workPlan/edit?id=${id}&${from}&fromFlag=WORK`);
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
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
        {
          key: 'copy',
          icon: 'form',
          className: 'tw-btn-info',
          title: '复制',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(
              `/user/weeklyReport/workPlan/edit?id=${id}&${from}&fromFlag=WORK&copy=true`
            );
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="工作计划列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default WorkPlan;
