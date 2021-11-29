import React, { Component } from 'react';
import { Form, Input } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { connect } from 'dva';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectFinperiod } from '@/services/user/Contract/sales';
import { mountToTab } from '@/layouts/routerControl';
import moment from 'moment';

const { TextArea } = Input;
const { Field } = FieldList;
const DOMAIN = 'wageCostMainPage';
@connect(({ loading, wageCostMainPage }) => ({
  loading,
  ...wageCostMainPage,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    props.dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        detailForm: { ...props.detailForm, ...changedValues },
      },
    });
  },
})
@mountToTab()
class DetailForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formRefs: form,
      },
    });
  }

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
          name="apprStatusName"
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
            rules: [
              {
                required: true,
                message: '请输入单据名称',
              },
            ],
          }}
        >
          <Input placeholder="请输入单据名称" />
        </Field>
        <Field
          name="finPeriodId"
          label="财务期间"
          decorator={{
            initialValue: detailForm.finPeriodId,
            rules: [
              {
                required: true,
                message: '请选择财务期间',
              },
            ],
          }}
        >
          <AsyncSelect
            source={() => selectFinperiod().then(resp => resp.response)}
            placeholder="请选择财务期间"
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          />
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
          <TextArea rows={4} />
        </Field>
        <Field
          name="createUserName"
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
            initialValue: detailForm.createTime
              ? moment(detailForm.createTime).format('YYYY-MM-DD HH:mm:ss')
              : '',
          }}
        >
          <Input placeholder="系统生成" disabled />
        </Field>
      </FieldList>
    );
  }
}

export default DetailForm;
