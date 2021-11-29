import React from 'react';
import { connect } from 'dva';
import { Button, Card, Divider, Form, Input, Radio, Tooltip } from 'antd';
import moment from 'moment';
import { formatMessage, FormattedMessage } from 'umi/locale';
import Link from 'umi/link';
import FieldList from '@/components/layout/FieldList';
import { FileManagerEnhance, UdcSelect } from '@/pages/gen/field';
import { closeThenGoto, injectUdc, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import {
  getReimTmpl,
  selectFeeCode,
  selectPayPlan,
  checkExpensePeriod,
  checkProjectBudget,
} from '@/services/user/expense/expense';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import { fromQs, toUrl } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { formatDT } from '@/utils/tempUtils/DateTime';
import {
  AccSelect,
  ReasonSelect,
  ReimTypeSelect,
  ResSelect,
  TripApplySelect,
  TripExpenseDetailList,
} from '../components';
import TripModalView from './TripModalView';

import createMessage from '@/components/core/AlertMessage';
import { request } from '@/utils/networkUtils';
import api from '@/api';

const { revoke } = api.bpm;
const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'userExpenseTripView'; //

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 差旅费用报销
 */
@connect(({ loading, dispatch, userExpenseTripView }) => ({
  loading,
  dispatch,
  userExpenseTripView,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.userExpenseTripView;
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

    // console.log(key, value);

    switch (key) {
      case 'reimRes': {
        // 报销人联动
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            reimResId: value.id,
            reimResName: value.name,
            resBuName: value.receiverBuName,
            jobGrade: value.jobGrade,
          },
        });
        break;
      }
      case 'busitripApply': {
        // 报销类型联动
        if (value) {
          const {
            id,
            applyName,
            expenseBuId,
            expenseBuName,
            expenseOuId,
            expenseOuName,
            reasonId,
            reasonType,
            reasonTypeDesc,
            sumBuId,
            sumBuName,
          } = value;
          props.dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              busitripApplyId: id,
              busitripApplyName: applyName,
              expenseBuId,
              expenseBuName,
              expenseOuId,
              expenseOuName,
              reasonId,
              reasonType,
              reasonTypeDesc,
              sumBuId,
              sumBuName,
            },
          });
        } else {
          props.dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              busitripApplyId: undefined,
              busitripApplyName: undefined,
              expenseBuId: undefined,
              expenseBuName: undefined,
              expenseOuId: undefined,
              expenseOuName: undefined,
              reasonId: undefined,
              reasonType: undefined,
              reasonTypeDesc: undefined,
              sumBuId: undefined,
              sumBuName: undefined,
            },
          });
        }

        // props.dispatch({ type: `${DOMAIN}/updateState`, payload: { detailList: [] } });
        break;
      }
      case 'reason': {
        // 事由类型 / 事由号 联动
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            ...value,
            reimType3: value.reasonType === '01' ? 'PROJ' : 'NONPROJ',
          },
        });
        props.dispatch({ type: `${DOMAIN}/updateState`, payload: { detailList: [] } });
        break;
      }
      case 'abAcc': {
        // 收款账户 联动
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            abAccId: value.id,
            accountNo: value.accountNo,
            bankName: value.bankName,
            bankBranch: value.bankBranch,
            holderName: value.holderName,
          },
        });
        break;
      }

      default: {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [key]: value },
        });
      }
    }
  },
})
@injectUdc(
  {
    cities: 'COM:CITY',
  },
  DOMAIN
)
@mountToTab()
class ExpenseEdit extends React.PureComponent {
  /**
   * 页面内容加载之前要做的事情放在这里
   */
  constructor(props) {
    super(props);
    this.state = {
      // tripApplyList: [],
      reimTmpl: {},
      // modalVisible: false,
    };
  }

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

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      userExpenseTripView: { formData },
    } = this.props;

    // const { reasonType, reasonId } = formData;
    // if (reasonType && reasonId) {
    //   const { reasonType: prt, reasonId: ori } = prevProps.userExpenseTripView.formData;
    //
    //   if (reasonType && reasonId) {
    //     if (reasonType !== prt || reasonId !== ori) {
    //       this.fetchFeeCode(reasonType, reasonId);
    //     }
    //   }
    // }

    // console.log('dddd', this.props.userExpenseTripView);
    //
    // if (formData.reimResId) {
    //   const { reimResId } = formData;
    //   const {
    //     reimResId: orId,
    //   } = prevProps.userExpenseTripView.formData;
    //
    //   console.log(orId, reimResId);
    //   if (reimResId !== orId) {
    //     this.fetchTripApplyList(reimResId);
    //   }
    // }
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  fetchFeeCode = (reasonType, reasonId) => {
    selectFeeCode(reasonType, reasonId).then(res => {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          feeCodeList: Array.isArray(res.response)
            ? res.response.map(f => ({ id: f.feeCode, code: f.feeCode, name: f.feeCodeDesc }))
            : [],
        },
      });
    });
  };

  // 保存按钮事件
  handleSave = isSubmit => () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
    } = this.props;
    // 获取url上的参数
    const param = fromQs();
    if (param.id) {
      // 编辑保存
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          dispatch({
            type: `${DOMAIN}/save`,
            payload: {
              id: param.id,
              isSubmit,
            },
          });
        }
      });
    } else {
      // 新建保存
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          dispatch({
            type: `${DOMAIN}/create`,
            payload: {
              isSubmit,
            },
          });
        }
      });
    }
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    const {
      dispatch,
      loading,
      userExpenseTripView: {
        formData,
        detailList,
        flowForm,
        fieldsConfig,
        feeCodeList,
        visible,
        modalParmas,
        mealMoenyList,
      },
      form: { getFieldDecorator },
    } = this.props;
    const { reimTmpl, _udcMap = {} } = this.state;
    const { cities = [] } = _udcMap;
    const { taskKey, panels } = fieldsConfig;

    const param = fromQs();
    const { taskId, id } = param;

    const title = '差旅费用报销查看';
    const preparing = loading.effects[param.id ? `${DOMAIN}/query` : `${DOMAIN}/init`];
    const isView = getUrl().split('?')[0] === '/plat/expense/trip/view'; // 是查看页面

    const enableAdjustedAmt =
      // eslint-disable-next-line no-nested-ternary
      param.mode === 'view' || param.mode === undefined
        ? false
        : fieldsConfig &&
          fieldsConfig.panels &&
          fieldsConfig.panels.filter(f => f.id === 'details')[0]
          ? !fieldsConfig.panels.filter(f => f.id === 'details')[0].disabled
          : true;
    const problemTypeEditable =
      param.mode === 'view' || param.mode === undefined
        ? false
        : panels && panels[0] && panels[0].problemType;

    return (
      <PageHeaderWrapper title={title}>
        <BpmWrapper
          fields={formData}
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          scope={formData.bookTicketFlag === 1 ? 'ACC_A24' : 'ACC_A13'}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, formData: formD, bpmForm }) => {
            // const { taskKey } = fieldsConfig;
            const { key } = operation;
            const payload = {
              taskId: param.taskId,
              remark: bpmForm.remark,
            };
            if (key === 'EDIT') {
              closeThenGoto(
                `/plat/expense/trip/edit?id=${param.id}&apprId=${param.taskId}&remark=${
                  bpmForm.remark
                }`
              );
            }

            if (key === 'APPROVED') {
              if (
                [
                  'ACC_A13_03_FIN_AUDIT_CONFIRM_b', // 财务稽核专员 (因公/个人)审批
                  'ACC_A13_04_FIN_PIC_CONFIRM', // 财务负责人审批
                  'ACC_A13_05_FIN_ACCOUNT', // 财务出纳付款
                  'ACC_A13_05_FIN_CASHIER_CONFIRM', // 财务出纳付款
                ].includes(taskKey)
              ) {
                // if (taskKey === 'ACC_A13_03_FIN_AUDIT_CONFIRM_b') {
                dispatch({
                  type: `${DOMAIN}/updateAdjustedAmt`,
                  payload,
                });
                dispatch({
                  type: `${DOMAIN}/updateProblemType`,
                  payload: null,
                });
                return Promise.resolve(false);
              }
              if (taskKey === 'ACC_A24_02_FIN_AUDIT_CONFIRM') {
                dispatch({
                  type: `${DOMAIN}/approveWithNoBranch`,
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

              // 业务负责人审批节点
              if (taskKey.includes('SUPERIOR_CONFIRM')) {
                const { reasonType, reasonId } = formData;
                if (reasonType === '01') {
                  const payloads = detailList.map(({ accId, taxedReimAmt }) => ({
                    projId: reasonId,
                    accId,
                    taxedReimAmt,
                  }));
                  // 校验预算是否充足 ：projId 科目id 报销金额
                  checkProjectBudget(payloads).then(({ status, response }) => {
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
                        description: response.reason || '预算不足！',
                      });
                    }
                  });
                  return Promise.resolve(false);
                }
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
                closeThenGoto(`/plat/expense/trip/edit?id=${fromQs().id}`);
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
              href={`/print?scope=${formData.bookTicketFlag === 1 ? 'ACC_A24' : 'ACC_A13'}&id=${
                fromQs().id
              }`}
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
                    <ResSelect disabled />
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
                    name="busitripApplyName"
                    label="出差申请单"
                    decorator={{
                      initialValue: formData.busitripApplyName,
                    }}
                  >
                    {/* TripApplySelect为原来开发时专门定制的，编辑页面已经弃用，这里又只是展示，申请单又增加参数了，就这样解决了:) */}

                    {isView && formData.busitripApplyName ? (
                      <Link
                        className="tw-link"
                        to={`/user/center/travel/detail?id=${formData.busitripApplyId}`}
                      >
                        {formData.busitripApplyName}
                      </Link>
                    ) : (
                      <AsyncSelect source={[]} disabled />
                    )}
                  </Field>

                  <Field
                    name="expenseByTypeForTripName"
                    label="费用承担方"
                    decorator={{
                      initialValue: formData.expenseByTypeForTripName,
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
                    }}
                  >
                    <ReimTypeSelect isTrip disabled />
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
                  {/* <Field */}
                  {/* name="sumBuName" */}
                  {/* label={formatMessage({ */}
                  {/* id: `ui.menu.user.expense.form.sumBuName`, */}
                  {/* desc: '费用归属BU', */}
                  {/* })} */}
                  {/* decorator={{ */}
                  {/* initialValue: formData.sumBuName, */}
                  {/* }} */}
                  {/* > */}
                  {/* <Input disabled /> */}
                  {/* </Field> */}
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

                  {/* <Field
                    name="bookTicketFlag"
                    label="是否行政订票"
                    decorator={{
                      initialValue: formData.expenseByType,
                      rules: [
                        {
                          required: true,
                          message: '请输入是否行政订票',
                        },
                      ],
                    }}
                  >
                    <RadioGroup disabled>
                      <Radio value={1}>是</Radio>
                      <Radio value={0}>否</Radio>
                    </RadioGroup>
                  </Field> */}
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
                  {/* <Field presentational /> */}
                  <Field
                    name="problemType"
                    label="问题类型"
                    decorator={{
                      initialValue: formatDT(formData.problemType),
                    }}
                  >
                    <UdcSelect code="ACC:REIM_PROBLEM_TYPE" disabled={!problemTypeEditable} />
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
                    name="custpaytravelFlag"
                    label="客户承担差旅"
                    decorator={{
                      initialValue: formData.custpaytravelFlag || '',
                    }}
                  >
                    <UdcSelect
                      code="ACC:CONTRACT_CUSTPAY_TRAVEL"
                      placeholder="请选择..."
                      disabled
                    />
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
                      disabled={!enableAdjustedAmt}
                      autosize={{ minRows: 2, maxRows: 5 }}
                      className="x-fill-100"
                    />
                  </Field>
                </FieldList>

                <Divider dashed />

                <div className="tw-card-title">费用明细</div>

                <br />

                <TripExpenseDetailList
                  disabled
                  // disabled={
                  //   fieldsConfig &&
                  //   fieldsConfig.panels &&
                  //   fieldsConfig.panels.filter(f => f.id === 'details')[0]
                  //     ? !!fieldsConfig.panels.filter(f => f.id === 'details')[0].disabled
                  //     : true
                  // }
                  enableAdjustedAmt={enableAdjustedAmt}
                  reimTmpl={reimTmpl.detailList}
                  dispatch={dispatch}
                  dataSource={detailList}
                  formData={formData}
                  loading={false}
                  domain={DOMAIN}
                  cities={cities}
                  isPersonalAndTrip={
                    formData.reimType1 === 'PERSONAL' && formData.reimType2 === 'TRIP'
                  }
                  visible={visible}
                  modalParmas={modalParmas}
                  mealMoenyList={mealMoenyList}
                />

                <TripModalView
                  cities={cities}
                  dataSource={detailList}
                  disabled
                  enableAdjustedAmt={enableAdjustedAmt}
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
                    <AccSelect resId={formData.reimResId} disabled />
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
          {!taskId &&
            !isEmpty(formData) && (
              <BpmConnection
                source={[
                  { docId: id, procDefKey: formData.bookTicketFlag === 1 ? 'ACC_A24' : 'ACC_A13' },
                ]}
              />
            )}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default ExpenseEdit;
