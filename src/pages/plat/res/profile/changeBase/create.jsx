import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { isEmpty, isNil, hasIn } from 'ramda';
import classnames from 'classnames';
import { Button, Card, DatePicker, Form, Input } from 'antd';
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

const DOMAIN = 'changeBaseSs';

@connect(({ loading, changeBaseSs, dispatch }) => ({
  loading,
  changeBaseSs,
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
class ChangeBase extends Component {
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
      changeBaseSs: { formData, resData, baseBuData },
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
            <Title
              icon="profile"
              id="ui.menu.user.changeBase.create"
              defaultMessage="Base地与社保公积金缴纳地变更申请"
            />
          }
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="applyResId"
              label="申请人"
              decorator={{
                initialValue: formData.id || '',
                rules: [
                  {
                    required: true,
                    message: '请选择申请人',
                  },
                ],
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
              />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: moment(new Date()),
              }}
            >
              <DatePicker disabled className="x-fill-100" />
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
              name="coopType"
              label="合作方式"
              decorator={{
                initialValue: formData.coopTypeName || '',
              }}
            >
              <Input disabled placeholder="系统自动生成" />
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
              name="oldBaseCity"
              label="原Base地"
              decorator={{
                initialValue: formData.baseCity && formData.baseCity,
              }}
            >
              <Selection.UDC disabled code="COM.CITY" placeholder="请选择Base地" />
            </Field>
            <Field
              name="newBaseCity"
              label="新Base地"
              decorator={{
                // initialValue: formData.newBaseCity && formData.newBaseCity,
                rules: [
                  {
                    required: true,
                    message: '请选择新Base地',
                  },
                ],
              }}
            >
              <Selection.UDC code="COM.CITY" placeholder="请选择Base地" />
            </Field>
            <Field
              name="oldSecurityPl"
              label="原社保缴纳地"
              decorator={{
                initialValue: formData.baseCity && formData.baseCity,
                rules: [
                  {
                    required: true,
                    message: '请选择原社保缴纳地',
                  },
                ],
              }}
            >
              <Selection.UDC code="COM.CITY" placeholder="请选择社保缴纳地" />
            </Field>
            <Field
              name="newSecurityPl"
              label="新社保缴纳地"
              decorator={{
                // initialValue: formData.baseCity && formData.baseCity,
                rules: [
                  {
                    required: true,
                    message: '请选择新社保缴纳地地',
                  },
                ],
              }}
            >
              <Selection.UDC code="COM.CITY" placeholder="请选择社保缴纳地" />
            </Field>
            <Field
              name="chgReason"
              label="变更原因"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.chgReason || '',
                rules: [
                  {
                    required: true,
                    message: '请输入变更原因',
                  },
                ],
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入变更原因" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ChangeBase;
