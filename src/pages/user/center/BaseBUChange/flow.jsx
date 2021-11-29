import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, hasIn, clone } from 'ramda';
import { Card, Form, Input, Divider, Select, Checkbox, InputNumber } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import { findBuResRoleSelect } from '@/services/org/bu/component/buResInfo';
import AsyncSelect from '@/components/common/AsyncSelect';
import Title from '@/components/layout/Title';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { UdcSelect, Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { selectBus } from '@/services/org/bu/bu';
import moment from 'moment';
import ApplyBaseDetail from './detail';
import FlowCreate from './create';
import BaseBUView from './view';
import BaseBUSubmit from './submit';

const { Field } = FieldList;

const { Option } = Select;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'baseChangeFlow';

@connect(({ loading, baseChangeFlow, dispatch }) => ({
  loading:
    loading.effects[`${DOMAIN}/submit`] ||
    loading.effects[`${DOMAIN}/queryDetail`] ||
    loading.effects[`${DOMAIN}/BUupdate`] ||
    loading.effects[`${DOMAIN}/BUCreate`] ||
    loading.effects[`${DOMAIN}/oldBaseUserPass`] ||
    loading.effects[`${DOMAIN}/pmoCreate`] ||
    loading.effects[`${DOMAIN}/projectManagerCreate`],
  baseChangeFlow,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      const { trainFlag, date } = changedValues;
      if (!isNil(trainFlag)) {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { trainFlag: trainFlag ? '1' : '0' },
        });
        return;
      }
      if (!isNil(date)) {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            startDate:
              Array.isArray(date) && date[0] ? moment(date[0]).format('YYYY-MM-DD') : undefined,
            endDate:
              Array.isArray(date) && date[1] ? moment(date[1]).format('YYYY-MM-DD') : undefined,
          },
        });
        return;
      }

      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class BaseBUFlow extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId, mode } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` }).then(() => {
      // dispatch({type:`${DOMAIN}/role`});
      taskId
        ? dispatch({
            type: `${DOMAIN}/fetchConfig`,
            payload: taskId,
          }).then(response => {
            if (Object.keys(response).length !== 0) {
              const { taskKey } = response;
              // 先查询项目申请人填写的信息
              dispatch({
                type: `${DOMAIN}/queryDetail`,
                payload: id,
              }).then(res => {
                // 存在说明是上级拒绝要修改  不存在说明是新建
                if (res.projectView) {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      currentState: 'update',
                    },
                  });
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: res.projectView,
                  });
                }
              });
            }
          })
        : dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              fieldsConfig: {},
            },
          });
    });
  }

  render() {
    const {
      loading,
      dispatch,
      form,
      baseChangeFlow: { formData, flowForm, fieldsConfig, resultChkList },
    } = this.props;
    const { getFieldDecorator, validateFieldsAndScroll, setFieldsValue } = form;
    const { taskKey } = fieldsConfig;
    const { id, taskId, prcId, from, mode } = fromQs();
    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={loading}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { remark, branch } = bpmForm;
            const { key } = operation;
            const resultParams = {
              FLOW_PASS: 'APPROVED',
              FLOW_COMMIT: 'APPLIED',
              FLOW_RETURN: 'REJECTED',
            };

            let fnName = 'submit';
            const params = {
              ...formData,
              flow: {
                branch,
                remark,
                result: resultParams[key],
                taskId,
              },
            };
            // 不同节点用不同接口推
            switch (taskKey) {
              // 申请者再提交
              case 'ACC_A61_01_CHANGE_SUBMIT_i':
                fnName = 'submit';
                break;
              // 原BU上级资源审批
              case 'ACC_A61_02_OLDBASE_PRESID':
                fnName = 'BUupdate';
                break;
              // 原BU负责人审批
              case 'ACC_A61_03_OLDBASE_BURESID':
                fnName = 'oldBaseUserPass';
                break;
              // 变更资源确认
              case 'ACC_A61_06_RESID':
                fnName = 'newBaseMyUserPass';
                params.chkViewList = resultChkList; // 更新后的办理事项
                break;
              // 人事部确认
              case 'ACC_A61_07_HR':
                fnName = 'newBaseHrApprove';
                break;
              // 第五节点新BU负责人审批,和第四节点新BU上级资源审批
              default:
                fnName = 'newBasePUserPass';
            }
            // 对应接口推流程
            function flowMethod() {
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  dispatch({
                    type: `${DOMAIN}/${fnName}`,
                    payload: params,
                  });
                }
              });
            }
            // 拒绝时弹出拒绝确认框
            if (key === 'FLOW_RETURN') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk() {
                  dispatch({
                    type: `${DOMAIN}/${fnName}`,
                    payload: params,
                  });
                },
              });
            } else {
              flowMethod();
            }
            return Promise.resolve(false);
          }}
        >
          {mode === 'view' ? <ApplyBaseDetail form={form} /> : null}
          {taskKey === 'ACC_A61_01_CHANGE_SUBMIT_i' && mode === 'edit' ? (
            <BaseBUSubmit form={form} /> // 第一节点再提交页面
          ) : null}
          {(taskKey === 'ACC_A61_02_OLDBASE_PRESID' && mode === 'edit') ||
          (taskKey === 'ACC_A61_03_OLDBASE_BURESID' && mode === 'edit') ? (
            <Card
              className="tw-card-adjust"
              style={{ marginTop: '6px' }}
              title={<Title icon="profile" text="BaseBU变更申请" />}
              bordered={false}
            >
              <FieldList
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={2}
                legend="原BU"
              >
                <Field
                  name="resId"
                  label="变更资源"
                  decorator={{
                    initialValue: formData.resName || '',
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="oldBuId"
                  label="BaseBU"
                  decorator={{
                    initialValue: formData.oldBuName || '',
                  }}
                >
                  <Input disabled />
                </Field>

                <Field
                  name="oldPResId"
                  label="上级资源"
                  decorator={{
                    initialValue: formData.oldPResName || '',
                  }}
                >
                  <Input disabled />
                </Field>
              </FieldList>
              <Divider dashed />
              <FieldList
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={2}
                legend="新BU"
              >
                <Field
                  name="newBuId"
                  label="新BaseBU"
                  decorator={{
                    initialValue: formData.newBuName || '',
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="newPResId"
                  label="上级资源"
                  decorator={{
                    initialValue: formData.newPResName || '',
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="dateFrom"
                  label="加入时间"
                  decorator={{
                    initialValue: formData.dateFrom || '',
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="changeDesc"
                  label="变更说明"
                  decorator={{
                    initialValue: formData.changeDesc,
                  }}
                  fieldCol={1}
                  labelCol={{ span: 4, xxl: 3 }}
                  wrapperCol={{ span: 19, xxl: 20 }}
                >
                  <Input.TextArea rows={3} placeholder="请输入变更说明" disabled />
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
          ) : null}

          {(taskKey === 'ACC_A61_04_NEWBASE_PRESID' && mode === 'edit') ||
          (taskKey === 'ACC_A61_05_NEWBASE_BURESID' && mode === 'edit') ? (
            <Card
              className="tw-card-adjust"
              style={{ marginTop: '6px' }}
              title={<Title icon="profile" text="BaseBU变更申请" />}
              bordered={false}
            >
              <FieldList
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={2}
                legend="原BU"
              >
                <Field
                  name="resId"
                  label="变更资源"
                  decorator={{
                    initialValue: formData.resName || '',
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="oldBuId"
                  label="BaseBU"
                  decorator={{
                    initialValue: formData.oldBuName || '',
                  }}
                >
                  <Input disabled />
                </Field>

                <Field
                  name="oldPResId"
                  label="上级资源"
                  decorator={{
                    initialValue: formData.oldPResName || '',
                  }}
                >
                  <Input disabled />
                </Field>
              </FieldList>
              <Divider dashed />
              <FieldList
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={2}
                legend="新BU"
              >
                <Field
                  name="newBuId"
                  label="新BaseBU"
                  decorator={{
                    initialValue: formData.newBuName || '',
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="newPResId"
                  label="上级资源"
                  decorator={{
                    initialValue: formData.newPResName || '',
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="dateFrom"
                  label="加入时间"
                  decorator={{
                    initialValue: formData.dateFrom || '',
                    rules: [
                      {
                        required: taskKey === 'ACC_A61_05_NEWBASE_BURESID',
                        message: '请选择加入时间',
                      },
                    ],
                  }}
                >
                  <DatePicker format="YYYY-MM-DD" className="x-fill-100" />
                </Field>
                <Field
                  name="coopType"
                  label="合作方式"
                  decorator={{
                    initialValue: formData.coopTypeName || '',
                    rules: [
                      {
                        required: taskKey === 'ACC_A61_05_NEWBASE_BURESID',
                        message: '请选择合作方式',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="COM.COOPERATION_MODE" placeholder="请选择合作方式" />
                </Field>
                <Field
                  name="eqvaRatio"
                  label="当量系数"
                  decorator={{
                    initialValue: formData.eqvaRatio || '',
                    rules: [
                      {
                        required: taskKey === 'ACC_A61_05_NEWBASE_BURESID',
                        message: '请选择当量系数',
                      },
                    ],
                  }}
                >
                  <InputNumber className="x-fill-100" />
                </Field>

                <Field
                  name="date"
                  label="当量系数有效期"
                  decorator={{
                    initialValue:
                      formData.startDate && formData.endDate
                        ? [moment(formData.startDate), moment(formData.endDate)]
                        : undefined,
                    rules: [
                      {
                        required: taskKey === 'ACC_A61_05_NEWBASE_BURESID',
                        message: '请选择开始-结束日期',
                      },
                    ],
                  }}
                >
                  <DatePicker.RangePicker
                    placeholder={['开始日期', '结束日期']}
                    className="x-fill-100"
                  />
                </Field>
                <Field
                  name="salaryMethod"
                  label="发薪方式"
                  decorator={{
                    initialValue: formData.salaryMethod || '',
                  }}
                >
                  <UdcSelect code="COM.SALARY_METHOD" placeholder="请选择发薪方式" />
                </Field>
                <Field
                  name="salaryPeriod"
                  label="发薪周期"
                  decorator={{
                    initialValue: formData.salaryPeriod || '',
                  }}
                >
                  <UdcSelect code="COM.SALARY_CYCLE" placeholder="请选择发薪周期" />
                </Field>
                <Field
                  name="roleCode"
                  label="BU角色"
                  decorator={{
                    initialValue: formData.roleCode,
                    // rules: [{ required: true, message: '请选择BU角色' }],
                  }}
                  fieldCol={1}
                  labelCol={{ span: 4, xxl: 3 }}
                  wrapperCol={{ span: 19, xxl: 20 }}
                >
                  <AsyncSelect
                    source={() => findBuResRoleSelect().then(resp => resp.response)}
                    placeholder="请选择BU角色"
                    showSearch
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    mode="multiple"
                  />
                </Field>
                <Field
                  name="changeDesc"
                  label="变更说明"
                  decorator={{
                    initialValue: formData.changeDesc || '',
                  }}
                  fieldCol={1}
                  labelCol={{ span: 4, xxl: 3 }}
                  wrapperCol={{ span: 19, xxl: 20 }}
                >
                  <Input.TextArea rows={3} disabled />
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
          ) : null}
          {(taskKey === 'ACC_A61_06_RESID' && mode === 'edit') ||
          (taskKey === 'ACC_A61_07_HR' && mode === 'edit') ? (
            <BaseBUView form={form} />
          ) : null}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default BaseBUFlow;
