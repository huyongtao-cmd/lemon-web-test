import { connect } from 'dva';
import React from 'react';
import { Card, Form, Input, Modal, Radio } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { Selection } from '@/pages/gen/field';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'platResProfileFinance';

@connect(({ loading, platResProfileFinance, dispatch }) => ({
  loading,
  platResProfileFinance,
  dispatch,
}))
@Form.create()
class AbAccModal extends React.Component {
  // 保存按钮
  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      handleOk,
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        handleOk();
      }
    });
  };

  render() {
    const {
      loading,
      visible,
      handleOk,
      handleCancel,
      abAccFormData,
      form: { getFieldDecorator },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    return (
      <Modal
        width="60%"
        destroyOnClose
        title={abAccFormData.id ? '账号修改' : '账号新增'}
        visible={visible}
        onOk={this.handleSave}
        onCancel={handleCancel}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList layout="horizontal" legend="" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="accName"
              label="账户名称"
              decorator={{
                initialValue: abAccFormData.accName,
                rules: [
                  {
                    required: true,
                    message: '请输入账户名称',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入账户名称"
                onChange={e => {
                  abAccFormData.accName = e.target.value;
                }}
              />
            </Field>
            <Field
              name="accType"
              label="账户类型"
              decorator={{
                initialValue: abAccFormData.accType,
                rules: [
                  {
                    required: true,
                    message: '请选择账户类型',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="COM.ACCOUNT_TYPE1"
                placeholder="请选择账户类型"
                onValueChange={e => {
                  abAccFormData.accType = e.code;
                  abAccFormData.accTypeName = e.name;
                }}
              />
            </Field>
            <Field
              name="accountNo"
              label="账号"
              decorator={{
                initialValue: abAccFormData.accountNo,
                rules: [
                  {
                    required: true,
                    message: '请输入账号',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入账号"
                onChange={e => {
                  abAccFormData.accountNo = e.target.value;
                }}
              />
            </Field>
            <Field
              name="accStatus"
              label="状态"
              decorator={{
                initialValue: abAccFormData.accStatus,
                rules: [
                  {
                    required: true,
                    message: '请选择状态',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="COM.STATUS1"
                placeholder="请选择状态"
                onValueChange={e => {
                  abAccFormData.accStatus = e.code;
                  abAccFormData.accStatusName = e.name;
                }}
              />
            </Field>
            <Field
              name="currCode"
              label="币种"
              decorator={{
                initialValue: abAccFormData.currCode,
                rules: [
                  {
                    required: false,
                    message: '请选择币种',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="COM.CURRENCY_KIND"
                placeholder="请选择币种"
                onValueChange={e => {
                  abAccFormData.currCode = e.code;
                  abAccFormData.currCodeName = e.name;
                }}
              />
            </Field>
            <Field
              name="holderName"
              label="开户人"
              decorator={{
                initialValue: abAccFormData.holderName,
                rules: [
                  {
                    required: false,
                    message: '请输入开户人',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入开户人"
                onChange={e => {
                  abAccFormData.holderName = e.target.value;
                }}
              />
            </Field>
            <Field
              name="bankName"
              label="开户行"
              decorator={{
                initialValue: abAccFormData.bankName,
                rules: [
                  {
                    required: false,
                    message: '请输入开户行',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入开户行"
                onChange={e => {
                  abAccFormData.bankName = e.target.value;
                }}
              />
            </Field>
            <Field
              name="bankCity"
              label="开户地"
              decorator={{
                initialValue: abAccFormData.bankCity,
                rules: [
                  {
                    required: false,
                    message: '请输入开户地',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入开户地"
                onChange={e => {
                  abAccFormData.bankCity = e.target.value;
                }}
              />
            </Field>
            <Field
              name="bankBranch"
              label="开户网点"
              decorator={{
                initialValue: abAccFormData.bankBranch,
                rules: [
                  {
                    required: false,
                    message: '请输入开户网点',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入开户网点"
                onChange={e => {
                  abAccFormData.bankBranch = e.target.value;
                }}
              />
            </Field>
            <Field
              name="defaultFlag"
              label="是否工资卡"
              decorator={{
                initialValue: abAccFormData.defaultFlag,
                rules: [
                  {
                    required: true,
                    message: '请输入是否工资卡',
                  },
                ],
              }}
            >
              <RadioGroup
                onChange={e => {
                  abAccFormData.defaultFlag = e.target.value;
                  abAccFormData.defaultFlagName = e.target.value === 1 ? '是' : '否';
                }}
              >
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: abAccFormData.remark,
                rules: [
                  {
                    required: false,
                    message: '请输入备注',
                  },
                  { max: 400, message: '不超过400个字' },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea
                placeholder="请输入备注"
                rows={3}
                onChange={e => {
                  abAccFormData.remark = e.target.value;
                }}
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default AbAccModal;
