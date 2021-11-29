// 最常用的引入,基本每个页面都需要的组件
import React, { PureComponent } from 'react';
import {
  Button,
  Card,
  Input,
  Select,
  Form,
  InputNumber,
  Tooltip,
  Checkbox,
  TreeSelect,
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import RichText from '@/components/common/RichText';
import Title from '@/components/layout/Title';
import Loading from '@/components/core/DataLoading';
import Link from 'umi/link';
import router from 'umi/router';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'budgetAppropriationEdit';

@connect(({ loading, budgetAppropriationEdit, dispatch, user }) => ({
  loading,
  ...budgetAppropriationEdit,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };
    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
@mountToTab()
class BudgetAppropriationEdit extends PureComponent {
  componentDidMount() {
    const { dispatch, formData } = this.props;
    const param = fromQs();
    if (param.id) {
      // 编辑模式
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id: param.id },
      });
    } else {
      // 新增模式
      dispatch({
        type: `${DOMAIN}/clearForm`,
      });
      dispatch({
        type: `${DOMAIN}/query`,
        payload: {},
      });
    }
  }

  handleSave = () => {
    const { form, dispatch, formData, feebudget } = this.props;
    const copyObj = {};
    const param = fromQs();
    if (param.copy) {
      copyObj.id = undefined;
    }

    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      if (feebudget.feeBudgetAmt < formData.applyFeeAmt + (feebudget.feeReleasedAmt || 0)) {
        createMessage({
          type: 'warn',
          description: '申请拨付费用金额加已拨付金额超过预算费用金额!',
        });
        return;
      }
      if (feebudget.eqvaBudgetCnt < formData.applyEqva + (feebudget.eqvaReleasedQty || 0)) {
        createMessage({ type: 'warn', description: '申请拨付当量加已拨付当量超过预算当量!' });
        return;
      }
      const budgetId = param.budgetId || formData.budgetId;

      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          ...formData,
          ...values,
          ...copyObj,
          budgetId,
          submit: true,
        },
      });
    });
  };

  render() {
    const {
      loading,
      formData,
      projectView,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dispatch,
    } = this.props;
    const allLoading = loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`];
    const queryLoading = loading.effects[`${DOMAIN}/query`];

    return (
      <PageHeaderWrapper>
        {queryLoading ? (
          <Loading />
        ) : (
          <>
            <Card className="tw-card-rightLine">
              <Button
                className="tw-btn-primary"
                type="primary"
                icon="save"
                size="large"
                loading={allLoading}
                onClick={this.handleSave}
              >
                提交
              </Button>
            </Card>
            <Card
              title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
              bordered={false}
              className="tw-card-adjust"
            >
              <FieldList getFieldDecorator={getFieldDecorator} col={2}>
                {/* <Field
              name="module"
              label="模块"
              decorator={{
                initialValue: formData.module,
                rules: [{ required: true, message: '请输入模块' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field> */}

                <Field
                  name="appropriationNo"
                  label="拨付单号"
                  decorator={{
                    initialValue: formData.appropriationNo,
                    rules: [{ required: false, message: '请输入拨付单号' }],
                  }}
                >
                  <Input disabled style={{ width: '100%' }} />
                </Field>

                <Field
                  name="applyFeeAmt"
                  label="费用金额"
                  decorator={{
                    initialValue: formData.applyFeeAmt || 0,
                    rules: [{ required: true, message: '请输入费用金额' }],
                  }}
                >
                  <InputNumber
                    className="x-fill-100"
                    placeholder="请输入费用金额"
                    maxLength={10}
                    onChange={e => {
                      formData.applyFeeAmt = e;
                      formData.applyAmt = e + formData.applyEqvaAmt;
                    }}
                  />
                </Field>

                <FieldLine label="当量数/金额" fieldCol={2} required>
                  <Field
                    name="applyEqva"
                    decorator={{
                      initialValue: formData.applyEqva || 0,
                      rules: [{ required: true, message: '请输入当量数' }],
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <InputNumber
                      className="x-fill-100"
                      placeholder="请输入当量数"
                      maxLength={10}
                      onChange={e => {
                        formData.applyEqva = e;
                        formData.applyEqvaAmt = Math.round(e * projectView.eqvaPrice * 100) / 100;
                        formData.applyAmt = formData.applyEqvaAmt + formData.applyFeeAmt;
                      }}
                    />
                  </Field>
                  <Field
                    name="applyEqvaAmt"
                    decorator={{
                      initialValue: formData.applyEqvaAmt || 0,
                      rules: [{ required: false, message: '请输入当量金额' }],
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <InputNumber
                      className="x-fill-100"
                      disabled
                      placeholder="请输入当量金额"
                      onChange={e => {
                        formData.applyEqvaAmt = e;
                      }}
                    />
                  </Field>
                </FieldLine>
                <Field
                  name="applyAmt"
                  label="总金额"
                  decorator={{
                    initialValue: formData.applyAmt || 0,
                    rules: [{ required: false, message: '请输入总金额' }],
                  }}
                >
                  <InputNumber
                    className="x-fill-100"
                    disabled
                    placeholder="请输入申请拨付金额"
                    onChange={e => {
                      formData.applyAmt = e;
                    }}
                  />
                </Field>
                <Field
                  name="remark"
                  label="备注"
                  decorator={{
                    initialValue: formData.remark,
                    rules: [{ required: false }, { max: 400, message: '不超过400个字' }],
                  }}
                  fieldCol={1}
                  labelCol={{ span: 4, xxl: 3 }}
                  wrapperCol={{ span: 19, xxl: 20 }}
                >
                  <Input.TextArea
                    placeholder="请输入备注"
                    autosize={{ minRows: 3, maxRows: 6 }}
                    onChange={e => {
                      formData.remark = e.target.value;
                    }}
                  />
                </Field>
              </FieldList>
            </Card>
          </>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default BudgetAppropriationEdit;
