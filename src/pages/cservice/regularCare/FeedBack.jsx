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
import createMessage from '@/components/core/AlertMessage';
import Loading from '@/components/core/DataLoading';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { Selection, UdcSelect, DatePicker, FileManagerEnhance } from '@/pages/gen/field';
import {
  selectBus,
  selectUsers,
  selectCusts,
  selectIamUsers,
  selectInternalOus,
} from '@/services/gen/list';

const { TextArea } = Input;
const FormItem = Form.Item;
const { Field } = FieldList;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const DOMAIN = 'feedBackRegular';
@connect(({ loading, feedBackRegular, dispatch, user }) => ({
  loading,
  feedBackRegular,
  dispatch,
  user: user.user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.feedBackRegular;
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

    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
@mountToTab()
class FeedBack extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { detailId, configId } = fromQs();
    dispatch({ type: `${DOMAIN}/queryDetail`, payload: { id: isNil(detailId) ? '' : detailId } });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { formData: {} },
    });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      feedBackRegular,
      dispatch,
    } = this.props;
    const { formData } = feedBackRegular;
    const { detailId, configId } = fromQs();

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { user } = this.props;
        const currentUserId = user.extInfo.resId;
        const { id } = formData;
        const feedbackPersonId = { feedbackPersonId: currentUserId };
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { values: { ...values, ...formData, ...feedbackPersonId } },
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/cservice/manage/viewRegularList?configId=${configId}`);
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  radioChange = val => {};

  render() {
    const { detailId, configId } = fromQs();
    const { user } = this.props;
    const currentUserId = user.extInfo.resId;
    const {
      loading,
      form: { getFieldDecorator, setFieldsValue },
      feedBackRegular,
    } = this.props;
    const { mode } = fromQs();
    const { formData } = feedBackRegular;
    // loading完成之前将按钮设为禁用
    const saveBtn = loading.effects[`${DOMAIN}/save`];
    const queryBtn = loading.effects[`${DOMAIN}/queryDetail`];
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          {mode !== 'view' ? (
            <Button
              className="tw-btn-primary"
              icon="save"
              loading={saveBtn}
              size="large"
              onClick={this.handleSubmit}
            >
              {formatMessage({ id: `misc.save`, desc: '保存' })}
            </Button>
          ) : (
            ''
          )}
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              closeThenGoto(`/cservice/manage/viewRegularList?configId=${configId}`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="客户定期关怀明细反馈" />}
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
                        message: '事项名称',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入事项名称" disabled />
                </Field>
                <Field
                  name="eventNo"
                  label="事项编号"
                  decorator={{
                    initialValue: formData.eventNo ? formData.eventNo : '',
                    rules: [
                      {
                        required: false,
                        message: '事项编号',
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
                    disabled
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
                        message: '客户电话',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入客户电话" disabled />
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
                        required: true,
                        message: '客户邮箱',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入客户邮箱" disabled />
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
                    initialValue: formData.status || undefined,
                  }}
                >
                  <UdcSelect code="COM:CAL_TASK_STATUS" placeholder="请选择状态" disabled />
                </Field>
              </FieldList>

              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="actualDate"
                  label="实际处理日期"
                  decorator={{
                    rules: [
                      {
                        required: true,
                        message: '请输入实际处理日期',
                      },
                    ],
                    initialValue: formData.actualDate ? formData.actualDate : '',
                  }}
                >
                  <DatePicker className="x-fill-100" format="YYYY-MM-DD" />
                </Field>

                <Field
                  name="processTime"
                  label="处理时长（H）"
                  decorator={{
                    initialValue: formData.processTime ? formData.processTime : 0,
                    rules: [
                      {
                        required: true,
                        message: '请输入处理时长',
                      },
                    ],
                  }}
                >
                  <InputNumber
                    precision={0}
                    min={0}
                    max={999999999999}
                    placeholder="处理时长"
                    className="x-fill-100"
                  />
                </Field>
              </FieldList>

              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  fieldCol={1}
                  labelCol={{ span: 4, xxl: 3 }}
                  wrapperCol={{ span: 19, xxl: 20 }}
                  name="conclusion"
                  label="总结"
                  decorator={{
                    initialValue: formData.conclusion ? formData.conclusion : '',
                  }}
                >
                  <Input.TextArea autosize={{ minRows: 2, maxRows: 5 }} className="x-fill-100" />
                </Field>
              </FieldList>
              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  fieldCol={1}
                  labelCol={{ span: 4, xxl: 3 }}
                  wrapperCol={{ span: 19, xxl: 20 }}
                  name="nextActionPlan"
                  label="下一步计划"
                  decorator={{
                    initialValue: formData.nextActionPlan ? formData.nextActionPlan : '',
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
                    initialValue: formData.id || undefined,
                  }}
                >
                  <FileManagerEnhance
                    api="/api/op/v1/omCustCare/operation/feedback/sfs/token"
                    dataKey={formData.id}
                    listType="text"
                    disabled={false}
                  />
                </Field>
              </FieldList>

              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="feedbackPersonId"
                  label="反馈人"
                  decorator={{
                    rules: [
                      {
                        required: false,
                        message: '请输入反馈人',
                      },
                    ],
                    initialValue: formData.feedbackPersonId
                      ? formData.feedbackPersonId
                      : currentUserId,
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

export default FeedBack;
