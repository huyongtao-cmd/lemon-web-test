import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isNil, isEmpty } from 'ramda';
import { Button, Card, Form, Input, Divider, Checkbox, Tooltip, Modal } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker } from '@/pages/gen/field';
import moment from 'moment';
import { genFakeId } from '@/utils/mathUtils';
import update from 'immutability-helper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';

const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const workPlanColumns = [
  { dataIndex: 'planNo', title: '编号', span: 8 },
  { dataIndex: 'taskName', title: '名称', span: 16 },
];

const activityColumns = [
  { dataIndex: 'actNo', title: '编号', span: 8 },
  { dataIndex: 'actName', title: '名称', span: 16 },
];

const DOMAIN = 'makeWeeklyReport';

@connect(({ loading, makeWeeklyReport, user, dispatch }) => ({
  loading,
  makeWeeklyReport,
  user,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    const { vacationYear } = changedValues;
    if (vacationYear) {
      // eslint-disable-next-line no-param-reassign
      changedValues.vacationYear = String(vacationYear);
    }
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class MakeWeeklyReport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      confirmLoading: false,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      user: {
        user: { extInfo },
      },
    } = this.props;

    dispatch({ type: `${DOMAIN}/res` }); // 获取汇报对象
    dispatch({ type: `${DOMAIN}/clean` }).then(res => {
      if (!isNil(extInfo)) {
        const { resId } = extInfo;
        dispatch({ type: `${DOMAIN}/taskAll`, payload: { resId } });
      } else {
        createMessage({
          type: 'warn',
          description: '当前账号为管理员账号，不能选择任务包和相关活动',
        });
      }
      dispatch({
        type: `${DOMAIN}/queryWorkPlanList`,
        payload: {
          sortBy: 'id',
          sortDirection: 'DESC',
        },
      }); // 获取工作计划列表

      // 以当前周开始日期拉取周报详情
      // 若页面从我的周报修改跳转过来，带有时间参数，则直接通过时间参数请求
      const { weekStartDate } = fromQs();
      if (weekStartDate) {
        this.fetchDate(weekStartDate);
      } else {
        this.fetchDate(
          moment()
            .startOf('week')
            .format('YYYY-MM-DD')
        );
      }
    });
  }

  fetchDate = value => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        weekStartDate: value,
      },
    });
  };

  // 行编辑触发事件
  onThisWeekCellChanged = (index, value, name) => {
    const {
      makeWeeklyReport: { thisWeekList },
      dispatch,
    } = this.props;

    const newDataSource = thisWeekList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { thisWeekList: newDataSource },
    });
  };

  // 行编辑触发事件
  onNextWeekCellChanged = (index, value, name) => {
    const {
      makeWeeklyReport: { nextWeekList },
      dispatch,
    } = this.props;

    const newDataSource = nextWeekList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { nextWeekList: newDataSource },
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  handleCancel = () => {
    this.toggleVisible();
  };

  handleOk = () => {
    this.toggleVisible();
  };

  required = () => {
    const {
      makeWeeklyReport: { thisWeekList, nextWeekList },
    } = this.props;
    if (isEmpty(thisWeekList) && isEmpty(nextWeekList)) {
      createMessage({ type: 'warn', description: '周报和周计划不能同时为空' });
      return false;
    }
    if (!isEmpty(thisWeekList)) {
      const tt = thisWeekList.filter(v => !v.actStatus || !v.taskName);
      if (tt.length) {
        createMessage({ type: 'warn', description: '请补全周报必填项' });
        return false;
      }
    }
    if (!isEmpty(nextWeekList)) {
      const tt = nextWeekList.filter(v => !v.taskName);
      if (tt.length) {
        createMessage({ type: 'warn', description: '请补全周计划必填项' });
        return false;
      }
    }
    return true;
  };

  handleSubmit = saveOrReport => {
    const {
      form: { validateFieldsAndScroll },
      makeWeeklyReport: {
        formData: { thisWeekStartDate },
      },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // 做表格必填校验
        if (!this.required()) {
          return;
        }
        dispatch({
          type: `${DOMAIN}/submit`,
          payload: {
            saveType: saveOrReport,
          },
        }).then(res => {
          // 发起保存或汇报请求
          if (saveOrReport === 'report') {
            this.toggleVisible();
            this.setState({
              confirmLoading: false,
            });
          }

          dispatch({
            type: `${DOMAIN}/queryDetail`,
            payload: {
              weekStartDate: thisWeekStartDate,
            },
          });
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue },
      makeWeeklyReport: {
        formData,
        resDataSource,
        workPlanList,
        taskAllList,
        thisWeek,
        thisWeekList,
        thisWeekDelList,
        nextWeek,
        nextWeekList,
        nextWeekDelList,
      },
    } = this.props;

    const { visible, confirmLoading } = this.state;

    // loading完成之前将按钮设为禁用
    const submitBtn = loading.effects[`${DOMAIN}/submit`];
    const detailBtn = loading.effects[`${DOMAIN}/queryDetail`];

    const weeklyTableProps = {
      title: () => (
        <span>
          <span>
            期间：
            {thisWeek.period}
          </span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span>
            年周：
            {thisWeek.yearWeek}
          </span>
        </span>
      ),
      sortBy: 'id',
      rowKey: 'id',
      loading: false,
      dataSource: thisWeekList,
      scroll: { x: 2500 },
      rowSelection: {
        selectedRowKeys: 0,
        onChange: (selectedRowKeys, selectedRows) => {},
      },
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            thisWeekList: update(thisWeekList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  planId: undefined,
                  activityId: undefined,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = thisWeekList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            thisWeekList: newDataSource,
            thisWeekDelList: [...thisWeekDelList, ...selectedRowKeys],
          },
        });
      },
      onCopyItem: copied => {
        const newDataSource = copied.map(item => ({
          ...item,
          id: genFakeId(-1),
          // planId: undefined,
        }));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { thisWeekList: update(thisWeekList, { $push: newDataSource }) },
        });
      },
      columns: [
        {
          title: '工作计划',
          dataIndex: 'planId',
          width: 150,
          hidden: false,
          fixed: 'left',
          render: (value, row, index) => (
            <Selection.Columns
              className="x-fill-100"
              value={value}
              source={workPlanList}
              dropdownMatchSelectWidth={false}
              columns={workPlanColumns}
              showSearch
              transfer={{ key: 'id', code: 'id', name: 'planNo' }}
              placeholder="请选择工作计划"
              onColumnsChange={e => {
                if (e) {
                  const activityList = Array.isArray(e.activityList) ? e.activityList : [];
                  this.onThisWeekCellChanged(index, e.taskId, 'taskId');
                  this.onThisWeekCellChanged(index, e.taskName, 'taskName');
                  this.onThisWeekCellChanged(index, e.activityId, 'activityId');
                  this.onThisWeekCellChanged(index, activityList, 'activityList');
                } else {
                  this.onThisWeekCellChanged(index, undefined, 'taskId');
                  this.onThisWeekCellChanged(index, undefined, 'taskName');
                  this.onThisWeekCellChanged(index, undefined, 'activityId');
                  this.onThisWeekCellChanged(index, [], 'activityList');
                }
              }}
              onChange={e => {
                this.onThisWeekCellChanged(index, e, 'planId');
              }}
            />
          ),
        },
        {
          title: '任务', // 初始化 填写
          dataIndex: 'taskName',
          width: 200,
          fixed: 'left',
          required: true,
          render: (value, row, index) => {
            if (!isNil(row.planId) && !isEmpty(row.planId)) {
              return value;
            }
            return (
              <Input.TextArea
                value={value}
                onChange={e => {
                  this.onThisWeekCellChanged(index, e.target.value, 'taskName');
                }}
                autosize={{ minRows: 1, maxRows: 3 }}
                placeholder="请输入任务"
                disabled={!isNil(row.planId) && !isEmpty(row.planId)}
              />
            );
          },
        },
        {
          title: '执行状态',
          dataIndex: 'actStatus',
          width: 100,
          required: true,
          render: (value, row, index) => (
            <Selection.UDC
              className="x-fill-100"
              value={value}
              code="COM:ACT_STATUS"
              showSearch
              onChange={e => {
                this.onThisWeekCellChanged(index, e, 'actStatus');
              }}
            />
          ),
        },
        {
          title: `周一(${moment(formData.thisWeekStartDate)
            .add(0, 'days')
            .format('MM-DD')})`,
          dataIndex: 'workDesc1',
          width: 200,
          render: (value, row, index) => (
            <Input.TextArea
              value={value}
              onChange={e => {
                this.onThisWeekCellChanged(index, e.target.value, 'workDesc1');
              }}
              autosize={{ minRows: 1, maxRows: 3 }}
            />
          ),
        },
        {
          title: `周二(${moment(formData.thisWeekStartDate)
            .add(1, 'days')
            .format('MM-DD')})`,
          dataIndex: 'workDesc2',
          width: 200,
          render: (value, row, index) => (
            <Input.TextArea
              value={value}
              onChange={e => {
                this.onThisWeekCellChanged(index, e.target.value, 'workDesc2');
              }}
              autosize={{ minRows: 1, maxRows: 3 }}
            />
          ),
        },
        {
          title: `周三(${moment(formData.thisWeekStartDate)
            .add(2, 'days')
            .format('MM-DD')})`,
          dataIndex: 'workDesc3',
          width: 200,
          render: (value, row, index) => (
            <Input.TextArea
              value={value}
              onChange={e => {
                this.onThisWeekCellChanged(index, e.target.value, 'workDesc3');
              }}
              autosize={{ minRows: 1, maxRows: 3 }}
            />
          ),
        },
        {
          title: `周四(${moment(formData.thisWeekStartDate)
            .add(3, 'days')
            .format('MM-DD')})`,
          dataIndex: 'workDesc4',
          width: 200,
          render: (value, row, index) => (
            <Input.TextArea
              value={value}
              onChange={e => {
                this.onThisWeekCellChanged(index, e.target.value, 'workDesc4');
              }}
              autosize={{ minRows: 1, maxRows: 3 }}
            />
          ),
        },
        {
          title: `周五(${moment(formData.thisWeekStartDate)
            .add(4, 'days')
            .format('MM-DD')})`,
          dataIndex: 'workDesc5',
          width: 200,
          render: (value, row, index) => (
            <Input.TextArea
              value={value}
              onChange={e => {
                this.onThisWeekCellChanged(index, e.target.value, 'workDesc5');
              }}
              autosize={{ minRows: 1, maxRows: 3 }}
            />
          ),
        },
        {
          title: `周六(${moment(formData.thisWeekStartDate)
            .add(5, 'days')
            .format('MM-DD')})`,
          dataIndex: 'workDesc6',
          width: 200,
          render: (value, row, index) => (
            <Input.TextArea
              value={value}
              onChange={e => {
                this.onThisWeekCellChanged(index, e.target.value, 'workDesc6');
              }}
              autosize={{ minRows: 1, maxRows: 3 }}
            />
          ),
        },
        {
          title: `周日(${moment(formData.thisWeekStartDate)
            .add(6, 'days')
            .format('MM-DD')})`,
          dataIndex: 'workDesc7',
          width: 200,
          render: (value, row, index) => (
            <Input.TextArea
              value={value}
              onChange={e => {
                this.onThisWeekCellChanged(index, e.target.value, 'workDesc7');
              }}
              autosize={{ minRows: 1, maxRows: 3 }}
            />
          ),
        },
        {
          title: '相关任务包',
          dataIndex: 'taskId',
          width: 400,
          render: (value, row, index) => (
            <Selection
              className="x-fill-100"
              value={value}
              source={taskAllList}
              dropdownMatchSelectWidth={false}
              showSearch
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择相关任务包"
              onChange={e => {
                this.onThisWeekCellChanged(index, e, 'taskId');
                if (value) {
                  dispatch({
                    type: `${DOMAIN}/activity`,
                    payload: { taskId: e },
                  }).then(res => {
                    this.onThisWeekCellChanged(index, res, 'activityList');
                  });
                }
                this.onThisWeekCellChanged(index, null, 'activityId');
              }}
              disabled={!isNil(row.planId) && !isEmpty(row.planId)}
            />
          ),
        },
        {
          title: '相关活动',
          dataIndex: 'activityId',
          width: 200,
          render: (value, row, index) => (
            <Selection.Columns
              className="x-fill-100"
              value={value}
              source={row.activityList}
              dropdownMatchSelectWidth={false}
              showSearch
              columns={activityColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择相关活动"
              onColumnsChange={e => {}}
              onChange={e => {
                this.onThisWeekCellChanged(index, e, 'activityId');
              }}
              disabled={!isNil(row.planId) && !isEmpty(row.planId)}
            />
          ),
        },
      ],
      buttons: [
        {
          key: 'exportWeekPlan',
          title: '导入工作计划',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            dispatch({
              type: `${DOMAIN}/getWorkReport`,
              payload: {
                dateFrom: formData.thisWeekStartDate,
              },
            });
          },
        },
        {
          key: 'exportWeekly',
          title: '导入工作说明(从工时填报)',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            dispatch({
              type: `${DOMAIN}/queryTimeSheetsList`,
              payload: {
                workDateFrom: formData.weekStartDate,
                workDateTo: moment(formData.weekStartDate)
                  .endOf('week')
                  .format('YYYY-MM-DD'),
              },
            });
          },
        },
      ],
    };

    const weekPlanTableProps = {
      title: () => (
        <span>
          <span>
            期间：
            {nextWeek.period}
          </span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span>
            年周：
            {nextWeek.yearWeek}
          </span>
        </span>
      ),
      sortBy: 'id',
      rowKey: 'id',
      loading: false,
      dataSource: nextWeekList,
      scroll: { x: 1750 },
      rowSelection: {
        selectedRowKeys: 0,
        onChange: (selectedRowKeys, selectedRows) => {},
      },
      onAdd: newRow => {
        // eslint-disable-next-line
        delete newRow.undefined;
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            nextWeekList: update(nextWeekList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  planId: undefined,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = nextWeekList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            nextWeekList: newDataSource,
            nextWeekDelList: [...nextWeekDelList, ...selectedRowKeys],
          },
        });
      },
      onCopyItem: copied => {
        const newDataSource = copied.map(item => ({
          ...item,
          id: genFakeId(-1),
          // planId: undefined,
        }));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { nextWeekList: update(nextWeekList, { $push: newDataSource }) },
        });
      },
      columns: [
        {
          title: '工作计划',
          dataIndex: 'planId',
          width: 150,
          fixed: 'left',
          render: (value, row, index) => (
            <Selection.Columns
              className="x-fill-100"
              value={value}
              source={workPlanList}
              dropdownMatchSelectWidth={false}
              columns={workPlanColumns}
              showSearch
              transfer={{ key: 'id', code: 'id', name: 'planNo' }}
              placeholder="请选择工作计划"
              onColumnsChange={e => {
                const activityList = Array.isArray(e.activityList) ? e.activityList : [];
                this.onNextWeekCellChanged(index, e.taskId, 'taskId');
                this.onNextWeekCellChanged(index, e.taskName, 'taskName');
                this.onNextWeekCellChanged(index, e.activityId, 'activityId');
                this.onNextWeekCellChanged(index, activityList, 'activityList');
              }}
              onChange={e => {
                this.onNextWeekCellChanged(index, e, 'planId');
              }}
            />
          ),
        },
        {
          title: '任务', // 初始化 填写
          dataIndex: 'taskName',
          width: 200,
          fixed: 'left',
          required: true,
          render: (value, row, index) => {
            if (!isNil(row.planId) && !isEmpty(row.planId)) {
              return <span>{value}</span>;
              // return value && value.length > 10 ? (
              //   <Tooltip placement="left" title={<pre>{value}</pre>}>
              //     <span>{`${value.substr(0, 10)}...`}</span>
              //   </Tooltip>
              // ) : (
              //   <span>{value}</span>
              // );
            }
            return (
              <Input.TextArea
                value={value}
                onChange={e => {
                  this.onNextWeekCellChanged(index, e.target.value, 'taskName');
                }}
                autosize={{ minRows: 1, maxRows: 3 }}
                placeholder="请输入任务"
                disabled={!isNil(row.planId) && !isEmpty(row.planId)}
              />
            );
          },
        },

        {
          title: `周一(${moment(formData.nextWeekStartDate)
            .add(0, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag11',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag11');
                  }}
                />
              ),
            },
            {
              title: '下',
              dataIndex: 'planFlag12',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag12');
                  }}
                />
              ),
            },
            {
              title: '晚',
              dataIndex: 'planFlag13',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag13');
                  }}
                />
              ),
            },
          ],
        },
        {
          title: `周二(${moment(formData.nextWeekStartDate)
            .add(1, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag21',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag21');
                  }}
                />
              ),
            },
            {
              title: '下',
              dataIndex: 'planFlag22',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag22');
                  }}
                />
              ),
            },
            {
              title: '晚',
              dataIndex: 'planFlag23',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag23');
                  }}
                />
              ),
            },
          ],
        },
        {
          title: `周三(${moment(formData.nextWeekStartDate)
            .add(2, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag31',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag31');
                  }}
                />
              ),
            },
            {
              title: '下',
              dataIndex: 'planFlag32',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag32');
                  }}
                />
              ),
            },
            {
              title: '晚',
              dataIndex: 'planFlag33',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag33');
                  }}
                />
              ),
            },
          ],
        },
        {
          title: `周四(${moment(formData.nextWeekStartDate)
            .add(3, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag41',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag41');
                  }}
                />
              ),
            },
            {
              title: '下',
              dataIndex: 'planFlag42',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag42');
                  }}
                />
              ),
            },
            {
              title: '晚',
              dataIndex: 'planFlag43',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag43');
                  }}
                />
              ),
            },
          ],
        },
        {
          title: `周五(${moment(formData.nextWeekStartDate)
            .add(4, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag51',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag51');
                  }}
                />
              ),
            },
            {
              title: '下',
              dataIndex: 'planFlag52',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag52');
                  }}
                />
              ),
            },
            {
              title: '晚',
              dataIndex: 'planFlag53',
              align: 'center',
              render: (value, row, index) => (
                <Checkbox
                  checked={Number(value) === 1}
                  onChange={e => {
                    const values = e.target.checked ? 1 : 0;
                    this.onNextWeekCellChanged(index, values, 'planFlag53');
                  }}
                />
              ),
            },
          ],
        },
        {
          title: `周六(${moment(formData.nextWeekStartDate)
            .add(5, 'days')
            .format('MM-DD')})`,
          dataIndex: 'planFlag6',
          width: 100,
          align: 'center',
          render: (value, row, index) => (
            <Checkbox
              checked={Number(value) === 1}
              onChange={e => {
                const values = e.target.checked ? 1 : 0;
                this.onNextWeekCellChanged(index, values, 'planFlag6');
              }}
            />
          ),
        },
        {
          title: `周日(${moment(formData.nextWeekStartDate)
            .add(6, 'days')
            .format('MM-DD')})`,
          dataIndex: 'planFlag7',
          width: 100,
          align: 'center',
          render: (value, row, index) => (
            <Checkbox
              checked={Number(value) === 1}
              onChange={e => {
                const values = e.target.checked ? 1 : 0;
                this.onNextWeekCellChanged(index, values, 'planFlag7');
              }}
            />
          ),
        },
        {
          title: '相关任务包',
          dataIndex: 'taskId',
          width: 200,
          render: (value, row, index) => (
            <Selection
              className="x-fill-100"
              value={value}
              source={taskAllList}
              dropdownMatchSelectWidth={false}
              showSearch
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择相关任务包"
              onChange={e => {
                this.onNextWeekCellChanged(index, e, 'taskId');
                if (value) {
                  dispatch({
                    type: `${DOMAIN}/activity`,
                    payload: { taskId: e },
                  }).then(res => {
                    this.onNextWeekCellChanged(index, res, 'activityList');
                  });
                }
                this.onNextWeekCellChanged(index, null, 'activityId');
              }}
              disabled={!isNil(row.planId) && !isEmpty(row.planId)}
            />
          ),
        },
        {
          title: '相关活动',
          dataIndex: 'activityId',
          width: 200,
          render: (value, row, index) => (
            <Selection
              className="x-fill-100"
              value={value}
              source={row.activityList}
              dropdownMatchSelectWidth={false}
              showSearch
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择相关活动"
              onColumnsChange={e => {}}
              onChange={e => {
                this.onNextWeekCellChanged(index, e, 'activityId');
              }}
              disabled={!isNil(row.planId) && !isEmpty(row.planId)}
            />
          ),
        },
      ],
      buttons: [
        {
          key: 'exportWeekPlan',
          title: '导入工作计划',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            dispatch({
              type: `${DOMAIN}/getWorkPlan`,
              payload: {
                dateFrom: formData.nextWeekStartDate,
              },
            });
          },
        },
      ],
    };
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={e => this.handleSubmit('save')}
            disabled={submitBtn || detailBtn}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className="tw-btn-primary"
            icon="upload"
            size="large"
            onClick={e => {
              // 做表格必填校验
              if (!this.required()) {
                return;
              }
              this.toggleVisible();
            }}
            disabled={submitBtn || detailBtn}
          >
            汇报
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="周报填写" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="weekStartDate"
              label="周报开始日(周一)"
              decorator={{
                initialValue: moment(formData.thisWeekStartDate) || undefined,
              }}
            >
              <DatePicker
                // value={moment}
                // 只能选周一
                disabledDate={current =>
                  moment(current).format('YYYY-MM-DD') !==
                  moment(current)
                    .startOf('week')
                    .format('YYYY-MM-DD')
                }
                onChange={value => value && this.fetchDate(value)}
                allowClear={false}
              />
            </Field>
          </FieldList>

          <Divider dashed />

          <FieldList
            legend="周报"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            noReactive
          >
            <EditableDataTable {...weeklyTableProps} />
          </FieldList>

          <Divider dashed />

          <FieldList
            legend="周计划"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            noReactive
          >
            <EditableDataTable {...weekPlanTableProps} />
          </FieldList>
        </Card>

        <Modal
          centered
          title="请选择汇报对象"
          visible={visible}
          onOk={e => {
            this.setState(
              {
                confirmLoading: true,
              },
              () => {
                this.handleSubmit('report');
              }
            );
          }}
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
          width={800}
          destroyOnClose
          okButtonProps={{ disabled: submitBtn }}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
            <Field
              name="reportedResId"
              label="汇报对象"
              decorator={{
                initialValue: formData.reportedResId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择汇报对象',
                  },
                ],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resDataSource}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                onChange={e => {
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      reportedResId: e,
                    },
                  });
                }}
                placeholder="请选择汇报对象"
                mode="multiple"
              />
            </Field>
          </FieldList>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default MakeWeeklyReport;
