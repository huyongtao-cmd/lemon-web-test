import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { isEmpty, isNil, hasIn } from 'ramda';
import { Select, Card, Form, Input, Radio, Divider, Modal } from 'antd';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { pushFlowTask } from '@/services/gen/flow';
import { createConfirm } from '@/components/core/Confirm';
import { FileManagerEnhance, Selection, DatePicker } from '@/pages/gen/field';
import { selectInternalOus } from '@/services/gen/list';
import { sub, genFakeId } from '@/utils/mathUtils';
import { getUrl } from '@/utils/flowToRouter';
import { fromQs } from '@/utils/stringUtils';
import ResVacationTable from './table/ResVacationTable';
import DetailEntityTable from './table/DetailEntityTable';
import RecentResVacationTable from './table/RecentResVacationTable';
import ViewDetail from './ViewDetail';
import TaskOne from './TaskOne';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'vacationFlow';

@connect(({ loading, vacationFlow, dispatch }) => ({
  loading,
  vacationFlow,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (value || value === 0) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class VacationApplyFlow extends Component {
  componentDidMount() {
    const {
      dispatch,
      vacationFlow: {
        fieldsConfig: { taskKey },
      },
    } = this.props;
    const { id, taskId } = fromQs();

    id &&
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: { id },
      });
    taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {
              buttons: [],
              panels: {
                disabledOrHidden: {},
              },
            },
          },
        });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
  }

  render() {
    const {
      loading,
      dispatch,
      form: { validateFieldsAndScroll, getFieldDecorator, setFields },
      vacationFlow: { formData, resData, baseBuData, flowForm, fieldsConfig },
    } = this.props;

    const {
      panels: { disabledOrHidden },
      taskKey,
      buttons,
    } = fieldsConfig;
    const { id, taskId, prcId, from, mode } = fromQs();

    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { remark, branch } = bpmForm;
            const { key, branches } = operation;
            if (key === 'REJECTED') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () => {
                  pushFlowTask(taskId, {
                    remark,
                    result: key,
                    branch,
                  }).then(({ status, response }) => {
                    if (status === 200) {
                      createMessage({ type: 'success', description: '操作成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    }
                    return Promise.resolve(false);
                  });
                },
              });
            }
            if (key === 'CLOSE') {
              createConfirm({
                content: '确定要关闭该流程吗？',
                onOk: () =>
                  dispatch({
                    type: `${DOMAIN}/closeFlow`,
                    payload: {
                      prcId,
                      remark,
                    },
                  }),
              });
            }

            if (key === 'APPROVED' || key === 'APPLIED') {
              const { addFlag, addList, date } = formData;
              if (addFlag && !addList) {
                setFields({
                  addList: {
                    value: undefined,
                    errors: [new Error('请输入补充附件清单')],
                  },
                });
              }
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  if (taskKey === 'ACC_A35_01_SUBMIT_i') {
                    // 判断只有调休和年假需要勾选剩余假期
                    const {
                      maxDays,
                      vacationDays,
                      vacationId,
                      vacationType,
                      selectedVacationType,
                    } = formData;

                    if (vacationType === 'ANNUAL' || vacationType === 'IN_LIEU') {
                      if (!vacationId) {
                        createMessage({ type: 'warn', description: '请选择一条剩余假期' });
                        return;
                      }
                      if (selectedVacationType !== vacationType) {
                        createMessage({
                          type: 'warn',
                          description: '勾选剩余假期类型与所选假期类型不一致',
                        });
                        return;
                      }
                      if (maxDays < vacationDays) {
                        createMessage({
                          type: 'warn',
                          description: '请假天数不能大于所选剩余假期可用天数',
                        });
                        return;
                      }
                    }
                  }

                  if (Array.isArray(branches) && branches[0]) {
                    dispatch({
                      type: `${DOMAIN}/submit`,
                      payload: {
                        taskId,
                        result: key,
                        procRemark: remark,
                        submit: 'true',
                        branch: branches[0].code,
                      },
                    });
                  } else {
                    dispatch({
                      type: `${DOMAIN}/submit`,
                      payload: {
                        taskId,
                        result: key,
                        procRemark: remark,
                        submit: 'true',
                      },
                    });
                  }
                }
              });
            }
            return Promise.resolve(false);
          }}
        >
          {mode === 'edit' && taskKey === 'ACC_A35_01_SUBMIT_i' && <TaskOne />}
          {mode === 'edit' &&
            taskKey !== 'ACC_A35_01_SUBMIT_i' && (
              <Card
                className="tw-card-adjust"
                style={{ marginTop: '6px' }}
                title={<Title icon="profile" text="请假申请" />}
                bordered={false}
              >
                <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                  <Field
                    name="applyNo"
                    label="请假单号"
                    decorator={{
                      initialValue: formData.applyNo || '',
                    }}
                  >
                    <Input disabled placeholder="系统自动生成" />
                  </Field>
                  <Field
                    name="resId"
                    label="请假人"
                    decorator={{
                      initialValue: formData.resId || undefined,
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={resData}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      placeholder="请选择请假人"
                      disabled
                    />
                  </Field>
                  <Field
                    name="presId"
                    label="直属领导"
                    decorator={{
                      initialValue: formData.presId || '',
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={resData}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      disabled
                    />
                  </Field>
                  <Field
                    name="buId"
                    label="BaseBU"
                    decorator={{
                      initialValue: formData.buId || '',
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={baseBuData}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      disabled
                    />
                  </Field>
                  <Field
                    name="ouId"
                    label="所属公司"
                    decorator={{
                      initialValue: formData.ouId || '',
                    }}
                  >
                    <Selection
                      source={() => selectInternalOus()}
                      placeholder="请选择所属公司"
                      disabled
                    />
                  </Field>
                  <Field
                    name="vacationType"
                    label="假期类型"
                    decorator={{
                      initialValue: formData.vacationType || undefined,
                      rules: [
                        {
                          required: !disabledOrHidden.vacationType,
                          message: '请选择假期类型',
                        },
                      ],
                    }}
                  >
                    <Selection.UDC disabled code="COM:VACATION_TYPE" placeholder="请选择假期类型" />
                  </Field>
                  <Field
                    name="date"
                    label="请假开始/结束日期"
                    decorator={{
                      initialValue: formData.date || '',
                      rules: [
                        {
                          required: !disabledOrHidden.date,
                          message: '请假开始/结束日期',
                        },
                      ],
                    }}
                  >
                    <DatePicker.RangePicker
                      onChange={(dates, dateStrings) => {
                        const daysDiff = moment(dates[1]).diff(moment(dates[0]), 'days');
                        const daysArr = [];
                        for (let i = 0; i <= daysDiff; i += 1) {
                          daysArr.push({
                            id: genFakeId(),
                            vdate: moment(dates[0])
                              .add(i, 'days')
                              .format('YYYY-MM-DD'),
                            vdays: 1,
                            vmonth: moment(dates[0])
                              .add(i, 'days')
                              .format('YYYY-MM'),
                          });
                        }

                        const monthsArr = [];
                        const monthDiff = sub(moment(dates[1]).month(), moment(dates[0]).month());
                        for (let i = 0; i <= monthDiff; i += 1) {
                          const Emonth = moment(moment(dates[0]).format('YYYY-MM'))
                            .add(i, 'month')
                            .format('YYYY-MM');
                          monthsArr.push({
                            id: genFakeId(),
                            Emonth,
                            Edays: daysArr
                              .filter(v => v.vmonth === Emonth)
                              .reduce((x, y) => x + y.vdays, 0),
                            child: daysArr.filter(v => v.vmonth === Emonth),
                          });
                        }

                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            detailEntityList: monthsArr,
                          },
                        });

                        dispatch({
                          type: `${DOMAIN}/updateForm`,
                          payload: { vacationDays: daysDiff + 1 },
                        });
                      }}
                      format="YYYY-MM-DD"
                      disabled
                    />
                  </Field>
                  <Field
                    name="vacationDays"
                    label="请假天数"
                    decorator={{
                      initialValue: formData.vacationDays || '',
                    }}
                  >
                    <Input disabled placeholder="系统自动生成" />
                  </Field>
                  <Field
                    name="attache"
                    label="附件"
                    decorator={{
                      initialValue: formData.attache || '',
                    }}
                  >
                    <FileManagerEnhance
                      api="/api/person/v1/vacationApply/sfs/token"
                      listType="text"
                      dataKey={formData.id}
                      preview
                    />
                  </Field>
                  <Field
                    name="reason"
                    label="请假事由"
                    fieldCol={1}
                    labelCol={{ span: 4, xxl: 3 }}
                    wrapperCol={{ span: 19, xxl: 20 }}
                    decorator={{
                      initialValue: formData.reason || '',
                      rules: [
                        {
                          required: !disabledOrHidden.reason,
                          message: '请输入请假事由',
                        },
                      ],
                    }}
                  >
                    <Input.TextArea
                      disabled={!!disabledOrHidden.reason}
                      rows={3}
                      placeholder="请输入请假事由"
                    />
                  </Field>
                  <Field
                    name="workPlan"
                    label="工作安排"
                    fieldCol={1}
                    labelCol={{ span: 4, xxl: 3 }}
                    wrapperCol={{ span: 19, xxl: 20 }}
                    decorator={{
                      initialValue: formData.workPlan || '',
                      rules: [
                        {
                          required: !disabledOrHidden.workPlan,
                          message: '请输入工作安排',
                        },
                      ],
                    }}
                  >
                    <Input.TextArea
                      disabled={!!disabledOrHidden.workPlan}
                      rows={3}
                      placeholder="请输入工作安排"
                    />
                  </Field>
                  <Field
                    name="apprResName"
                    label="申请人"
                    decorator={{
                      initialValue: formData.apprResName || '',
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="apprDate"
                    label="申请日期"
                    decorator={{
                      initialValue: formData.apprDate || '',
                    }}
                  >
                    <Input disabled />
                  </Field>
                  {hasIn('addFlag', disabledOrHidden) && (
                    <Field
                      name="addFlag"
                      label="休假后补充附件"
                      decorator={{
                        initialValue: Number(formData.addFlag) || '',
                        rules: [
                          {
                            required: !disabledOrHidden.addFlag,
                            message: '请补充附件',
                          },
                        ],
                      }}
                    >
                      <RadioGroup
                        disabled={!!disabledOrHidden.addFlag}
                        onChange={e => {
                          const { form } = this.props;
                          form.setFieldsValue({
                            addList: '',
                          });
                        }}
                      >
                        <Radio value={1}>是</Radio>
                        <Radio value={0}>否</Radio>
                      </RadioGroup>
                    </Field>
                  )}
                  {hasIn('addList', disabledOrHidden) && (
                    <Field
                      name="addList"
                      label="补充附件清单"
                      fieldCol={1}
                      labelCol={{ span: 4, xxl: 3 }}
                      wrapperCol={{ span: 19, xxl: 20 }}
                      decorator={{
                        initialValue: formData.addList || '',
                        rules: [
                          {
                            required: formData.addFlag && !disabledOrHidden.addList,
                            message: '请输入补充附件清单',
                          },
                        ],
                      }}
                    >
                      <Input.TextArea
                        disabled={!!disabledOrHidden.addList}
                        rows={3}
                        placeholder="请输入补充附件清单"
                      />
                    </Field>
                  )}

                  {hasIn('addAttache', disabledOrHidden) && (
                    <Field
                      name="addAttache"
                      label="补充附件"
                      decorator={{
                        initialValue: formData.addAttache || '',
                        rules: [
                          {
                            required: !disabledOrHidden.addAttache,
                            message: '请上传补充附件',
                          },
                        ],
                      }}
                    >
                      <FileManagerEnhance
                        api="/api/person/v1/vacationApply/supply/sfs/token"
                        listType="text"
                        dataKey={formData.id}
                        preview={!!disabledOrHidden.addAttache}
                      />
                    </Field>
                  )}
                  {hasIn('addAttache', disabledOrHidden) && (
                    <Field
                      presentational
                      labelCol={{ span: 4, xxl: 3 }}
                      wrapperCol={{ span: 22, xxl: 22 }}
                      style={{ color: 'red' }}
                    >
                      注：请按照补充附件清单上传全部附件。
                    </Field>
                  )}
                </FieldList>
                <Divider dashed />
                <FieldList
                  legend="请假明细"
                  layout="horizontal"
                  // getFieldDecorator={getFieldDecorator}
                  col={2}
                >
                  <DetailEntityTable />
                </FieldList>
                <Divider dashed />
                <FieldList
                  legend="剩余假期"
                  layout="horizontal"
                  // getFieldDecorator={getFieldDecorator}
                  col={2}
                >
                  <ResVacationTable />
                </FieldList>
                <Divider dashed />
                <FieldList
                  legend="近期休假情况"
                  layout="horizontal"
                  // getFieldDecorator={getFieldDecorator}
                  col={2}
                >
                  <span style={{ fontSize: '14px', position: 'absolute', left: '25px' }}>
                    最近三个月休假明细
                  </span>
                  <RecentResVacationTable />
                </FieldList>
                <Divider dashed />
              </Card>
            )}
          {mode === 'view' && <ViewDetail />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default VacationApplyFlow;
