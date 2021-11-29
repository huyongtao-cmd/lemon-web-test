import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import { Button, Card, Form, Input, Divider, InputNumber } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker, FileManagerEnhance } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { selectUsersWithBu } from '@/services/gen/list';
import { selectBus } from '@/services/org/bu/bu';

const { Field, FieldLine } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'equivalentCreateFlow';

@connect(({ loading, equivalentCreateFlow, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/queryTaskDetail`],
  equivalentCreateFlow,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedFields) {
    if (!isEmpty(changedFields)) {
      props.dispatch({
        type: `${DOMAIN}/updateTaskForm`,
        payload: changedFields,
      });
    }
  },
})
// @mountToTab()
class UniversalSettlement extends PureComponent {
  componentDidMount() {
    const { dispatch, form, close } = this.props;
    const { id } = fromQs();
    form.resetFields();
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    id &&
      !close &&
      dispatch({
        type: `${DOMAIN}/queryTaskDetail`,
        payload: { id },
      }).then(() => {
        dispatch({
          type: `${DOMAIN}/updateTaskForm`,
          payload: {
            settlementDate: moment().format('YYYY-MM-DD'),
          },
        });
      });
  }

  fetchPrice = value => {
    const {
      dispatch,
      equivalentCreateFlow: { formData, taskFormData },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/queryTaskSettleByCondition`,
      payload: {
        jobType1: taskFormData.jobType1,
        receiverBuId: value,
        expenseBuId: taskFormData.expenseBuId,
        receiverResId: taskFormData.receiverResId,
        settlePriceFlag: taskFormData.settlePriceFlag,
        buSettlePrice: taskFormData.buSettlePrice,
        reasonType: taskFormData.reasonType,
        reasonId: taskFormData.reasonId,
      },
    });
  };

  // 收入资源改变引起收入BU发生改变
  fetchReceiverBu = value => {
    const { dispatch, form } = this.props;
    if (value) {
      dispatch({
        type: `${DOMAIN}/updateTaskForm`,
        payload: {
          receiverBuId: value.baseBuId,
          receiverBuName: value.baseBuName,
          receiverResName: value.name,
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateTaskForm`,
        payload: {
          receiverBuId: undefined,
          receiverBuName: undefined,
          receiverResName: undefined,
        },
      });
    }
    // form.resetFields();
  };

  render() {
    const {
      dispatch,
      loading,
      equivalentCreateFlow: { formData, resDataSource, baseBuDataSource, taskFormData },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="applyResId"
              label="申请人"
              decorator={{
                initialValue: taskFormData.applyResId || undefined,
              }}
            >
              <Selection.Columns
                key="applyResId"
                className="x-fill-100"
                source={() => selectUsersWithBu()}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="系统生成"
                disabled
              />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: taskFormData.applyDate || undefined,
              }}
            >
              <Input placeholder="系统生成" disabled />
            </Field>
            <Field
              name="settlePrice"
              label="最终结算价"
              decorator={{
                initialValue: taskFormData.settlePrice,
              }}
            >
              <Input placeholder="最终结算价" disabled />
            </Field>
            <FieldLine label="申请结算当量/金额" fieldCol={2}>
              <Field
                name="applyforEqva"
                decorator={{
                  initialValue: taskFormData.applyforEqva,
                }}
                wrapperCol={{ span: 23, xxl: 24 }}
              >
                <Input disabled />
              </Field>
              <Field
                name="amt"
                decorator={{
                  initialValue: taskFormData.amt,
                }}
                wrapperCol={{ span: 24, xxl: 24 }}
              >
                <Input disabled />
              </Field>
            </FieldLine>
            <Field
              name="expenseBuId"
              label="支出BU"
              decorator={{
                initialValue: taskFormData.expenseBuId,
                rules: [
                  {
                    required: true,
                    message: '请选择支出BU',
                  },
                ],
              }}
            >
              <AsyncSelect
                source={() => selectBus().then(resp => resp.response)}
                placeholder="请选择支出BU"
              />
            </Field>
            <Field
              name="settlementDate"
              label="结算日期"
              decorator={{
                initialValue: taskFormData.settlementDate || null,
                rules: [
                  {
                    required: false,
                    message: '请填写结算日期',
                  },
                ],
              }}
            >
              <DatePicker className="x-fill-100" placeholder="结算日期" format="YYYY-MM-DD" />
            </Field>
            <Field
              name="receiverBuId"
              label="收入BU"
              decorator={{
                initialValue: taskFormData.receiverBuId,
                rules: [
                  {
                    required: true,
                    message: '请选择收入BU',
                  },
                ],
              }}
            >
              <Selection
                key="receiverBuId"
                className="x-fill-100"
                source={baseBuDataSource}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onChange={value => {
                  this.fetchPrice(value);
                }}
                placeholder="请选择收入BU"
              />
            </Field>
            <Field
              name="receiverResId"
              label="收入资源"
              decorator={{
                initialValue: taskFormData.receiverResId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择收入资源',
                  },
                ],
              }}
            >
              <Selection.Columns
                key="receiverResId"
                className="x-fill-100"
                source={resDataSource}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                placeholder="请选择收入资源"
                onColumnsChange={value => {
                  if (value) {
                    setFieldsValue({
                      receiverBuId: value.baseBuId,
                      receiverBuName: value.baseBuName,
                      receiverResId: value.id,
                      receiverResName: value.name,
                    });
                  } else {
                    setFieldsValue({
                      receiverBuId: undefined,
                      receiverBuName: undefined,
                      receiverResId: undefined,
                      receiverResName: undefined,
                    });
                  }
                  this.fetchReceiverBu(value);
                }}
              />
            </Field>
            <Field
              name="settlementRemark"
              label="结算说明"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: taskFormData.settlementRemark || undefined,
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入结算说明" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default UniversalSettlement;
