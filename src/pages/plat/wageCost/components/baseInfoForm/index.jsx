import React, { Component } from 'react';
import { Form, Input } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { connect } from 'dva';
import moment from 'moment';

const { TextArea } = Input;
const { Field } = FieldList;
const DOMAIN = 'wageCostMainPage';
@connect(({ loading, wageCostMainPage }) => ({
  loading,
  ...wageCostMainPage,
}))
@Form.create()
class BaseInfoForm extends Component {
  render() {
    const {
      form: { getFieldDecorator },
      detailForm,
    } = this.props;
    return (
      <FieldList layout="horizontal" legend="" getFieldDecorator={getFieldDecorator} col={2}>
        <Field
          name="sacMasNo"
          label="单据编号"
          decorator={{
            initialValue: detailForm.sacMasNo,
          }}
        >
          <Input placeholder="系统生成" disabled />
        </Field>
        <Field
          name="apprStatus"
          label="状态"
          decorator={{
            initialValue: detailForm.apprStatusName,
          }}
        >
          <Input placeholder="系统生成" disabled />
        </Field>
        <Field
          name="sacMasName"
          label="单据名称"
          decorator={{
            initialValue: detailForm.sacMasName,
          }}
        >
          <Input placeholder="请输入单据名称" disabled />
        </Field>
        <Field
          name="finPeriodId"
          label="财务期间"
          decorator={{
            initialValue: detailForm.finPeriodName,
          }}
        >
          <Input placeholder="请选择财务期间" disabled />
        </Field>
        <Field
          name="remark"
          label="备注"
          decorator={{
            initialValue: detailForm.remark,
          }}
          fieldCol={1}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 20 }}
        >
          <TextArea rows={4} disabled />
        </Field>
        <Field
          name="createUserId"
          label="创建人"
          decorator={{
            initialValue: detailForm.createUserName,
          }}
        >
          <Input placeholder="系统生成" disabled />
        </Field>
        <Field
          name="createTime"
          label="创建时间"
          decorator={{
            initialValue: moment(detailForm.createTime).format('YYYY-MM-DD HH:mm:ss'),
          }}
        >
          <Input placeholder="系统生成" disabled />
        </Field>
      </FieldList>
    );
  }
}

export default BaseInfoForm;
