import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import classnames from 'classnames';
import { Button, Card, Form, Input, Divider, Switch } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import createMessage from '@/components/core/AlertMessage';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection } from '@/pages/gen/field';

const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'probationMid';

@connect(({ loading, probationMid, dispatch }) => ({
  loading,
  probationMid,
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
class ProbationMidCreate extends Component {
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
          type: `${DOMAIN}/createSubmit`,
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/user/flow/process?type=procs`);
          }
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      probationMid: { formData, resData, baseBuData },
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
          title={<Title icon="profile" text="试用期考核(中期)" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="resId"
              label="资源"
              decorator={{
                initialValue: formData.resId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择资源',
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
                placeholder="请选择考核资源"
              />
            </Field>
            <Field
              name="baseBuId"
              label="BaseBU"
              decorator={{
                initialValue: formData.baseBuId || undefined,
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
                placeholder="系统自动生成"
                disabled
              />
            </Field>
            <Field
              name="presId"
              label="直属领导"
              decorator={{
                initialValue: formData.presId || undefined,
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
                placeholder="系统自动生成"
                disabled
              />
            </Field>
            <Field
              name="probationPeriod"
              label="试用期"
              decorator={{
                initialValue: formData.probationPeriod || '',
              }}
            >
              <Input placeholder="系统自动生成" disabled />
            </Field>
            <Field
              name="mobile"
              label="手机号码"
              decorator={{
                initialValue: formData.mobile || '',
              }}
            >
              <Input placeholder="系统自动生成" disabled />
            </Field>
            <Field
              name="emailAddr"
              label="平台邮箱"
              decorator={{
                initialValue: formData.emailAddr || '',
              }}
            >
              <Input placeholder="系统自动生成" disabled />
            </Field>

            <Field
              name="remark"
              label="备注"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.remark || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
            <Field
              name="applyResName"
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

export default ProbationMidCreate;
