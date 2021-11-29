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
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { selectUsersWithBu } from '@/services/gen/list';
import { selectBus } from '@/services/org/bu/bu';
import SettlementModal from './settlementModal';
import SelectWithCols from '@/components/common/SelectWithCols';

const { Field, FieldLine } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'equivalentCreateFlow';

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, equivalentCreateFlow, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/queryTaskDetail`],
  equivalentCreateFlow,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      const key = Object.keys(changedValues)[0];
      if (key === 'reasonId') {
        props.dispatch({
          type: `${DOMAIN}/updateTaskForm`,
          payload: {
            reasonId: changedValues[key] ? changedValues[key].id : null,
            reasonName: changedValues[key] ? changedValues[key].name : null,
          },
        });
      } else {
        props.dispatch({
          type: `${DOMAIN}/updateTaskForm`,
          payload: changedValues,
        });
      }
    }
  },
})
// @mountToTab()
class TaskSettlementCreate extends PureComponent {
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
    // 项目列表
    dispatch({
      type: `${DOMAIN}/queryProjList`,
    });
    // BU列表
    dispatch({
      type: `${DOMAIN}/queryBuList`,
    });
    // 售前列表
    dispatch({
      type: `${DOMAIN}/queryPreSaleList`,
    });
  }

  // 根据收入BU改变金额和最终结算价
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
          receiverResId: value.id,
          receiverResName: value.name,
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateTaskForm`,
        payload: {
          receiverBuId: undefined,
          receiverBuName: undefined,
          receiverResId: undefined,
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
      equivalentCreateFlow: {
        taskFormData,
        buSource,
        buList,
        taskProjSource,
        taskProjList,
        preSaleSource,
        preSaleList,
        resDataSource,
        baseBuDataSource,
        formData,
        reasonIdList,
        reasonIdSource,
      },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="任务包基本信息"
          >
            <Field
              name="taskName"
              label="任务包名称"
              decorator={{
                initialValue: taskFormData.taskName || undefined,
                rules: [
                  {
                    required: true,
                    message: '请输入任务包名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入任务包名称" />
            </Field>
            <FieldLine label="验收/计价方式" fieldCol={2}>
              <Field
                name="acceptMethod"
                decorator={{
                  initialValue: taskFormData.acceptMethod,
                }}
                wrapperCol={{ span: 23, xxl: 24 }}
              >
                <UdcSelect code="TSK.ACCEPT_METHOD" placeholder="请选择验收方式" disabled />
              </Field>
              <Field
                name="pricingMethod"
                decorator={{
                  initialValue: taskFormData.pricingMethod,
                }}
                wrapperCol={{ span: 24, xxl: 24 }}
              >
                <UdcSelect code="TSK:PRICING_METHOD" placeholder="请选择计价方式" disabled />
              </Field>
            </FieldLine>
            <Field
              name="reasonType"
              label="事由类型"
              decorator={{
                initialValue: taskFormData.reasonType || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择事由类型',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="TSK.TASK_REASON_TYPE"
                placeholder="请选择事由类型"
                onChange={value => {
                  setFieldsValue({
                    reasonId: null,
                  });
                }}
              />
            </Field>
            <Field
              name="reasonId"
              key="reasonId"
              label="事由号"
              decorator={{
                // initialValue: {
                //   code: taskFormData.reasonId,
                //   name: taskFormData.reasonName,
                // },
                initialValue: taskFormData.reasonId,
                rules: [
                  {
                    required: true,
                    message: '请选择事由号',
                  },
                ],
              }}
            >
              {{
                '01': (
                  <SelectWithCols
                    labelKey="name"
                    className="x-fill-100"
                    placeholder="请选择事由号"
                    columns={SEL_COL}
                    dataSource={taskProjSource}
                    // onChange={value => {
                    //   this.handleChangeReasonId(value);
                    // }}
                    selectProps={{
                      showSearch: true,
                      onSearch: value => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            taskProjSource: taskProjList.filter(
                              d =>
                                d.code.indexOf(value) > -1 ||
                                d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                            ),
                          },
                        });
                      },
                      allowClear: true,
                    }}
                  />
                ),
                '02': (
                  <SelectWithCols
                    labelKey="name"
                    className="x-fill-100"
                    placeholder="请选择事由号"
                    columns={SEL_COL}
                    dataSource={preSaleSource}
                    // onChange={value => {
                    //   this.handleChangeReasonId(value);
                    // }}
                    selectProps={{
                      showSearch: true,
                      onSearch: value => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            preSaleSource: preSaleList.filter(
                              d =>
                                d.code.indexOf(value) > -1 ||
                                d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                            ),
                          },
                        });
                      },
                      allowClear: true,
                    }}
                  />
                ),
                '03': (
                  <SelectWithCols
                    labelKey="name"
                    className="x-fill-100"
                    placeholder="请选择事由号"
                    columns={SEL_COL}
                    dataSource={buSource}
                    // onChange={value => {
                    //   this.handleChangeReasonId(value);
                    // }}
                    selectProps={{
                      showSearch: true,
                      onSearch: value => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            buSource: buList.filter(
                              d =>
                                d.code.indexOf(value) > -1 ||
                                d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                            ),
                          },
                        });
                      },
                      allowClear: true,
                    }}
                  />
                ),
              }[taskFormData.reasonType] || <span className="text-disable">不可选择</span>}
            </Field>
          </FieldList>
          <br />
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="结算信息"
          >
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
              name="settlePrice"
              label="最终结算价"
              decorator={{
                initialValue: taskFormData.settlePrice,
              }}
            >
              <Input placeholder="最终结算价" disabled />
            </Field>
            <Field
              name="expenseBuId"
              label="支出BU"
              decorator={{
                initialValue: taskFormData.expenseBuId,
              }}
            >
              <AsyncSelect
                source={() => selectBus().then(resp => resp.response)}
                placeholder="自动带出"
                disabled
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
                initialValue: taskFormData.receiverResId,
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

export default TaskSettlementCreate;
