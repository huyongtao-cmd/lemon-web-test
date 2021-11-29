import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { isEmpty, isNil, hasIn } from 'ramda';
import classnames from 'classnames';
import { Button, Card, DatePicker, Form, Input, Radio } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection } from '@/pages/gen/field';
import { selectInternalOus } from '@/services/gen/list';

const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'leaveCreate';

@connect(({ loading, leaveCreate, dispatch }) => ({
  loading,
  leaveCreate,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class LeaveCreate extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {},
      },
    });
    dispatch({
      type: `${DOMAIN}/queryUserPrincipal`,
    });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      leaveCreate: { formData, resData, baseBuData },
    } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/queryResDetail`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            disabled={disabledBtn}
          >
            {formatMessage({ id: `misc.submit`, desc: '提交' })}
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/user/flow/panel')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={
            <Title icon="profile" id="ui.menu.plat.res.leaveApply" defaultMessage="离职申请" />
          }
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="resId"
              label="离职资源"
              decorator={{
                initialValue: formData.resId || '',
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resData}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {
                  if (value && value.id) {
                    const { id } = value;
                    dispatch({
                      type: `${DOMAIN}/queryResDetail`,
                      payload: id,
                    });
                  }
                }}
                disabled
              />
            </Field>
            <Field
              name="enrollDate"
              label="入职日期"
              decorator={{
                initialValue: formData.enrollDate ? moment(formData.enrollDate) : null,
              }}
            >
              <DatePicker disabled className="x-fill-100" />
            </Field>
            <Field
              name="baseBuId"
              label="BaseBU"
              decorator={{
                initialValue: formData.baseBuId || '',
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
              name="baseCity"
              label="Base地"
              decorator={{
                initialValue: formData.baseCity && formData.baseCity,
              }}
            >
              <Selection.UDC disabled code="COM.CITY" placeholder="请选择Base地" />
            </Field>
            <Field
              name="ouId"
              label="所属公司"
              decorator={{
                initialValue: formData.ouId || '',
              }}
            >
              <Selection source={() => selectInternalOus()} placeholder="请选择所属公司" disabled />
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
              name="leaveDesc"
              label="离职原因"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.leaveDesc || '',
                rules: [
                  {
                    required: true,
                    message: '请输入离职原因',
                  },
                ],
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入离职原因" />
            </Field>
            <Field
              name="applyResId"
              label="申请人"
              decorator={{
                initialValue: formData.applyResName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate || '',
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default LeaveCreate;
