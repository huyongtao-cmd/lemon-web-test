import React from 'react';
import { connect } from 'dva';
import { Button, Card, Divider, Form, Input, Radio, Tooltip } from 'antd';
import moment from 'moment';
import { formatMessage, FormattedMessage } from 'umi/locale';
import Link from 'umi/link';
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
import { isEmpty, isNil } from 'ramda';
import { fromQs, toUrl } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { formatDT } from '@/utils/tempUtils/DateTime';
import {
  ParticularExpenseDetailList,
  PreDocList,
  ReasonSelect,
  ReimTypeSelect,
} from '../components';

import {
  getReimTmpl,
  selectFeeCode,
  selectPayPlan,
  getApplysByResId,
  checkExpensePeriod,
  checkProjectBudget,
} from '@/services/user/expense/expense';
import createMessage from '@/components/core/AlertMessage';
import { request } from '@/utils/networkUtils';
import api from '@/api';

const { revoke } = api.bpm;
const { Field } = FieldList;

const RadioGroup = Radio.Group;

const DOMAIN = 'userExpenseParticularView'; //

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 特殊费用报销
 * * TAG :: 历史原因，spec 变成了专项报销，特殊费用报销就变成了 particular 了 ==
 */
@connect(({ loading, dispatch, user, userExpenseParticularView }) => ({
  loading,
  dispatch,
  user,
  userExpenseParticularView,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.userExpenseParticularView;
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
          },
        });
        break;
      }
      case 'reimType': {
        // 报销类型联动
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { reimType1: value[0], reimType2: value[1], reimType3: value[2] },
        });
        props.dispatch({ type: `${DOMAIN}/updateState`, payload: { detailList: [] } });
        break;
      }
      case 'reason': {
        // 事由类型 / 事由号 联动
        let realReimType3;
        if (!isEmpty(value)) {
          // 原来取值逻辑， reasonType 不是 01 的时候，就是 NONPROJ
          realReimType3 = value.reasonType === '01' ? 'PROJ' : 'NONPROJ';
          // // 新逻辑 reasonType 为 04 的时候， 如果选的不是 无合同(reasonId !== 0), 就是 PROJ
          // 采购合同的时候，不按照 reasonId, 按照 subContractId 来判定
          // subContractId 为空， 或者 小于等于0 的时候， 是非项目
          if (value.reasonType === '04') {
            realReimType3 =
              isNil(value.subContractId) || value.subContractId <= 0 ? 'NONPROJ' : 'PROJ';
          }
        }
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            ...value,
            feeCode: undefined,
            // reimType3: value.reasonType === '01' ? 'PROJ' : 'NONPROJ',
            reimType3: realReimType3,
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
          const {
            reasonType,
            reasonId,
            reimType1,
            reimType2,
            reimType3,
            feeCode,
            expenseBuId,
            reimResId,
            feeApplyId,
          } = result;
          this.fetchTmpl(reimType1, reimType2, reimType3, feeCode);
          if (!isNil(reimResId)) this.fetchFeeApply(reimResId); // reimResId 肯定存在的，不过还是做一下判断稳妥点
        }
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      userExpenseParticularView: { formData },
    } = this.props;
    if (
      formData.reimType2 === 'PURCHASE' &&
      formData.reasonType === '04' &&
      formData.reasonId !== void 0 // 此处判断的是undefined，不用多租户改造
    ) {
      const { reimType2, reasonType, reasonId } = formData;
      const {
        reimType2: or2,
        reasonType: ort,
        reasonId: orId,
      } = prevProps.userExpenseParticularView.formData;

      if (reasonId !== orId) {
        this.fetchPhase(formData.reasonId);
      }
    }
    // console.log(formData, prevProps.userExpenseParticularView.formData);
    const { reimType1, reimType2, reimType3, feeCode } = formData;
    const {
      reimType1: or1,
      reimType2: or2,
      reimType3: or3,
      feeCode: oe,
    } = prevProps.userExpenseParticularView.formData;
    if (reimType1 && reimType2 && reimType3 && feeCode) {
      if (reimType1 !== or1 || reimType2 !== or2 || reimType3 !== or3 || feeCode !== oe) {
        this.fetchTmpl(reimType1, reimType2, reimType3, feeCode);
      }
    }

    const { reasonType, reasonId } = formData;
    const { reasonType: prt, reasonId: ori } = prevProps.userExpenseParticularView.formData;

    if (reasonType && reasonId) {
      if (reasonType !== prt || reasonId !== ori) {
        this.fetchFeeCode(reasonType, reasonId);
      }
    }
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  fetchPhase = contractId => {
    selectPayPlan(contractId).then(resp => {
      // console.log(resp.response);
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          phaseList: Array.isArray(resp.response) ? resp.response : [],
        },
      });
    });
  };

  fetchTmpl = (reimType1, reimType2, reimType3, feeCode) => {
    getReimTmpl({
      reimType1,
      reimType2,
      reimType3,
      feeCode,
    }).then(res => {
      const data = res.response.datum;
      // console.log(res);
      const {
        dispatch,
        userExpenseParticularView: { formData },
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
          feeCodeList: Array.isArray(res.response)
            ? res.response.map(f => ({ id: f.feeCode, code: f.feeCode, name: f.feeCodeDesc }))
            : [],
        },
      });
    });
  };

  fetchFeeApply = resId => {
    getApplysByResId(resId).then(res => {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          feeApplyList: Array.isArray(res.response) ? res.response : [],
        },
      });
    });
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    const {
      dispatch,
      loading,
      userExpenseParticularView: {
        formData,
        detailList,
        flowForm,
        fieldsConfig,
        phaseList,
        reimTmpl,
        feeCodeList,
        feeApplyList,
      },
      form: { getFieldDecorator },
    } = this.props;

    const param = fromQs();
    const { taskId, id } = param;

    const title = '特殊费用报销详情';
    const preparing = loading.effects[param.id ? `${DOMAIN}/query` : `${DOMAIN}/init`];
    const isView = getUrl().split('?')[0] === '/plat/expense/particular/view'; // 是查看页面
    // console.log('fieldsConfig', fieldsConfig);

    const enableAdjustedAmt =
      // eslint-disable-next-line no-nested-ternary
      param.mode === 'view' || param.mode === undefined
        ? false
        : fieldsConfig &&
          fieldsConfig.panels &&
          fieldsConfig.panels.filter(f => f.id === 'details')[0]
          ? !fieldsConfig.panels.filter(f => f.id === 'details')[0].disabled
          : true;

    return (
      <PageHeaderWrapper title={title}>
        <BpmWrapper
          // fields={formData}
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          scope="ACC_A27"
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
              closeThenGoto(
                `/plat/expense/particular/edit?id=${param.id}&apprId=${param.taskId}&remark=${
                  bpmForm.remark
                }`
              );
            }

            if (key === 'APPROVED') {
              if (
                [
                  'ACC_A27_03_FIN_AUDIT_CONFIRM_b', // 财务稽核专员 (因公/个人)审批
                  'ACC_A27_04_FIN_PIC_CONFIRM', // 财务负责人审批
                  'ACC_A27_05_FIN_ACCOUNT', // 财务记账
                  'ACC_A27_06_FIN_CASHIER_CONFIRM', // 财务出纳付款
                ].includes(taskKey)
              ) {
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
                closeThenGoto(`/plat/expense/particular/edit?id=${fromQs().id}`);
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
              href={`/print?scope=ACC_A27&id=${fromQs().id}`}
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
                    name="feeApplyId"
                    label="特殊费用申请单"
                    decorator={{
                      initialValue: formData.feeApplyId,
                      rules: [
                        {
                          required: true,
                          message: '请选择报销申请单',
                        },
                      ],
                    }}
                  >
                    {isView && formData.feeApplyId ? (
                      <Link
                        className="tw-link"
                        to={`/plat/expense/spec/detail?id=${formData.feeApplyId}`}
                      >
                        {formData.feeApplyNo}-{formData.feeApplyName}
                      </Link>
                    ) : (
                      <AsyncSelect allowClear={false} source={feeApplyList} disabled />
                    )}
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
                  <Field
                    name="projCompany"
                    label="项目签约公司"
                    decorator={{
                      initialValue: formData.projCompany,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="resCompany"
                    label="报销人所属公司"
                    decorator={{
                      initialValue: formData.resCompany,
                    }}
                  >
                    <Input disabled />
                  </Field>
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
                  <Field presentational />
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
                      disabled={!enableAdjustedAmt}
                      autosize={{ minRows: 2, maxRows: 5 }}
                      className="x-fill-100"
                    />
                  </Field>
                </FieldList>

                <Divider dashed />

                {formData.reimType2 === 'PURCHASE' &&
                  formData.reasonType === '04' &&
                  !isNil(formData.reasonId) && (
                    <>
                      <div className="tw-card-title">采购付款附加信息</div>
                      <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                        <Field
                          style={{ display: 'none' }}
                          name="contract"
                          label={formatMessage({
                            id: `ui.menu.user.expense.form.contract`,
                            desc: '采购合同',
                          })}
                          decorator={{
                            initialValue: formData.reasonName,
                          }}
                        >
                          <Input disabled />
                        </Field>

                        <Field
                          name="supplierName"
                          label={formatMessage({
                            id: `ui.menu.user.expense.form.supplierName`,
                            desc: '供应商',
                          })}
                          decorator={{
                            initialValue: formData.supplierName,
                          }}
                        >
                          <Input disabled />
                        </Field>
                        <Field
                          name="phaseDesc"
                          label={formatMessage({
                            id: `ui.menu.user.expense.form.phaseDesc`,
                            desc: '采购付款阶段',
                          })}
                          decorator={{
                            initialValue: formData.phaseDesc,
                            // rules: [
                            //   {
                            //     required: true,
                            //     message:
                            //       '请输入' +
                            //       formatMessage({
                            //         id: `ui.menu.user.expense.form.phaseDesc`,
                            //         desc: '采购付款阶段',
                            //       }),
                            //   },
                            // ],
                          }}
                        >
                          <AsyncSelect source={phaseList} />
                        </Field>
                      </FieldList>

                      <Divider dashed />
                    </>
                  )}

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

                <ParticularExpenseDetailList
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
                  loading={false}
                  domain={DOMAIN}
                  reimResId={formData.reimResId}
                  expenseType="particular"
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
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'ACC_A27' }]} />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default ExpenseEdit;
