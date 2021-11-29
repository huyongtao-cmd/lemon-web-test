import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isEmpty } from 'ramda';
import { Card, Form, Input, Divider, InputNumber } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection, DatePicker, FileManagerEnhance } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { selectProjectTmpl } from '@/services/user/project/project';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectUsersWithBu } from '@/services/gen/list';
import { stringify } from 'qs';
import { mul } from '@/utils/mathUtils';
import ViewDetail from './ViewDetail';

const { Field, FieldLine } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'noContractProj';

@connect(({ loading, noContractProj, dispatch }) => ({
  loading,
  noContractProj,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class noContractProj extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();

    dispatch({ type: `${DOMAIN}/clean` }).then(res => {
      // 有id，修改
      id &&
        dispatch({
          type: `${DOMAIN}/flowDetail`,
          payload: { id },
        });

      taskId
        ? dispatch({
            type: `${DOMAIN}/fetchConfig`,
            payload: taskId,
          })
        : dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              fieldsConfig: {
                buttons: [],
                panels: {
                  disabledOrHidden: {},
                },
              },
            },
          });
    });
  }

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, validateFieldsAndScroll, setFields },
      noContractProj: { formData, flowForm, fieldsConfig },
    } = this.props;
    const {
      panels: { disabledOrHidden },
      taskKey,
    } = fieldsConfig;
    const { id, taskId, prcId, mode } = fromQs();

    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { remark } = bpmForm;
            const { key } = operation;
            if (key === 'REJECTED') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () =>
                  pushFlowTask(taskId, {
                    remark,
                    result: key,
                  }).then(({ status, response }) => {
                    if (status === 200) {
                      createMessage({ type: 'success', description: '操作成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    }
                    return Promise.resolve(false);
                  }),
              });
            }
            if (key === 'CLOSE') {
              createConfirm({
                content: '确定要关闭该流程吗？',
                onOk: () =>
                  dispatch({
                    type: `${DOMAIN}/closeFlow`,
                    payload: {
                      prcId,
                      remark,
                    },
                  }),
              });
            }

            if (taskKey === 'ACC_A47_04_PROJECT_NFORMATION_b') {
              if (key === 'projectMsgComplete') {
                const urls = getUrl();
                const from = stringify({ from: urls });
                router.push(
                  `/user/project/projectEdit?id=${
                    formData.projId
                  }&mode=update&taskId=${taskId}&remark=${remark}&${from}`
                );
              }
            }

            if (key === 'APPROVED' || key === 'APPLIED') {
              if (taskKey === 'ACC_A47_01_SUBMIT_i') {
                // 当量预估单价/总价 必填
                const { eqvaPrice } = formData;
                if (!eqvaPrice) {
                  setFields({
                    eqvaPrice: {
                      value: undefined,
                      errors: [new Error('必填')],
                    },
                  });
                }
              }
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  dispatch({
                    type: `${DOMAIN}/submit`,
                    payload: {
                      taskId,
                      result: key,
                      procRemark: remark,
                      submit: 'true',
                    },
                  }).then(res => {
                    if (res.ok) {
                      createMessage({ type: 'success', description: '操作成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    } else {
                      createMessage({ type: 'error', description: res.reason || '保存失败' });
                    }
                  });
                }
              });
            }
            return Promise.resolve(false);
          }}
        >
          {mode === 'edit' && (
            <Card
              className="tw-card-adjust"
              style={{ marginTop: '6px' }}
              title={<Title icon="profile" text="无合同项目申请" />}
              bordered={false}
            >
              <FieldList
                legend="项目简况"
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="projName"
                  label="项目名称"
                  decorator={{
                    initialValue: formData.projName || undefined,
                    rules: [
                      {
                        required: !disabledOrHidden.projName,
                        message: '请输入项目名称',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入项目名称" disabled={!!disabledOrHidden.projName} />
                </Field>
                <Field
                  name="workType"
                  label="工作类型"
                  decorator={{
                    initialValue: formData.workType || undefined,
                    rules: [
                      {
                        required: !disabledOrHidden.workType,
                        message: '请选择工作类型',
                      },
                    ],
                  }}
                >
                  <Selection.UDC
                    code="TSK:WORK_TYPE"
                    filters={[{ sphd3: 'NO_CONTRACT' }]}
                    placeholder="请选择工作类型"
                    disabled={!!disabledOrHidden.workType}
                  />
                </Field>
                <Field
                  name="projTempId"
                  label="项目模板"
                  decorator={{
                    initialValue: formData.projTempId || undefined,
                    rules: [
                      {
                        required: !disabledOrHidden.projTempId,
                        message: '请选择项目模板',
                      },
                    ],
                  }}
                >
                  <Selection
                    className="x-fill-100"
                    source={() => selectProjectTmpl()}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => {}}
                    onChange={value => {}}
                    placeholder="请选择项目模板"
                    disabled={!!disabledOrHidden.projTempId}
                  />
                </Field>
                <Field
                  name="currCode"
                  label="币种"
                  decorator={{
                    initialValue: formData.currCode || undefined,
                    rules: [
                      {
                        required: !disabledOrHidden.currCode,
                        message: '请选择币种',
                      },
                    ],
                  }}
                >
                  <Selection.UDC
                    code="COM:CURRENCY_KIND"
                    placeholder="请选择币种"
                    disabled={!!disabledOrHidden.currCode}
                  />
                </Field>
                <Field
                  name="startDate"
                  label="预计开始日期"
                  decorator={{
                    initialValue: formData.startDate || undefined,
                  }}
                >
                  <DatePicker format="YYYY-MM-DD" disabled={!!disabledOrHidden.startDate} />
                </Field>
                <Field
                  name="endDate"
                  label="预计结束日期"
                  decorator={{
                    initialValue: formData.endDate || undefined,
                  }}
                >
                  <DatePicker format="YYYY-MM-DD" disabled={!!disabledOrHidden.endDate} />
                </Field>
                <Field
                  name="SOWAdjunct"
                  label="SOW节选"
                  decorator={{
                    initialValue: formData.id || undefined,
                  }}
                >
                  <FileManagerEnhance
                    api="/api/op/v1/noContract/project/sow/sfs/token"
                    dataKey={formData.id}
                    listType="text"
                  />
                </Field>
                <Field
                  name="remark"
                  label="备注"
                  fieldCol={1}
                  labelCol={{ span: 4, xxl: 3 }}
                  wrapperCol={{ span: 19, xxl: 20 }}
                  decorator={{
                    initialValue: formData.remark || undefined,
                  }}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="请输入备注"
                    disabled={!!disabledOrHidden.remark}
                  />
                </Field>

                <Field
                  name="applyResName"
                  label="申请人"
                  decorator={{
                    initialValue: formData.applyResName || undefined,
                  }}
                >
                  <Input placeholder="系统自动生成" disabled />
                </Field>
                <Field
                  name="applyDate"
                  label="申请日期"
                  decorator={{
                    initialValue: formData.applyDate || undefined,
                  }}
                >
                  <Input placeholder="系统自动生成" disabled />
                </Field>
              </FieldList>
              <Divider dashed />
              <FieldList
                legend="相关人员"
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="expenseBuId"
                  label="费用承担BU"
                  decorator={{
                    initialValue: formData.expenseBuId || undefined,
                    rules: [
                      {
                        required: !disabledOrHidden.expenseBuId,
                        message: '请选择费用承担BU',
                      },
                    ],
                  }}
                >
                  <Selection.Columns
                    className="x-fill-100"
                    source={() => selectBuMultiCol()}
                    columns={particularColumns}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => {}}
                    placeholder="请选择费用承担BU"
                    disabled={!!disabledOrHidden.expenseBuId}
                  />
                </Field>
                <Field
                  name="deliBuId"
                  label="交付BU"
                  decorator={{
                    initialValue: formData.deliBuId || undefined,
                    rules: [
                      {
                        required: !disabledOrHidden.deliBuId,
                        message: '请选择交付BU',
                      },
                    ],
                  }}
                >
                  <Selection.Columns
                    className="x-fill-100"
                    source={() => selectBuMultiCol()}
                    columns={particularColumns}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => {}}
                    placeholder="请选择交付BU"
                    disabled={!!disabledOrHidden.deliBuId}
                  />
                </Field>
                <Field
                  name="deliResId"
                  label="交付负责人"
                  decorator={{
                    initialValue: formData.deliResId || undefined,
                    rules: [
                      {
                        required: !disabledOrHidden.deliResId,
                        message: '请选择交付负责人',
                      },
                    ],
                  }}
                >
                  <Selection.Columns
                    className="x-fill-100"
                    source={() => selectUsersWithBu()}
                    columns={particularColumns}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => {}}
                    placeholder="请选择交付负责人"
                    disabled={!!disabledOrHidden.deliResId}
                  />
                </Field>
                <Field
                  name="pmResId"
                  label="项目经理"
                  decorator={{
                    initialValue: formData.pmResId || undefined,
                  }}
                >
                  <Selection.Columns
                    className="x-fill-100"
                    source={() => selectUsersWithBu()}
                    columns={particularColumns}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => {}}
                    placeholder="请选择项目经理"
                    disabled={!!disabledOrHidden.pmResId}
                  />
                </Field>
              </FieldList>
              <Divider dashed />
              <FieldList
                legend="总预算信息"
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="totalDays"
                  label="预计总人天"
                  decorator={{
                    initialValue: formData.totalDays || undefined,
                    rules: [
                      {
                        required: !disabledOrHidden.totalDays,
                        message: '请输入预计总人天',
                      },
                    ],
                  }}
                >
                  <InputNumber
                    className="x-fill-100"
                    placeholder="请输入预计总人天"
                    disabled={!!disabledOrHidden.totalDays}
                  />
                </Field>
                <Field
                  name="totalEqva"
                  label="预计总当量"
                  decorator={{
                    initialValue: formData.totalEqva || undefined,
                    rules: [
                      {
                        required: !disabledOrHidden.totalEqva,
                        message: '请输入预计总当量',
                      },
                    ],
                  }}
                >
                  <InputNumber
                    className="x-fill-100"
                    placeholder="请输入预计总当量"
                    disabled={!!disabledOrHidden.totalEqva}
                  />
                </Field>
                <FieldLine label="当量预估单价/总价" required={!disabledOrHidden.eqvaPrice}>
                  <Field
                    name="eqvaPrice"
                    decorator={{
                      initialValue: formData.eqvaPrice || '',
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <InputNumber
                      className="x-fill-100"
                      placeholder="请输入当量预估单价"
                      disabled={!!disabledOrHidden.eqvaPrice}
                    />
                  </Field>
                  <Field
                    name="eqvaPriceTotal"
                    decorator={{
                      initialValue:
                        mul(Number(formData.eqvaPrice), Number(formData.totalEqva)) || '',
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <InputNumber className="x-fill-100" placeholder="请输入当量总价" disabled />
                  </Field>
                </FieldLine>
                <Field
                  name="totalReimbursement"
                  label="费用总预算"
                  decorator={{
                    initialValue: formData.totalReimbursement || undefined,
                    rules: [
                      {
                        required: !disabledOrHidden.totalReimbursement,
                        message: '请输入费用总预算',
                      },
                    ],
                  }}
                >
                  <InputNumber
                    className="x-fill-100"
                    placeholder="请输入费用总预算"
                    disabled={!!disabledOrHidden.totalReimbursement}
                  />
                </Field>
                <Field
                  name="totalCost"
                  label="预算总成本"
                  decorator={{
                    initialValue: formData.totalCost || undefined,
                    rules: [
                      {
                        required: !disabledOrHidden.totalCost,
                        message: '请输入预算总成本',
                      },
                    ],
                  }}
                >
                  <InputNumber
                    className="x-fill-100"
                    placeholder="请输入预算总成本"
                    disabled={!!disabledOrHidden.totalCost}
                  />
                </Field>
                <Field
                  name="budgetAdjunct"
                  label="预算附件"
                  decorator={{
                    initialValue: formData.id || undefined,
                  }}
                >
                  <FileManagerEnhance
                    api="/api/op/v1/noContract/project/budget/sfs/token"
                    dataKey={formData.id}
                    listType="text"
                    preview={!!disabledOrHidden.budgetAdjunct}
                  />
                </Field>
              </FieldList>
            </Card>
          )}
          {mode === 'view' && <ViewDetail />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default noContractProj;
