import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import { Button, Card, Form, Input, Radio, InputNumber } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const activityColumns = [
  { dataIndex: 'actNo', title: '编号', span: 8 },
  { dataIndex: 'actName', title: '名称', span: 16 },
];

/* TIPS fromFlag
WORK:从工作计划进到页面 计划类型不可选择 默认选中工作计划
VACATION:从假期相关进到页面 计划类型不可选择 默认选中休假计划
ALL:不明类型工作计划进到页面 计划类型可选择 默认工作计划
fromPage: calendar:从日历页面过来 有一些保存成功后的操作以及计划类型是否可选有一些不同的处理
*/

const DOMAIN = 'workPlan';

@connect(({ loading, workPlan, dispatch, user }) => ({
  loading,
  workPlan,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    const { activityId, taskId } = changedValues;
    if (activityId) {
      // eslint-disable-next-line
      changedValues.activityId = Number(activityId);
    }
    if (taskId) {
      // eslint-disable-next-line
      changedValues.taskId = Number(taskId);
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
class WorkPlanEdit extends PureComponent {
  state = {
    taskRequest: true,
    fromFlag: 'WORK',
    dates: ['', ''],
    fromPage: '',
  };

  componentDidMount() {
    const {
      dispatch,
      user: {
        user: {
          extInfo: { resId },
        },
      },
    } = this.props;
    const {
      id,
      copy,
      fromFlag = 'WORK',
      dateFrom = '',
      dateTo = '',
      fromPage = '',
      buResId = '',
    } = fromQs();
    const dates = [dateFrom, dateTo];
    const taskRequest = fromFlag !== 'VACATION';
    this.setState({
      fromFlag,
      dates,
      fromPage,
      taskRequest,
    });
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/taskAll`, payload: { resId } });
    // 有id，修改
    id &&
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: {
          id,
        },
      }).then(res => {
        const { taskId } = res;
        taskId && dispatch({ type: `${DOMAIN}/activity`, payload: { taskId } });

        if (copy) {
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              id: null,
              taskId: undefined,
              activityId: undefined,
              remark1: undefined,
              remark2: undefined,
            },
          });
        }
      });
    // 无id，新建，执行人默认当前登录人
    !id &&
      !buResId &&
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          planResId: resId,
        },
      });
    // 无id，新建，汇报人默认为直属领导
    !id &&
      !buResId &&
      dispatch({
        type: `${DOMAIN}/getPResInfo`,
      });
    // 日历到当前页面带有日期时
    if (dateFrom) {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          dates,
        },
      });
    }
    // 带有resId 跳到编辑页面
    if (buResId) {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          planResId: parseInt(buResId, 10),
        },
      });
      dispatch({
        type: `${DOMAIN}/getPResInfo`,
        payload: {
          resId: buResId,
        },
      });
    }
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll, setFields },
      workPlan: {
        searchForm,
        formData: { dates },
      },
      dispatch,
    } = this.props;
    const { fromPage } = this.state;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (isEmpty(dates) || isNil(dates)) {
          setFields({
            dates: {
              value: undefined,
              errors: [new Error('请选择计划开始/结束日')],
            },
          });
          return;
        }
        const { id, copy } = fromQs();
        if (copy) {
          dispatch({
            type: `${DOMAIN}/save`,
          }).then(response => {
            if (response.ok) {
              createMessage({ type: 'success', description: '操作成功' });
              closeThenGoto('/user/weeklyReport/workPlan?_refresh=0');
              dispatch({ type: `workPlan/query`, payload: searchForm });
            } else {
              createMessage({ type: 'error', description: response.reason || '操作失败' });
            }
          });
          return;
        }
        if (id) {
          dispatch({
            type: `${DOMAIN}/edit`,
          }).then(response => {
            if (response.ok) {
              createMessage({ type: 'success', description: '操作成功' });
              if (fromPage !== 'calendar') {
                closeThenGoto('/user/weeklyReport/workPlan?_refresh=0');
                dispatch({ type: `workPlan/query`, payload: searchForm });
              } else {
                closeThenGoto('/user/weeklyReport/workCalendar?_refresh=0');
              }
            } else {
              createMessage({ type: 'error', description: response.reason || '操作失败' });
            }
          });
        } else {
          dispatch({
            type: `${DOMAIN}/save`,
          }).then(response => {
            if (response.ok) {
              createMessage({ type: 'success', description: '操作成功' });
              if (fromPage !== 'calendar') {
                closeThenGoto('/user/weeklyReport/workPlan?_refresh=0');
                dispatch({ type: `workPlan/query`, payload: searchForm });
              } else {
                closeThenGoto('/user/weeklyReport/workCalendar?_refresh=0');
              }
            } else {
              createMessage({ type: 'error', description: response.reason || '操作失败' });
            }
          });
        }
      }
    });
  };

  radioChange = val => {
    this.setState({
      taskRequest: val.target.value !== 'VACATION',
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      workPlan: { formData, resDataSource, taskAllList, activityList },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const submitBtn = loading.effects[`${DOMAIN}/submit`];
    const queryBtn = loading.effects[`${DOMAIN}/queryDetail`];
    const editBtn = loading.effects[`${DOMAIN}/edit`];

    const { taskRequest } = this.state;
    const { fromFlag, dates, fromPage } = this.state; // WORK VACATION ALL TODO
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            disabled={submitBtn || editBtn || queryBtn}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="工作计划维护" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <FieldLine label="编号/优先级">
              <Field
                name="planNo"
                wrapperCol={{ span: 23, xxl: 23 }}
                decorator={{
                  initialValue: formData.planNo || '',
                }}
              >
                <Input placeholder="请输入编号" />
              </Field>
              <Field
                name="priority"
                wrapperCol={{ span: 23, xxl: 23 }}
                decorator={{
                  initialValue: formData.priority || '',
                }}
              >
                <InputNumber min={0} placeholder="请输入优先级" className="x-fill-100" />
              </Field>
            </FieldLine>

            {taskRequest ? (
              <Field
                name="taskName"
                label="任务"
                decorator={{
                  initialValue: formData.taskName || '',
                  rules: [
                    {
                      required: formData.taskNameDisabled === 1 || false,
                      message: '请输入任务',
                    },
                  ],
                }}
              >
                <Input placeholder="请输入任务" />
              </Field>
            ) : (
              <Field
                name="taskName"
                label="任务"
                decorator={{
                  initialValue: formData.taskName || '',
                }}
              >
                <Input placeholder="请输入任务" />
              </Field>
            )}

            <Field
              name="dates"
              label="计划开始/结束日"
              decorator={{
                initialValue: formData.dates ? formData.dates : dates,
                rules: [
                  {
                    required: true,
                    message: '请选择计划开始/结束日',
                  },
                ],
              }}
            >
              <DatePicker.RangePicker className="x-fill-100" format="YYYY-MM-DD" />
            </Field>
            <Field
              name="planStatus"
              label="状态"
              decorator={{
                initialValue: formData.planStatus || undefined,
              }}
            >
              <RadioGroup>
                <Radio value="PLAN">计划中</Radio>
                <Radio value="FINISHED">已完成</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="taskId"
              label="相关任务包"
              decorator={{
                initialValue: formData.taskId || undefined,
              }}
            >
              <Selection
                className="x-fill-100"
                source={taskAllList}
                dropdownMatchSelectWidth={false}
                showSearch
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                onColumnsChange={value => {}}
                placeholder="请选择相关任务包"
                onChange={value => {
                  if (value) {
                    dispatch({ type: `${DOMAIN}/activity`, payload: { taskId: value } });
                  } else {
                    dispatch({ type: `${DOMAIN}/updateState`, payload: { activityList: [] } });
                  }
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: { activityId: undefined },
                  });
                  setFieldsValue({
                    activityId: undefined,
                  });
                }}
              />
            </Field>
            <Field
              name="activityId"
              label="相关活动"
              decorator={{
                initialValue: formData.activityId || undefined,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={activityList}
                dropdownMatchSelectWidth={false}
                showSearch
                columns={activityColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                onChange={value => {
                  if (isNil(formData.taskName) || isEmpty(formData.taskName)) {
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        taskName: activityList.filter(v => v.id === Number(value))[0].name,
                      },
                    });
                  }
                }}
                placeholder="请选择相关活动"
              />
            </Field>
            <Field
              name="planResId"
              label="执行人"
              decorator={{
                initialValue: formData.planResId || undefined,
                rules: [
                  {
                    required: fromFlag === 'WORK',
                    message: '请选择执行人',
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
                onColumnsChange={value => {
                  if (value) {
                    dispatch({
                      type: `${DOMAIN}/getPResInfo`,
                      payload: {
                        resId: value.id,
                      },
                    });
                  } else {
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        reportedResId: [],
                      },
                    });
                  }
                }}
                placeholder="请选择执行人"
              />
            </Field>
            <Field
              name="reportedResId"
              label="汇报对象"
              decorator={{
                initialValue: formData.reportedResId || undefined,
                rules: [
                  {
                    required: fromFlag === 'WORK',
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
                placeholder="请选择汇报对象"
                mode="multiple"
              />
            </Field>
            <Field
              name="relevantResId"
              label="相关人"
              decorator={{
                initialValue: formData.relevantResId || undefined,
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
                placeholder="请选择相关人"
                mode="multiple"
              />
            </Field>
            <Field
              name="planType"
              label="计划类型"
              decorator={{
                initialValue: fromFlag === 'ALL' ? 'WORK' : fromFlag,
              }}
            >
              <RadioGroup
                disabled={
                  (fromPage !== 'calendar' && fromFlag === 'WORK') ||
                  (fromPage !== 'calendar' && fromFlag === 'VACATION')
                }
                onChange={val => {
                  this.radioChange(val);
                }}
              >
                <Radio value="WORK">工作计划</Radio>
                <Radio value="VACATION">休假计划</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="remark1"
              label="任务备注1"
              decorator={{
                initialValue: formData.remark1 || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注1" />
            </Field>
            <Field
              name="remark2"
              label="任务备注2"
              decorator={{
                initialValue: formData.remark2 || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注2" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default WorkPlanEdit;
