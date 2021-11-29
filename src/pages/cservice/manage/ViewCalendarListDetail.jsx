import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import { Button, Card, Form, Input } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection, UdcSelect, DatePicker, FileManagerEnhance } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import Loading from '@/components/core/DataLoading';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { selectBus, selectCusts, selectIamUsers, selectInternalOus } from '@/services/gen/list';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectUsers } from '@/services/sys/user';

const { TextArea } = Input;
const FormItem = Form.Item;
const { Field } = FieldList;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const DOMAIN = 'viewCalerdarListDetail';
@connect(({ loading, viewCalerdarListDetail, dispatch, user }) => ({
  loading,
  viewCalerdarListDetail,
  dispatch,
  user: user.user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.viewCalerdarListDetail;
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
class ViewCalendarListDetail extends PureComponent {
  componentDidMount() {
    const { user } = this.props;
    const currentUserId = user.extInfo.resId;
    const { dispatch } = this.props;
    const { mode, listId, configId } = fromQs();
    dispatch({ type: `${DOMAIN}/queryDetail`, payload: { mode, id: isNil(listId) ? '' : listId } });
    this.handleApplyResId(currentUserId);
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
      viewCalerdarListDetail,
      dispatch,
    } = this.props;
    const { formData } = viewCalerdarListDetail;
    const { mode, listId, configId } = fromQs();

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const keyName = 'configId';
        const configIdFromUrl = { [keyName]: configId };
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            mode,
            values: { ...values, ...formData, ...configIdFromUrl },
            id: isNil(listId) ? '' : listId,
          },
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/cservice/manage/ViewCalendarList?configId=${configId}`);
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
    const { user } = this.props;
    const currentUserId = user.extInfo.resId;
    const { configId } = fromQs();
    const {
      loading,
      form: { getFieldDecorator, setFieldsValue },
      viewCalerdarListDetail,
    } = this.props;
    const { mode } = fromQs();
    const { formData } = viewCalerdarListDetail;
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
              closeThenGoto(`/cservice/manage/ViewCalendarList?configId=${configId}`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="运维日历循环事项明细维护" />}
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
                  <Input placeholder="请输入事项名称" disabled={mode === 'edit'} />
                </Field>
                <Field
                  name="eventNo"
                  label="编号"
                  decorator={{
                    initialValue: formData.eventNo ? formData.eventNo : '',
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
                    disabled={mode === 'edit'}
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
                  <Input placeholder="请输入客户电话" disabled={mode === 'edit'} />
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
                        required: true,
                        message: '请输入客户邮箱',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入客户邮箱" disabled={mode === 'edit'} />
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
                    disabled={mode === 'edit'}
                  />
                </Field>
              </FieldList>

              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="maintainDate"
                  label="运维时间"
                  decorator={{
                    rules: [
                      {
                        required: true,
                        message: '请输入运维时间',
                      },
                    ],
                    initialValue: formData.maintainDate ? formData.maintainDate : '',
                  }}
                >
                  <DatePicker
                    className="x-fill-100"
                    format="YYYY-MM-DD"
                    disabled={mode === 'edit'}
                  />
                </Field>
              </FieldList>

              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="mainPersonId"
                  label="责任人"
                  decorator={{
                    rules: [
                      {
                        required: true,
                        message: '请输入责任人',
                      },
                    ],
                    initialValue: formData.mainPersonId || currentUserId,
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
                    disabled
                  />
                </Field>
                <Field
                  name="buId"
                  label="部门"
                  decorator={{
                    initialValue: formData.buId || undefined,
                    rules: [
                      {
                        required: true,
                        message: '请输入部门',
                      },
                    ],
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
                    initialValue: formData.id || undefined,
                  }}
                >
                  <FileManagerEnhance
                    api="/api/op/v1/omCalendar/operation/detail/sfs/token"
                    dataKey={formData.id}
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
                    initialValue: formData.personId || undefined,
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

export default ViewCalendarListDetail;
