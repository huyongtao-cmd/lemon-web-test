import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import { Button, Card, Form, Input, Radio, InputNumber, Switch } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { selectUsersWithBu } from '@/services/gen/list';
import Loading from '@/components/core/DataLoading';

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

const DOMAIN = 'workPlanChntEdit';

@connect(({ loading, workPlanChntEdit, workPlanChnt, dispatch, user }) => ({
  loading,
  workPlanChntEdit,
  dispatch,
  user,
  workPlanChnt,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.workPlanChntEdit;
    const fields = {};
    Object.keys(formData).forEach(key => {
      fields[key] = Form.createFormField(formData[key]);
    });
    return fields;
  },
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class WorkPlanChntEdit extends PureComponent {
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
    const { id, copy, dateFrom = '', dateTo = '', fromPage = '', buResId = '' } = fromQs();
    const dates = [dateFrom, dateTo];
    this.setState({
      dates,
      fromPage,
    });
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/taskAll`, payload: { resId } });
    dispatch({ type: `${DOMAIN}/objectiveAll` });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'WORK_PLAN_EDIT' },
    });
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
              planStatus: 'PLAN',
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
      workPlanChntEdit: {
        formData: { dates },
      },
      workPlanChnt: { searchForm },
      dispatch,
    } = this.props;
    const { fromPage } = this.state;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (isEmpty(dates) || isNil(dates)) {
          setFields({
            dates: {
              value: undefined,
              errors: [new Error('请选择日期范围')],
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
              closeThenGoto('/okr/okrMgmt/workPlanChnt?_refresh=0');
              dispatch({ type: `workPlanChnt/query`, payload: searchForm });
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
                closeThenGoto('/okr/okrMgmt/workPlanChnt?_refresh=0');
                dispatch({ type: `workPlanChnt/query`, payload: searchForm });
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
                closeThenGoto('/okr/okrMgmt/workPlanChnt?_refresh=0');
                dispatch({ type: `workPlanChnt/query`, payload: searchForm });
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

  // 配置所需要的内容
  renderPage = () => {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, getFieldValue },
      workPlanChntEdit: {
        formData,
        resDataSource,
        baseBuDataSource,
        objectiveList,
        pageConfig,
        taskAllList,
        activityList,
      },
    } = this.props;
    const { fromFlag, dates } = this.state;
    if (pageConfig) {
      if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
        return <div />;
      }
      const currentBlockConfig = pageConfig.pageBlockViews[0];
      const { pageFieldViews } = currentBlockConfig;
      const pageFieldJson = {};
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const {
        taskName = {},
        planNo = {},
        priority = {},
        dateFrom = {},
        dateTo = {},
        planStatus = {},
        taskId = {},
        activityId = {},
        planResId = {},
        reportedResId = {},
        relevantResId = {},
        planType = {},
        remark1 = {},
        remark2 = {},
        objectiveId = {},
        projectNature = {},
        majorWorkItems = {},
        completionCriteria = {},
        completionTime = {},
        responsibilityBuId = {},
        responsibilityResId = {},
        cooperateResId = {},
        checkResId = {},
        developmentSituation = {},
        developmentStatus = {},
        existingProblem = {},
        resultsEvaluation = {},
        emphasisAttention = {},
      } = pageFieldJson;
      const fields = [
        <FieldLine
          label={planNo.displayName}
          key="planNo"
          required={planNo.requiredFlag}
          sortNo={planNo.sortNo}
        >
          <Field
            name="planNo"
            key="planNo"
            wrapperCol={{ span: 23, xxl: 23 }}
            decorator={{
              initialValue: formData.planNo,
              rules: [{ required: !!planNo.requiredFlag, message: `请输入${planNo.displayName}` }],
            }}
          >
            <Input placeholder={`请输入${planNo.displayName}`} />
          </Field>
          <Field
            name="priority"
            key="priority"
            wrapperCol={{ span: 23, xxl: 23 }}
            decorator={{
              initialValue: formData.priority,
              rules: [
                { required: !!planNo.requiredFlag, message: `请输入${priority.displayName}` },
              ],
            }}
          >
            <InputNumber
              min={0}
              placeholder={`请输入${priority.displayName}`}
              className="x-fill-100"
            />
          </Field>
        </FieldLine>,
        <Field
          name="taskName"
          key="taskName"
          label={taskName.displayName}
          sortNo={taskName.sortNo}
          decorator={{
            initialValue: formData.taskName,
            rules: [
              {
                required: !!taskName.requiredFlag,
                message: `请输入${taskName.displayName}`,
              },
            ],
          }}
        >
          <Input placeholder={`请输入${taskName.displayName}`} />
        </Field>,
        <Field
          name="dates"
          key="dateFrom"
          label={dateFrom.displayName}
          sortNo={dateFrom.sortNo}
          decorator={{
            initialValue: formData.dates ? formData.dates : dates,
            rules: [
              {
                required: !!dateFrom.requiredFlag,
                message: `请输入${dateFrom.displayName}`,
              },
            ],
          }}
        >
          <DatePicker.RangePicker className="x-fill-100" format="YYYY-MM-DD" />
        </Field>,
        <Field
          name="planStatus"
          key="planStatus"
          label={planStatus.displayName}
          sortNo={planStatus.sortNo}
          decorator={{
            initialValue: formData.planStatus,
            rules: [
              {
                required: !!planStatus.requiredFlag,
                message: `请输入${planStatus.displayName}`,
              },
            ],
          }}
        >
          <RadioGroup>
            <Radio value="PLAN">计划中</Radio>
            <Radio value="FINISHED">已完成</Radio>
          </RadioGroup>
        </Field>,
        <Field
          name="taskId"
          key="taskId"
          label={taskId.displayName}
          sortNo={taskId.sortNo}
          decorator={{
            initialValue: formData.taskId,
            rules: [
              {
                required: !!taskId.requiredFlag,
                message: `请输入${taskId.displayName}`,
              },
            ],
          }}
        >
          <Selection
            className="x-fill-100"
            source={taskAllList}
            dropdownMatchSelectWidth={false}
            showSearch
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            onColumnsChange={value => {}}
            placeholder={`请输入${taskId.displayName}`}
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
            }}
          />
        </Field>,
        <Field
          name="activityId"
          key="activityId"
          label={activityId.displayName}
          sortNo={activityId.sortNo}
          decorator={{
            initialValue: formData.activityId,
            rules: [
              {
                required: !!activityId.requiredFlag,
                message: `请输入${activityId.displayName}`,
              },
            ],
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
            placeholder={`请输入${activityId.displayName}`}
          />
        </Field>,
        <Field
          name="planResId"
          key="planResId"
          label={planResId.displayName}
          sortNo={planResId.sortNo}
          decorator={{
            initialValue: Number(formData.planResId) || '',
            rules: [
              {
                required: !!planResId.requiredFlag,
                message: `请输入${planResId.displayName}`,
              },
            ],
          }}
        >
          <Selection.Columns
            className="x-fill-100"
            source={() => selectUsersWithBu()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            placeholder={`请选择${planResId.displayName}`}
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
            limit={20}
          />
        </Field>,
        <Field
          name="reportedResId"
          key="reportedResId"
          label={reportedResId.displayName}
          sortNo={reportedResId.sortNo}
          decorator={{
            initialValue: formData.reportedResId,
            rules: [
              {
                required: !!reportedResId.requiredFlag,
                message: `请输入${reportedResId.displayName}`,
              },
            ],
          }}
        >
          <Selection.Columns
            className="x-fill-100"
            source={() => selectUsersWithBu()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            placeholder={`请选择${reportedResId.displayName}`}
            mode="multiple"
            limit={20}
          />
        </Field>,
        <Field
          name="relevantResId"
          key="relevantResId"
          label={relevantResId.displayName}
          sortNo={relevantResId.sortNo}
          decorator={{
            initialValue: formData.relevantResId,
            rules: [
              {
                required: !!relevantResId.requiredFlag,
                message: `请输入${relevantResId.displayName}`,
              },
            ],
          }}
        >
          <Selection.Columns
            className="x-fill-100"
            source={() => selectUsersWithBu()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            placeholder={`请选择${relevantResId.displayName}`}
            mode="multiple"
            limit={20}
          />
        </Field>,
        <Field
          name="planType"
          key="planType"
          label={planType.displayName}
          sortNo={planType.sortNo}
          decorator={{
            initialValue: formData.planType,
            rules: [
              {
                required: !!planType.requiredFlag,
                message: `请输入${planType.displayName}`,
              },
            ],
          }}
        >
          <RadioGroup>
            <Radio value="WORK">工作计划</Radio>
            <Radio value="VACATION">休假计划</Radio>
          </RadioGroup>
        </Field>,
        <Field
          name="remark1"
          key="remark1"
          label={remark1.displayName}
          sortNo={remark1.sortNo}
          decorator={{
            initialValue: formData.remark1 || '',
            rules: [
              {
                required: !!remark1.requiredFlag,
                message: `请输入${remark1.displayName}`,
              },
            ],
          }}
        >
          <Input.TextArea rows={3} placeholder={`请选择${remark1.displayName}`} />
        </Field>,
        <Field
          name="remark2"
          key="remark2"
          label={remark2.displayName}
          sortNo={remark2.sortNo}
          decorator={{
            initialValue: formData.remark2,
            rules: [
              {
                required: !!remark2.requiredFlag,
                message: `请输入${remark2.displayName}`,
              },
            ],
          }}
        >
          <Input.TextArea rows={3} placeholder={`请选择${remark2.displayName}`} />
        </Field>,
        <Field
          name="objectiveId"
          key="objectiveId"
          label={objectiveId.displayName}
          sortNo={objectiveId.sortNo}
          decorator={{
            initialValue: formData.objectiveId,
            rules: [
              {
                required: !!objectiveId.requiredFlag,
                message: `请输入${objectiveId.displayName}`,
              },
            ],
          }}
        >
          <Selection
            key="objectiveId"
            className="x-fill-100"
            source={objectiveList}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onChange={value => {}}
            placeholder={`请选择${objectiveId.displayName}`}
          />
        </Field>,
        <Field
          name="projectNature"
          key="projectNature"
          label={projectNature.displayName}
          sortNo={projectNature.sortNo}
          decorator={{
            initialValue: formData.projectNature,
            rules: [
              {
                required: !!projectNature.requiredFlag,
                message: `请输入${projectNature.displayName}`,
              },
            ],
          }}
        >
          <Input placeholder={`请输入${projectNature.displayName}`} />
        </Field>,
        <Field
          name="majorWorkItems"
          key="majorWorkItems"
          label={majorWorkItems.displayName}
          sortNo={majorWorkItems.sortNo}
          decorator={{
            initialValue: formData.majorWorkItems,
            rules: [
              {
                required: !!majorWorkItems.requiredFlag,
                message: `请输入${majorWorkItems.displayName}`,
              },
            ],
          }}
        >
          <Input.TextArea rows={3} placeholder={`请输入${majorWorkItems.displayName}`} />
        </Field>,
        <Field
          name="completionCriteria"
          key="completionCriteria"
          label={completionCriteria.displayName}
          sortNo={completionCriteria.sortNo}
          decorator={{
            initialValue: formData.completionCriteria,
            rules: [
              {
                required: !!completionCriteria.requiredFlag,
                message: `请输入${completionCriteria.displayName}`,
              },
            ],
          }}
        >
          <Input.TextArea rows={3} placeholder={`请输入${completionCriteria.displayName}`} />
        </Field>,
        <Field
          name="completionTime"
          key="completionTime"
          label={completionTime.displayName}
          sortNo={completionTime.sortNo}
          decorator={{
            initialValue: formData.completionTime,
            rules: [
              {
                required: !!completionTime.requiredFlag,
                message: `请选择${completionTime.displayName}`,
              },
            ],
          }}
        >
          <DatePicker className="x-fill-100" format="YYYY-MM-DD" />
        </Field>,
        <Field
          name="responsibilityBuId"
          key="responsibilityBuId"
          label={responsibilityBuId.displayName}
          sortNo={responsibilityBuId.sortNo}
          decorator={{
            initialValue: formData.responsibilityBuId,
            rules: [
              {
                required: !!responsibilityBuId.requiredFlag,
                message: `请选择${responsibilityBuId.displayName}`,
              },
            ],
          }}
        >
          <Selection.Columns
            className="x-fill-100"
            source={baseBuDataSource}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${responsibilityBuId.displayName}`}
            limit={20}
          />
        </Field>,
        <Field
          name="responsibilityResId"
          key="responsibilityResId"
          label={responsibilityResId.displayName}
          sortNo={responsibilityResId.sortNo}
          decorator={{
            initialValue: formData.responsibilityResId,
            rules: [
              {
                required: !!responsibilityResId.requiredFlag,
                message: `请选择${responsibilityResId.displayName}`,
              },
            ],
          }}
        >
          <Selection.Columns
            className="x-fill-100"
            source={() => selectUsersWithBu()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            placeholder={`请选择${pageFieldJson.responsibilityResId.displayName}`}
            limit={20}
          />
        </Field>,
        <Field
          name="cooperateResId"
          key="cooperateResId"
          label={cooperateResId.displayName}
          sortNo={cooperateResId.sortNo}
          decorator={{
            initialValue: formData.cooperateResId,
            rules: [
              {
                required: !!cooperateResId.requiredFlag,
                message: `请选择${cooperateResId.displayName}`,
              },
            ],
          }}
        >
          <Selection.Columns
            className="x-fill-100"
            source={() => selectUsersWithBu()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            placeholder={`请选择${cooperateResId.displayName}`}
            limit={20}
          />
        </Field>,
        <Field
          name="checkResId"
          key="checkResId"
          label={checkResId.displayName}
          sortNo={checkResId.sortNo}
          decorator={{
            initialValue: formData.checkResId,
            rules: [
              {
                required: !!checkResId.requiredFlag,
                message: `请选择${checkResId.displayName}`,
              },
            ],
          }}
        >
          <Selection.Columns
            className="x-fill-100"
            source={() => selectUsersWithBu()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            placeholder={`请选择${checkResId.displayName}`}
            limit={20}
          />
        </Field>,
        <Field
          name="developmentSituation"
          key="developmentSituation"
          label={developmentSituation.displayName}
          sortNo={developmentSituation.sortNo}
          decorator={{
            initialValue: formData.developmentSituation,
            rules: [
              {
                required: !!developmentSituation.requiredFlag,
                message: `请输入${developmentSituation.displayName}`,
              },
            ],
          }}
        >
          <Input.TextArea rows={3} placeholder={`请输入${developmentSituation.displayName}`} />
        </Field>,
        <Field
          name="developmentStatus"
          key="developmentStatus"
          label={developmentStatus.displayName}
          sortNo={developmentStatus.sortNo}
          decorator={{
            initialValue: formData.developmentStatus,
            rules: [
              {
                required: !!developmentStatus.requiredFlag,
                message: `请输入${developmentStatus.displayName}`,
              },
            ],
          }}
        >
          <Selection.UDC
            code="ACC:DEVELOPMENT_STATUS"
            placeholder={`请输入${developmentStatus.displayName}`}
          />
        </Field>,
        <Field
          name="existingProblem"
          key="existingProblem"
          label={existingProblem.displayName}
          sortNo={existingProblem.sortNo}
          decorator={{
            initialValue: formData.existingProblem,
            rules: [
              {
                required: !!existingProblem.requiredFlag,
                message: `请输入${existingProblem.displayName}`,
              },
            ],
          }}
        >
          <Input.TextArea rows={3} placeholder={`请输入${existingProblem.displayName}`} />
        </Field>,
        <Field
          name="resultsEvaluation"
          key="resultsEvaluation"
          label={resultsEvaluation.displayName}
          sortNo={resultsEvaluation.sortNo}
          decorator={{
            initialValue: formData.resultsEvaluation,
            rules: [
              {
                required: !!resultsEvaluation.requiredFlag,
                message: `请选择${resultsEvaluation.displayName}`,
              },
            ],
          }}
        >
          <Selection.UDC
            code="ACC:RESULTS_EVALUATION"
            placeholder={`请选择${resultsEvaluation.displayName}`}
          />
        </Field>,
        <Field
          name="emphasisAttention"
          key="emphasisAttention"
          label={emphasisAttention.displayName}
          sortNo={emphasisAttention.sortNo}
          decorator={{
            initialValue: formData.emphasisAttention,
            rules: [
              {
                required: !!emphasisAttention.requiredFlag,
                message: `请选择${emphasisAttention.displayName}`,
              },
            ],
          }}
        >
          <RadioGroup
            onChange={e => {
              formData.emphasisAttention = e.target.value;
            }}
          >
            <Radio value={1}>是</Radio>
            <Radio value={0}>否</Radio>
          </RadioGroup>
        </Field>,
      ];
      const filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return (
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
          {filterList}
        </FieldList>
      );
    }
    return '';
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator },
      workPlanChntEdit: { formData, resDataSource, objectiveList },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const submitBtn = loading.effects[`${DOMAIN}/save`];
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
            loading={submitBtn || editBtn || queryBtn}
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
          title={<Title icon="profile" text="关键行动维护" />}
          bordered={false}
        >
          {!loading.effects[`${DOMAIN}/getPageConfig`] ? this.renderPage() : <Loading />}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default WorkPlanChntEdit;
