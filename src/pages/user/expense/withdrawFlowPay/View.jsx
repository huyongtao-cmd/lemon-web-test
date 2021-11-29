import React from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import {
  Button,
  Card,
  Cascader,
  Checkbox,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Table,
  Tooltip,
} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import { FileManagerEnhance, UdcSelect } from '@/pages/gen/field';
import { closeThenGoto, markAsTab, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import createMessage from '@/components/core/AlertMessage';
import classnames from 'classnames';
import DataTable from '@/components/common/DataTable';
import { isEmpty, isNil } from 'ramda';
import { fromQs } from '@/utils/stringUtils';
import { add, checkIfNumber, div, mul, sub } from '@/utils/mathUtils';
import { getReimTmpl, selectFeeCode, selectPayPlan } from '@/services/user/expense/expense';
import { selectSupplier } from '@/services/user/Contract/sales';
import { selectInternalOus } from '@/services/gen/list';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';

import {
  NormalAccSelect,
  BuSelect,
  ExpenseDetailList,
  PreDocList,
  ReasonSelect,
  ReimTypeSelect,
  ResSelect,
  MulResSelect,
} from '../components';
import update from '../components/forNormal/ExpenseDetailList';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'withdrawPayFlowView';

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 提现付款报销
 */
@connect(({ loading, user, withdrawPayFlowView }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/submit`],
  user,
  ...withdrawPayFlowView,
}))
@Form.create()
@mountToTab()
class WithdrawPayFlowView extends React.PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    param.taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: param.taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });

    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param.id,
      });
    }
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  // 提交按钮事件
  handleSave = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
    } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/submit`,
      payload: { id: param.id },
    });
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    const {
      dispatch,
      loading,
      formData = {},
      detailList,
      fieldsConfig: config,
      flowForm,
      reimTmpl,
      feeCodeList,
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;

    const TOTAL_LABEL = 'myTotal';
    const myDataSource = detailList.concat({
      id: TOTAL_LABEL,
      taxAmt: detailList.reduce((a, b) => add(a, b.taxAmt), 0),
      reimAmt: detailList.reduce((a, b) => add(a, b.reimAmt), 0),
      taxedReimAmt: detailList.reduce((a, b) => add(a, b.taxedReimAmt), 0),
      invCnt: detailList.reduce((a, b) => add(a, b.invCnt), 0),
      adjustedAmt: detailList.reduce((a, b) => add(a, b.adjustedAmt), 0),
      invFlag: detailList.filter(r => r.invFlag).length,
    });
    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      dataSource: myDataSource,
      loading,
      size: 'small',
      enableSelection: false,
      showSearch: false,
      showColumn: false,
      pagination: false,
      columns: [
        {
          title: '#',
          dataIndex: 'index',
          align: 'center',
          // fixed: true,
          width: 50,
          render: (value, row, index) => (row.id !== TOTAL_LABEL ? index + 1 : '合计'),
        },
        {
          title: '费用发生日期',
          dataIndex: 'feeDate',
          align: 'center',
          required: true,
          width: 140,
        },
        {
          title: '记账关联',
          dataIndex: 'relateName',
          align: 'center',
          required: true,
          width: 140,
          render: (value, row, index) => (value ? `${value}(${row.relateNo})` : ''),
        },
        {
          title: '科目',
          dataIndex: 'accName',
          align: 'center',
          required: true,
          width: 250,
        },
        {
          title: '报销说明',
          dataIndex: 'reimDesc',
          align: 'center',
          required: true,
          width: 200,
        },
        {
          title: '报销金额(含税)',
          dataIndex: 'taxedReimAmt',
          align: 'center',
          required: true,
          width: 100,
        },
        {
          title: '货币码',
          dataIndex: 'currCodeName',
          align: 'center',
          required: true,
          width: 50,
        },
        {
          title: '增值税税率',
          dataIndex: 'taxRate',
          align: 'center',
          required: true,
          width: 100,
        },
        {
          title: '税额',
          dataIndex: 'taxAmt',
          align: 'center',
          required: true,
          width: 90,
        },
        {
          title: '报销金额(不含税)',
          dataIndex: 'reimAmt',
          align: 'center',
          required: true,
          width: 100,
        },
        {
          title: '有票',
          dataIndex: 'invFlag',
          align: 'center',
          width: 50,
        },
        {
          title: '发票张数',
          dataIndex: 'invCnt',
          align: 'center',
          required: true,
          width: 100,
        },
      ],
    };

    const param = fromQs();

    return (
      <PageHeaderWrapper title="提现付款流程">
        <BpmWrapper
          fieldsConfig={config}
          flowForm={flowForm}
          scope="ACC_A38"
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { taskKey } = config;
            const { key } = operation;
            const payload = {
              taskId: param.taskId,
              remark: bpmForm.remark,
            };

            if (key === 'EDIT') {
              closeThenGoto(
                `/plat/expense/withdrawPayFlowEdit?id=${param.id}&mode=EDIT&taskId=${
                  param.taskId
                }&remark=${bpmForm.remark}`
              );
            }

            if (key === 'APPROVED') {
              return Promise.resolve(true);
            }

            if (key === 'REJECTED') {
              return Promise.resolve(true);
            }

            return Promise.resolve(false);
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={
                (formData.reimStatus !== 'CREATE' && formData.reimStatus !== 'REJECTED') || loading
              }
              onClick={() => this.handleSave()}
            >
              提交
            </Button>
            <Button
              className="tw-btn-primary"
              icon="form"
              size="large"
              hidden={
                (formData.reimStatus !== 'CREATE' && formData.reimStatus !== 'REJECTED') || loading
              }
              onClick={() =>
                closeThenGoto(
                  `/plat/expense/withdrawPayFlowEdit?id=${param.id}&mode=EDIT&taskId=${
                    param.taskId
                  }`
                )
              }
            >
              修改
            </Button>

            <a
              href={`/print?scope=ACC_A38&id=${fromQs().id}`}
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
          </Card>
          <Card className="tw-card-adjust" bordered={false}>
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
                    initialValue: formData.reimResId
                      ? {
                          name: formData.reimResName,
                          id: formData.reimResId + '',
                          jobGrade: formData.jobGrade,
                        }
                      : undefined,
                    rules: [
                      {
                        required: true,
                        message:
                          '请输入' +
                          formatMessage({
                            id: `ui.menu.user.expense.form.reimResId`,
                            desc: '报销人',
                          }),
                      },
                    ],
                  }}
                >
                  <ResSelect
                    disabled
                    onChange={value => {
                      if (!isEmpty(value)) {
                        dispatch({
                          type: `${DOMAIN}/updateForm`,
                          payload: {
                            // 清空供应商
                            supplierId: undefined,
                            phaseDesc: undefined,
                            // 清空账户字段
                            abAccId: undefined,
                            accountNo: undefined,
                            bankName: undefined,
                            bankBranch: undefined,
                            holderName: undefined,
                          },
                        });
                      }
                    }}
                  />
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
                      {
                        validator: (rule, value, callback) => {
                          if (value && value.filter(v => v === undefined).length) {
                            callback('请输入报销类型');
                          }
                          callback();
                        },
                      },
                    ],
                  }}
                >
                  <ReimTypeSelect
                    detailList={detailList}
                    disabled
                    onChange={value => {
                      if (!isEmpty(value)) {
                        dispatch({
                          type: `${DOMAIN}/updateForm`,
                          payload: {
                            // 清空供应商
                            supplierId: undefined,
                            phaseDesc: undefined,
                            // 清空账户字段
                            abAccId: undefined,
                            accountNo: undefined,
                            bankName: undefined,
                            bankBranch: undefined,
                            holderName: undefined,
                          },
                        });
                      }
                    }}
                  />
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
                      {
                        validator: (rule, value, callback) => {
                          // console.log(value);
                          if (!Array.isArray(value)) {
                            if (value.reasonType === void 0) {
                              callback('请选择事由类型');
                            }
                          } else if (value && value.filter(v => v === undefined).length) {
                            callback('请选择事由号');
                          }
                          callback();
                        },
                      },
                    ],
                  }}
                >
                  <ReasonSelect
                    disabled
                    resId={formData.reimResId}
                    detailList={detailList}
                    disableReasonType={
                      formData.reimType1 === 'BUSINESS' && formData.reimType2 === 'PURCHASE'
                    }
                    onChange={value => {
                      !isEmpty(value) &&
                        setFieldsValue({ tmplName: '' }) &&
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            feeCodeList: [],
                            reimTmpl: {},
                          },
                        });
                      !isEmpty(value) &&
                        dispatch({
                          type: `${DOMAIN}/updateForm`,
                          payload: {
                            // 清空供应商
                            supplierId: undefined,
                            phaseDesc: undefined,
                            // 清空账户字段
                            abAccId: undefined,
                            accountNo: undefined,
                            bankName: undefined,
                            bankBranch: undefined,
                            holderName: undefined,
                          },
                        });
                    }}
                  />
                </Field>
                <Field
                  name="expenseBu"
                  label={formatMessage({
                    id: `ui.menu.user.expense.form.expenseBuName`,
                    desc: '费用承担BU',
                  })}
                  decorator={{
                    initialValue: formData.expenseBuId
                      ? { buName: formData.expenseBuName, id: formData.expenseBuId + '' }
                      : undefined,
                    rules: [
                      {
                        required: true,
                        message: '请选择费用承担BU',
                      },
                    ],
                  }}
                >
                  <BuSelect
                    disabled
                    onChange={value => {
                      // bu任务 '03'
                      if (formData.reasonType === '03' && (formData || {}).reasonCode === 'TK000') {
                        !isEmpty(value) && this.fetchFeeCode(formData.reasonType, value.id);
                      }
                      // 采购合同 '04'
                      if (
                        formData.reasonType === '04' &&
                        (formData || {}).reasonCode === 'PU0000000000'
                      ) {
                        // 这个时候的 reasonType 应传 '03' 很神奇
                        !isEmpty(value) && this.fetchFeeCode('03', value.id);
                      }
                    }}
                  />
                </Field>
                <Field
                  name="expenseOuId"
                  label={formatMessage({
                    id: `ui.menu.user.expense.form.expenseOuName`,
                    desc: '费用承担公司',
                  })}
                  decorator={{
                    initialValue: formData.expenseOuId,
                    rules: [
                      {
                        required: true,
                        message: '请输入费用承担公司',
                      },
                    ],
                  }}
                >
                  <AsyncSelect
                    disabled
                    allowClear={false}
                    source={() => selectInternalOus().then(resp => resp.response)}
                  />
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
                  label={formatMessage({ id: `ui.menu.user.expense.form.feeCode`, desc: '费用码' })}
                  decorator={{
                    initialValue: formData.feeCode,
                    rules: [
                      {
                        required: true,
                        message:
                          '请输入' +
                          formatMessage({
                            id: `ui.menu.user.expense.form.feeCode`,
                            desc: '费用码',
                          }),
                      },
                    ],
                  }}
                >
                  <AsyncSelect disabled allowClear={false} source={feeCodeList} />
                </Field>

                <Field
                  name="expenseByType"
                  label={formatMessage({
                    id: `ui.menu.user.expense.form.expenseByType`,
                    desc: '费用承担方',
                  })}
                  decorator={{
                    initialValue: formData.expenseByType,
                    rules: [
                      {
                        required: true,
                        message:
                          '请选择' +
                          formatMessage({
                            id: `ui.menu.user.expense.form.expenseByType`,
                            desc: '费用承担方',
                          }),
                      },
                    ],
                  }}
                >
                  <UdcSelect disabled allowClear={false} code="ACC:REIM_EXP_BY" />
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
                  <UdcSelect disabled allowClear={false} code="ACC:PAY_METHOD" />
                </Field>

                <Field
                  name="withdrawPayId"
                  label="提现付款单"
                  decorator={{
                    initialValue: formData.withdrawPayId,
                  }}
                >
                  {formData.withdrawPayId ? (
                    <Link
                      className="tw-link"
                      to={`/user/center/withDrawPayDetail?id=${formData.withdrawPayId}`}
                    >
                      相关提现付款单
                    </Link>
                  ) : (
                    <span />
                  )}
                </Field>

                <Field presentational />
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

              <div className="tw-card-title">费用明细</div>

              <br />

              <DataTable {...tableProps} />

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
                    initialValue: formData.abAccId
                      ? { accountNo: formData.accountNo, id: formData.abAccId + '' }
                      : undefined,
                    rules: [
                      {
                        required: true,
                        message:
                          '请输入' +
                          formatMessage({
                            id: `ui.menu.user.expense.form.abAccId`,
                            desc: '收款账户',
                          }),
                      },
                    ],
                  }}
                >
                  <NormalAccSelect
                    disabled
                    resId={formData.reimResId}
                    suppId={formData.supplierId}
                  />
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

              <br />
              <div style={{ marginTop: 60 }} />
            </>
          </Card>
          {!param.taskId && <BpmConnection source={[{ docId: param.id, procDefKey: 'ACC_A38' }]} />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default WithdrawPayFlowView;
