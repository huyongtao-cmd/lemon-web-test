import React from 'react';
import { connect } from 'dva';
import { Button, Card, Divider, Form, Input, Radio, Tooltip } from 'antd';
import moment from 'moment';
import { formatMessage, FormattedMessage } from 'umi/locale';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import { FileManagerEnhance, UdcSelect } from '@/pages/gen/field';
import { closeThenGoto, markAsTab, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import Loading from '@/components/core/DataLoading';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import { fromQs, toUrl } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { ExpenseDetailList, PreDocList, ReasonSelect, ReimTypeSelect } from '../components';

import {
  getReimTmpl,
  selectFeeCode,
  selectPayPlan,
  checkExpensePeriod,
} from '@/services/user/expense/expense';

import createMessage from '@/components/core/AlertMessage';
import { request } from '@/utils/networkUtils';
import api from '@/api';

const { revoke } = api.bpm;
const { Field } = FieldList;

const RadioGroup = Radio.Group;

const DOMAIN = 'userExpenseSpecView'; //

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 费用报销
 */
@connect(({ loading, dispatch, user, userExpenseSpecView }) => ({
  loading,
  dispatch,
  user,
  userExpenseSpecView,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.userExpenseSpecView;
    const fields = {};
    Object.keys(formData).forEach(key => {
      fields[key] = Form.createFormField({ value: formData[key] });
    });
    return fields;
  },
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const key = Object.keys(changedFields)[0];
    const { value } = Object.values(changedFields)[0];

    const { dispatch } = props;

    if (key === 'abAcc')
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          abAccId: value.id,
          accountNo: value.accountNo,
          bankName: value.bankName,
          bankBranch: value.bankBranch,
          holderName: value.holderName,
        },
      });
    else
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [key]: value },
      });
  },
})
@mountToTab()
class ExpenseEdit extends React.PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    param.taskId &&
      dispatch({
        type: `${DOMAIN}/fetchConfig`,
        payload: param.taskId,
      });

    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param.id,
      }).then(result => {
        if (!isEmpty(result)) {
          const { reimType1, reimType2, reimType3, feeCode, reasonType, expenseBuId } = result;
          this.fetchTmpl(reimType1, reimType2, reimType3, feeCode);
          this.fetchFeeCode(reasonType, expenseBuId);
        }
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      userExpenseSpecView: { formData },
    } = this.props;
    const { reimType1, reimType2, reimType3, feeCode } = formData;
    const {
      reimType1: or1,
      reimType2: or2,
      reimType3: or3,
      feeCode: oe,
    } = prevProps.userExpenseSpecView.formData;
    if (reimType1 && reimType2 && reimType3 && feeCode) {
      if (reimType1 !== or1 || reimType2 !== or2 || reimType3 !== or3 || feeCode !== oe) {
        this.fetchTmpl(reimType1, reimType2, reimType3, feeCode);
      }
    }
  }

  fetchTmpl = (reimType1, reimType2, reimType3, feeCode) => {
    getReimTmpl({
      reimType1,
      reimType2,
      reimType3,
      feeCode,
    }).then(res => {
      const data = res.response.datum;

      const {
        dispatch,
        userExpenseSpecView: { formData },
      } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          reimTmpl: data || {},
          formData: {
            ...formData,
            reimTmplId: data ? data.id : undefined,
            tmplName: data ? data.tmplName : undefined,
          },
        },
      });
    });
  };

  fetchFeeCode = (reasonType, reasonId) => {
    selectFeeCode(reasonType, reasonId).then(res => {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          feeCodeList: Array.isArray(res.response) ? res.response : [],
        },
      });
    });
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    const {
      dispatch,
      loading,
      userExpenseSpecView: {
        formData,
        detailList,
        flowForm,
        fieldsConfig,
        feeCodeList = [],
        reimTmpl,
      },
      form: { getFieldDecorator },
    } = this.props;

    const param = fromQs();
    const { taskId, id } = param;

    const title = '专项费用报销详情';
    const preparing = loading.effects[param.id ? `${DOMAIN}/query` : `${DOMAIN}/init`];

    return (
      <PageHeaderWrapper title={title}>
        <BpmWrapper
          // fields={formData}
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          scope="ACC_A25"
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { taskKey } = fieldsConfig;
            const { key } = operation;

            const payload = {
              taskId: param.taskId,
              remark: bpmForm.remark,
            };

            if (key === 'EDIT') {
              // closeThenGoto('/plat/expense/normal/edit?id=' + param.id + '&taskId=' + param.taskId);
              closeThenGoto(
                `/plat/expense/spec/edit?id=${param.id}&apprId=${param.taskId}&remark=${
                  bpmForm.remark
                }`
              );
            }

            if (key === 'APPROVED') {
              if (
                [
                  'ACC_A25_02_FIN_CHECK_b', // 平台财务稽核专员审核
                  'ACC_A25_03_FIN_ACCOUNT', // 财务记账
                  'ACC_A25_04_FIN_CASHIER', // 平台财务出纳
                ].includes(taskKey)
              ) {
                // if (taskKey === 'ACC_A25_02_FIN_CHECK_b') {
                dispatch({
                  type: `${DOMAIN}/updateAdjustedAmt`,
                  payload,
                });
                return Promise.resolve(false);
              }

              if (taskKey.includes('FIN_ACCOUNT')) {
                checkExpensePeriod(moment().format('YYYY-MM-DD')).then(({ status, response }) => {
                  if (status === 100) {
                    // 主动取消请求
                  } else if (response.ok) {
                    dispatch({
                      type: `${DOMAIN}/approve`,
                      payload,
                    });
                  } else {
                    createMessage({
                      type: 'warn',
                      description: response.reason || '当前日期的财务期间未维护，请联系系统管理员',
                    });
                  }
                });
                return Promise.resolve(false);
              }

              dispatch({
                type: `${DOMAIN}/approve`,
                payload,
              });
              return Promise.resolve(false);
            }

            if (key === 'REJECTED') {
              // 不走封装的按钮控制，应为有多分支，后端审批接口入参策略不一致
              return Promise.resolve(true);
            }

            return Promise.resolve(false);
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              icon="form"
              size="large"
              disabled={!formData.editable}
              onClick={() => {
                closeThenGoto(`/plat/expense/spec/edit?id=${fromQs().id}`);
              }}
            >
              {formatMessage({ id: `misc.update`, desc: '修改' })}
            </Button>
            <Button
              className="tw-btn-primary"
              icon="rollback"
              size="large"
              disabled={!formData.revokable}
              onClick={() => {
                request.post(toUrl(revoke, { id: formData.procId })).then(({ response }) => {
                  if (response.ok) {
                    createMessage({ type: 'success', description: '撤销成功' });
                    window.location.reload();
                  } else {
                    createMessage({ type: 'error', description: `当前流程不可撤回` });
                  }
                });
              }}
            >
              撤回
            </Button>
            <a
              href={`/print?scope=ACC_A25&id=${fromQs().id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 'auto', marginRight: 8 }}
            >
              <Tooltip title="打印单据">
                <Button
                  className={classnames('tw-btn-default')}
                  type="dashed"
                  icon="printer"
                  size="large"
                />
              </Tooltip>
            </a>
            <Button
              className={classnames('tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() => {
                const { from } = param;
                if (from) {
                  closeThenGoto(from);
                } else
                  param.sourceUrl
                    ? closeThenGoto(param.sourceUrl)
                    : closeThenGoto('/plat/expense/list');
              }}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
          <Card
            className="tw-card-adjust deepColorDecorator"
            bordered={false}
            title={<Title icon="profile" text={title} />}
          >
            {preparing || preparing === undefined ? (
              <Loading />
            ) : (
              <>
                <div className="tw-card-title">基本信息</div>
                <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                  <Field
                    name="reimBatchNo"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.reimBatchNo`,
                      desc: '报销单批次号',
                    })}
                    decorator={{
                      initialValue: formData.reimBatchNo,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="reimNo"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.reimNo`,
                      desc: '报销单号',
                    })}
                    decorator={{
                      initialValue: formData.reimNo,
                    }}
                  >
                    <Input disabled />
                  </Field>

                  <Field
                    name="applyDate"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.applyDate`,
                      desc: '申请日期',
                    })}
                    decorator={{
                      initialValue: formData.applyDate,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="reimStatusName"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.reimStatusName`,
                      desc: '报销单状态',
                    })}
                    decorator={{
                      initialValue: formData.reimStatusName,
                    }}
                  >
                    <Input disabled />
                  </Field>

                  <Field
                    name="reimRes"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.reimResId`,
                      desc: '报销人',
                    })}
                    decorator={{
                      initialValue: formData.reimResName,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="resBuName"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.resBuName`,
                      desc: '报销人Base BU',
                    })}
                    decorator={{
                      initialValue: formData.resBuName,
                    }}
                  >
                    <Input disabled />
                  </Field>

                  <Field
                    name="reimType"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.reimType`,
                      desc: '报销类型',
                    })}
                    decorator={{
                      initialValue: [formData.reimType1, formData.reimType2, formData.reimType3],
                      rules: [
                        {
                          required: true,
                          message:
                            '请输入' +
                            formatMessage({
                              id: `ui.menu.user.expense.form.reimType`,
                              desc: '报销类型',
                            }),
                        },
                      ],
                    }}
                  >
                    <ReimTypeSelect isTrip={false} disabled />
                  </Field>
                  <Field
                    name="reason"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.reasonType`,
                      desc: '事由类型 / 事由号',
                    })}
                    decorator={{
                      initialValue: [formData.reasonType, formData.reasonId, formData.reasonName],
                      rules: [
                        {
                          required: true,
                          message:
                            '请输入' +
                            formatMessage({
                              id: `ui.menu.user.expense.form.reasonType`,
                              desc: '事由类型 / 事由号',
                            }),
                        },
                      ],
                    }}
                  >
                    <ReasonSelect disabled resId={formData.reimResId} />
                  </Field>
                  <Field
                    name="expenseBuName"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.expenseBuName`,
                      desc: '费用承担BU',
                    })}
                    decorator={{
                      initialValue: formData.expenseBuName,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="sumBuName"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.sumBuName`,
                      desc: '费用归属BU',
                    })}
                    decorator={{
                      initialValue: formData.sumBuName,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="expenseOuName"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.expenseOuName`,
                      desc: '费用承担公司',
                    })}
                    decorator={{
                      initialValue: formData.expenseOuName,
                    }}
                  >
                    <Input disabled />
                  </Field>

                  <Field
                    name="tmplName"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.reimTmplId`,
                      desc: '费用报销模板',
                    })}
                    decorator={{
                      initialValue: reimTmpl.tmplName,
                    }}
                  >
                    <Input disabled />
                  </Field>

                  <Field
                    name="feeCode"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.feeCode`,
                      desc: '费用码',
                    })}
                    decorator={{
                      initialValue: formData.feeCode,
                      rules: [
                        {
                          required: true,
                          message:
                            '请选择' +
                            formatMessage({
                              id: `ui.menu.user.expense.form.feeCode`,
                              desc: '费用码',
                            }),
                        },
                      ],
                    }}
                  >
                    <AsyncSelect
                      disabled
                      allowClear={false}
                      source={feeCodeList.map(f => ({
                        id: f.feeCode,
                        code: f.feeCode,
                        name: f.feeCodeDesc,
                      }))}
                    />
                  </Field>

                  <Field
                    name="expenseByType"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.expenseByType`,
                      desc: '费用承担方',
                    })}
                    decorator={{
                      initialValue: formData.expenseByType,
                    }}
                  >
                    <UdcSelect allowClear={false} code="ACC:REIM_EXP_BY" disabled />
                  </Field>
                  <Field
                    name="payMethod"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.payMethod`,
                      desc: '支付方式',
                    })}
                    decorator={{
                      initialValue: formData.payMethod,
                      rules: [
                        {
                          required: true,
                          message:
                            '请输入' +
                            formatMessage({
                              id: `ui.menu.user.expense.form.payMethod`,
                              desc: '支付方式',
                            }),
                        },
                      ],
                    }}
                  >
                    <UdcSelect allowClear={false} code="ACC:PAY_METHOD" disabled />
                  </Field>
                  {/* <Field
                    name="allocationFlag"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.allocationFlag`,
                      desc: '是否进行分摊',
                    })}
                    decorator={{
                      initialValue: formData.allocationFlag,
                      rules: [
                        {
                          required: true,
                          message:
                            '请输入' +
                            formatMessage({
                              id: `ui.menu.user.expense.form.allocationFlag`,
                              desc: 'allocationFlag',
                            }),
                        },
                      ],
                    }}
                  >
                    <RadioGroup disabled>
                      <Radio value={1}>是</Radio>
                      <Radio value={0}>否</Radio>
                    </RadioGroup>
                  </Field> */}
                  {/* <Field presentational /> */}

                  <Field
                    name="attache"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.attache`,
                      desc: '相关附件',
                    })}
                    decorator={{
                      initialValue: formData.attache,
                    }}
                  >
                    <FileManagerEnhance
                      api="/api/base/v1/reim/sfs/token"
                      dataKey={formData.id}
                      listType="text"
                      disabled
                      preview
                    />
                  </Field>
                  <Field
                    name="reimDate"
                    label="记账日期"
                    decorator={{
                      initialValue: formatDT(formData.reimDate),
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="finPeriodName"
                    label="财务期间"
                    decorator={{
                      initialValue: formData.finPeriodName,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    fieldCol={1}
                    labelCol={{ span: 4, xxl: 3 }}
                    wrapperCol={{ span: 19, xxl: 20 }}
                    name="remark"
                    label="报销说明"
                    decorator={{
                      initialValue: formData.remark,
                    }}
                  >
                    <Input.TextArea
                      disabled
                      autosize={{ minRows: 2, maxRows: 5 }}
                      className="x-fill-100"
                    />
                  </Field>
                </FieldList>

                <Divider dashed />

                {/* <div className="tw-card-title m-b-2">相关前置流程</div>

                <PreDocList
                  disabled
                  reimTmpl={reimTmpl.detailList}
                  dispatch={dispatch}
                  dataSource={detailList}
                  loading={false}
                />

                <br />

                <Divider dashed /> */}

                <div className="tw-card-title">费用明细</div>

                <br />

                <ExpenseDetailList
                  disabled
                  // disabled={
                  //   fieldsConfig &&
                  //   fieldsConfig.panels &&
                  //   fieldsConfig.panels.filter(f => f.id === 'details')[0]
                  //     ? !!fieldsConfig.panels.filter(f => f.id === 'details')[0].disabled
                  //     : true
                  // }
                  enableAdjustedAmt={
                    // eslint-disable-next-line no-nested-ternary
                    param.mode === 'view' || param.mode === undefined
                      ? false
                      : fieldsConfig &&
                        fieldsConfig.panels &&
                        fieldsConfig.panels.filter(f => f.id === 'details')[0]
                        ? !fieldsConfig.panels.filter(f => f.id === 'details')[0].disabled
                        : true
                  }
                  reimTmpl={reimTmpl.detailList}
                  dispatch={dispatch}
                  dataSource={detailList}
                  loading={false}
                  domain={DOMAIN}
                  isSpec
                  reimResId={formData.reimResId}
                  expenseType="spec"
                />

                <br />

                <Divider dashed />

                <div className="tw-card-title">账户明细</div>

                <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                  <Field
                    name="abAcc"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.abAccId`,
                      desc: '收款账户',
                    })}
                    decorator={{
                      initialValue: formData.accountNo,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="bankName"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.bankName`,
                      desc: '收款银行',
                    })}
                    decorator={{
                      initialValue: formData.bankName,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="holderName"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.holderName`,
                      desc: '户名',
                    })}
                    decorator={{
                      initialValue: formData.holderName,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="bankBranch"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.bankBranch`,
                      desc: '收款银行网点名称',
                    })}
                    decorator={{
                      initialValue: formData.bankBranch,
                    }}
                  >
                    <Input disabled />
                  </Field>
                </FieldList>
              </>
            )}
          </Card>
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'ACC_A25' }]} />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default ExpenseEdit;
