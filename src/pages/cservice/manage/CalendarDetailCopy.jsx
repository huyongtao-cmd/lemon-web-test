import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import { Button, Card, Form, Input, InputNumber } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection, UdcSelect, DatePicker, FileManagerEnhance } from '@/pages/gen/field';
import moment from 'moment';
import {
  selectProject,
  selectBus,
  selectCusts,
  selectIamUsers,
  selectInternalOus,
} from '@/services/gen/list';
import Loading from '@/components/core/DataLoading';
import { formatDT } from '@/utils/tempUtils/DateTime';
import createMessage from '@/components/core/AlertMessage';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectUsers } from '@/services/sys/user';
import { selectUsersAll } from '@/services/cservice/manage/index';

const { TextArea } = Input;
const FormItem = Form.Item;
const { Field } = FieldList;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const DOMAIN = 'calerdarListDetail';
@connect(({ loading, calerdarListDetail, dispatch, user }) => ({
  loading,
  calerdarListDetail,
  dispatch,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.calerdarListDetail;
    const fields = {};
    Object.keys(formData).forEach(key => {
      fields[key] = Form.createFormField(formData[key]);
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];

    const value = changedValues[name];
    const newFieldData = { [name]: value };
    if (name === 'startEndDate') {
      const startDate = { startDate: value[0] };
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: startDate,
      });

      const endDate = { endDate: value[1] };
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: endDate,
      });
      return;
    }

    if (name === 'loopRate') {
      const planDate = { planDate: '' };
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: planDate,
      });
    }

    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
@mountToTab()
class CalendarDetailCopy extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { mode, configId } = fromQs();
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: { mode, id: isNil(configId) ? '' : configId },
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { formData: {} },
    });
  }

  handleSubmit = lockFlag => () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      calerdarListDetail,
    } = this.props;
    const { formData } = calerdarListDetail;
    const { mode, configId } = fromQs();
    const lockFlagToBack = { lockFlag };

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            mode,
            values: { ...values, ...formData, ...lockFlagToBack },
            id: isNil(configId) ? '' : configId,
          },
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto('/cservice/manage/calendar?_refresh=0');
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  radioChange = val => {};

  // 选择申请人带出参数
  handleApplyResId = value => {
    const { dispatch } = this.props;
    if (value) {
      dispatch({
        type: `${DOMAIN}/changeApplyResId`,
        payload: value,
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          applyResId: null,
          baseCityName: null,
          resBuName: null,
          buId: null,
          monthlyAmt: null,
        },
      });
    }
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator },
      calerdarListDetail,
    } = this.props;
    const { mode } = fromQs();
    const { formData } = calerdarListDetail;
    const { lockFlag } = formData;
    const yesFlag = true;
    const noFlag = false;
    let disabledFlag = true;
    if (lockFlag === 1 || lockFlag === undefined) {
      disabledFlag = yesFlag;
    } else {
      disabledFlag = noFlag;
    }
    if (mode === 'copy') {
      disabledFlag = noFlag;
    }
    // loading完成之前将按钮设为禁用
    const saveBtn = loading.effects[`${DOMAIN}/save`];
    const queryBtn = loading.effects[`${DOMAIN}/queryDetail`];
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            loading={saveBtn}
            size="large"
            disabled={disabledFlag}
            onClick={this.handleSubmit(1)}
          >
            提交
          </Button>

          <Button
            className="tw-btn-primary"
            icon="save"
            loading={saveBtn}
            size="large"
            onClick={this.handleSubmit(0)}
            disabled={disabledFlag}
          >
            保存
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              closeThenGoto('/cservice/manage/calendar?_refresh=0');
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="运维日历循环事项复制" />}
          bordered={false}
        >
          {!queryBtn ? (
            <>
              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="eventName"
                  label="事项名称"
                  decorator={{
                    initialValue: formData.eventName ? formData.eventName : '',
                    rules: [
                      {
                        required: true,
                        message: '请输入事项名称',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入事项名称" disabled={mode === 'view'} />
                </Field>
                <Field
                  name="eventNo"
                  label="编号"
                  decorator={{
                    initialValue: '',
                    rules: [
                      {
                        required: false,
                        message: '编号',
                      },
                    ],
                  }}
                >
                  <Input placeholder="系统生成" disabled />
                </Field>
              </FieldList>
              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="custId"
                  label="客户"
                  decorator={{
                    rules: [
                      {
                        required: true,
                        message: '请输入客户',
                      },
                    ],
                    initialValue: formData.custId || undefined,
                  }}
                >
                  <Selection.Columns
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    columns={particularColumns}
                    source={() => selectCusts()}
                    placeholder="请选择客户"
                    showSearch
                  />
                </Field>

                <Field
                  name="custTel"
                  label="客户电话"
                  decorator={{
                    initialValue: formData.custTel ? formData.custTel : '',
                    rules: [
                      {
                        required: true,
                        message: '请输入客户电话',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入客户电话" disabled={mode === 'view'} />
                </Field>
              </FieldList>

              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="custEmail"
                  label="客户邮箱"
                  decorator={{
                    initialValue: formData.custEmail ? formData.custEmail : '',
                    rules: [
                      {
                        type: 'email',
                        message: '无效邮箱',
                      },
                      {
                        required: false,
                        message: '请输入客户邮箱',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入客户邮箱" disabled={mode === 'view'} />
                </Field>
                <Field
                  name="status"
                  label="状态"
                  decorator={{
                    rules: [
                      {
                        required: true,
                        message: '请输入状态',
                      },
                    ],
                    initialValue: formData.status || 'PENDING',
                  }}
                >
                  <UdcSelect
                    code="COM:CAL_TASK_STATUS"
                    placeholder="请选择状态"
                    disabled={mode === 'view'}
                  />
                </Field>
              </FieldList>

              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="projectId"
                  label="项目"
                  decorator={{
                    rules: [
                      {
                        required: true,
                        message: '请输入项目',
                      },
                    ],
                    initialValue: formData.projectId || undefined,
                  }}
                >
                  <Selection.Columns
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    columns={particularColumns}
                    source={() => selectProject()}
                    placeholder="请选择项目"
                    showSearch
                  />
                </Field>
                <Field
                  name="managerResId"
                  label="客户经理"
                  decorator={{
                    rules: [
                      {
                        required: false,
                        message: '请选择客户经理',
                      },
                    ],
                    initialValue: formData.managerResId || undefined,
                  }}
                >
                  <Selection.Columns
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    columns={particularColumns}
                    source={() => selectUsersAll()}
                    placeholder="请选择客户经理"
                    showSearch
                  />
                </Field>
              </FieldList>

              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="startEndDate"
                  label="起始-结束日期"
                  decorator={{
                    initialValue: [formData.startDate, formData.endDate] || [],
                    rules: [
                      {
                        required: true,
                        message: '请选择起始-结束日期',
                      },
                    ],
                  }}
                >
                  <DatePicker.RangePicker format="YYYY-MM-DD" />
                </Field>

                <Field
                  name="remindDate"
                  label="提前提醒天数"
                  decorator={{
                    initialValue: formData.remindDate ? formData.remindDate : 0,
                    rules: [
                      {
                        required: true,
                        message: '请输入提前提醒天数',
                      },
                    ],
                  }}
                >
                  <InputNumber
                    precision={0}
                    min={0}
                    max={999999999999}
                    placeholder="提前提醒天数"
                    className="x-fill-100"
                  />
                </Field>
              </FieldList>

              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="loopRate"
                  label="循环频率"
                  decorator={{
                    rules: [
                      {
                        required: true,
                        message: '请选择循环频率',
                      },
                    ],
                    initialValue: formData.loopRate || '01',
                  }}
                >
                  <UdcSelect
                    code="COM:CAL_LOOP_RATE"
                    placeholder="请选择循环频率"
                    disabled={mode === 'view'}
                  />
                </Field>

                {formData.loopRate === '02' && (
                  <Field
                    name="planDate"
                    label="计划处理日期"
                    decorator={{
                      rules: [
                        {
                          required: true,
                          message: '计划处理日期',
                        },
                      ],
                      initialValue: formData.planDate || undefined,
                    }}
                  >
                    <UdcSelect
                      code="COM:CAL_PLAN_WEEK"
                      placeholder="请选择计划处理日期"
                      disabled={mode === 'view'}
                    />
                  </Field>
                )}

                {formData.loopRate === '03' && (
                  <Field
                    name="planDate"
                    label="计划处理日期"
                    decorator={{
                      rules: [
                        {
                          required: true,
                          message: '计划处理日期',
                        },
                      ],
                      initialValue: formData.planDate || undefined,
                    }}
                  >
                    <UdcSelect
                      code="COM:CAL_PLAN_MONTH"
                      placeholder="请选择计划处理日期"
                      disabled={mode === 'view'}
                    />
                  </Field>
                )}

                {(formData.loopRate === '04' || formData.loopRate === '05') && (
                  <Field
                    name="planDate"
                    label="计划处理日期"
                    decorator={{
                      rules: [
                        {
                          required: true,
                          message: '请输入计划处理日期',
                        },
                      ],
                      initialValue: formData.planDate || undefined,
                    }}
                  >
                    <DatePicker className="x-fill-100" format="YYYY-MM-DD" />
                  </Field>
                )}
              </FieldList>

              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="mainPersonId"
                  label="责任人"
                  decorator={{
                    rules: [
                      {
                        required: true,
                        message: '请选择责任人',
                      },
                    ],
                    initialValue: formData.mainPersonId || undefined,
                  }}
                >
                  <AsyncSelect
                    source={() => selectUsers().then(resp => resp.response)}
                    placeholder="请选择责任人"
                    showSearch
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={this.handleApplyResId}
                  />
                </Field>
                <Field
                  name="buId"
                  label="部门"
                  decorator={{
                    rules: [
                      {
                        required: true,
                        message: '请选择部门',
                      },
                    ],
                    initialValue: formData.buId || undefined,
                  }}
                >
                  <Selection.Columns
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    columns={particularColumns}
                    source={() => selectBus()}
                    placeholder="根据责任人带出"
                    showSearch
                    disabled
                  />
                </Field>
              </FieldList>

              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  fieldCol={1}
                  labelCol={{ span: 4, xxl: 3 }}
                  wrapperCol={{ span: 19, xxl: 20 }}
                  name="remark"
                  label="备注说明"
                  decorator={{
                    initialValue: formData.remark ? formData.remark : '',
                  }}
                >
                  <Input.TextArea autosize={{ minRows: 2, maxRows: 5 }} className="x-fill-100" />
                </Field>
              </FieldList>

              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="attache"
                  label={formatMessage({
                    id: `ui.menu.user.expense.form.attache`,
                    desc: '相关附件',
                  })}
                  decorator={{
                    initialValue: undefined,
                  }}
                >
                  <FileManagerEnhance
                    api="/api/op/v1/omCalendar/operation/config/sfs/token"
                    dataKey=""
                    listType="text"
                    disabled={false}
                  />
                </Field>
              </FieldList>

              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="personId"
                  label="创建人"
                  decorator={{
                    rules: [
                      {
                        required: false,
                        message: '请输入创建人',
                      },
                    ],
                    initialValue: undefined,
                  }}
                >
                  <Selection.Columns
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    columns={particularColumns}
                    source={() => selectUsers()}
                    placeholder="系统生成"
                    showSearch
                    disabled
                  />
                </Field>

                <Field
                  name="createTime"
                  label="创建时间"
                  decorator={{
                    rules: [
                      {
                        required: false,
                        message: '创建时间',
                      },
                    ],
                    initialValue: formData.createTime ? formData.createTime : '',
                  }}
                >
                  <DatePicker
                    className="x-fill-100"
                    format="YYYY-MM-DD"
                    placeholder="系统生成"
                    disabled
                  />
                </Field>
              </FieldList>
            </>
          ) : (
            <Loading />
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CalendarDetailCopy;
