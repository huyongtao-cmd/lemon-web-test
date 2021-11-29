/* eslint-disable */
import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { cloneDeep } from 'lodash';
import { Button, Card, Divider, Form, Input, Radio, Modal } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import { FileManagerEnhance, UdcSelect, DatePicker } from '@/pages/gen/field';
import { closeThenGoto, markAsTab, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import createMessage from '@/components/core/AlertMessage';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import { fromQs } from '@/utils/stringUtils';
import { selectOus } from '@/services/gen/list';
import { getReimTmpl, selectFeeCode, selectPayPlan } from '@/services/user/expense/expense';
import { selectSupplier, selectFinperiod } from '@/services/user/Contract/sales';
import { handleInvoiceVerify } from '@/services/user/expense/expense';

import {
  AccSelect,
  BuSelect,
  ExpenseDetailList,
  PreDocList,
  ReasonSelect,
  ReimTypeSelect,
  ResSelect,
} from '../components';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'userExpenseSpecEdit'; //

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 专项费用报销
 */
@connect(({ loading, dispatch, user, userExpenseSpecEdit }) => ({
  loading,
  dispatch,
  user,
  userExpenseSpecEdit,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.userExpenseSpecEdit;
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
  state = {
    tipModalVisible: false,
    isSubmit: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
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
    } else {
      dispatch({
        type: `${DOMAIN}/init`,
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      userExpenseSpecEdit: { formData },
    } = this.props;
    const { reimType1, reimType2, reimType3, feeCode, expenseBuId } = formData;
    const {
      reimType1: or1,
      reimType2: or2,
      reimType3: or3,
      feeCode: oe,
    } = prevProps.userExpenseSpecEdit.formData;
    if (reimType1 && reimType2 && reimType3 && feeCode) {
      if (reimType1 !== or1 || reimType2 !== or2 || reimType3 !== or3 || feeCode !== oe) {
        this.fetchTmpl(reimType1, reimType2, reimType3, feeCode);
      }
    }
  }

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
        userExpenseSpecEdit: { formData },
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

  handleTipModalClose = () => {
    this.setState({
      tipModalVisible: false,
    });
  };

  handleTipModalOk = () => {
    this.setState({
      tipModalVisible: false,
    });
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      userExpenseSpecEdit: { formData, detailList },
    } = this.props;
    // 获取url上的参数
    const param = fromQs();
    const { isSubmit } = this.state;

    if (param.id && !param.isCopy) {
      const { id = undefined, apprId = undefined, remark = undefined } = param;
      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          id,
          isSubmit,
          taskId: formData.bpmTaskId,
          params: { result: 'APPROVED', remark },
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/create`,
        payload: {
          isSubmit,
        },
      });
    }
  };

  // 保存按钮事件
  handleSave = isSubmit => () => {
    this.setState({
      isSubmit,
    });
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      userExpenseSpecEdit: { detailList = [], formData },
    } = this.props;
    // 获取url上的参数
    const param = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // 必须关联发票或者填写无发票原因
        const tt = detailList.filter(
          v =>
            !(v.invoiceentity && Array.isArray(v.invoiceentity) && !isEmpty(v.invoiceentity)) &&
            !v.noinvReason
        );
        if (tt.length) {
          const erroIndex = detailList.findIndex(v => v.id === tt[0].id);
          createMessage({
            type: 'warn',
            description: `报销明细第${erroIndex + 1}条未关联发票，若无发票请填写无发票原因`,
          });
          return;
        }

        // // 发票金额不能小于报销金额
        // const tt1 = detailList.filter(v => Number(v.invTotalAmount) - Number(v.taxedReimAmt) < 0);
        // if (tt1.length) {
        //   const erroIndex = detailList.findIndex(v => v.id === tt1[0].id);
        //   createMessage({
        //     type: 'warn',
        //     description: `报销明细第${erroIndex + 1}条发票金额小于报销金额`,
        //   });
        //   return;
        // }

        if (values.remark && values.remark.includes('补贴')) {
          createMessage({ type: 'warn', description: '报销说明中不能出现“补贴”字样' });
          return;
        }
        if (detailList.map(({ reimDesc }) => (reimDesc || '').includes('补贴')).includes(true)) {
          createMessage({ type: 'warn', description: '报销说明中不能出现“补贴”字样' });
          return;
        }
        if (detailList.length > 0) {
          /**
           * 检查发票的开票日期：发票的开票日期不能早于业务发生日期（开票日期为空的，不做此限制）
           * 以下情况不做此项检查：①差旅费用报销：类型为“餐费”或“业务招待费”；②非差旅费用报销：科目为“误餐费”。
           */
          // const invoiceDateBeforeFlag = detailList.some(item => {
          //   if (item.invoiceentity && item.invoiceentity.length > 0) {
          //     const filterInvoiceentity = item.invoiceentity.filter(ele => ele.invoiceDate);
          //     if (
          //       filterInvoiceentity.some(ele =>
          //         moment(ele.invoiceDate).isBefore(moment(item.feeDate))
          //       )
          //     ) {
          //       return true;
          //     }
          //   }
          // });
          // if (invoiceDateBeforeFlag) {
          //   return createMessage({
          //     type: 'warn',
          //     description: '发票的开票日期不能早于业务发生日期',
          //   });
          // }

          // ---------弱提示--------
          /**
           *
           * 连号发票检查：从当前报销单提交日期往前推算60天的所有报销中，是否存在同号发票
           */
          // const hotelDetailList = detailList.filter(item => item.feeType === 'HOTEL');

          if (detailList.length > 0) {
            const newDetailList = cloneDeep(detailList);
            const res = handleInvoiceVerify({
              reimResId: formData.reimResId,
              detailList: newDetailList.map(item => {
                item.id = null;
                return item;
              }),
            }).then(res => {
              if (res.response.ok) {
                const invoiceConsecutiveNumArr = res.response.datum.filter(
                  item => item.invoiceConsecutiveNum === true
                );
                if (invoiceConsecutiveNumArr.length > 0) {
                  createMessage({
                    type: 'warn',
                    description: `报销单中存在连号发票`,
                  });
                  this.setState({
                    tipModalVisible: true,
                  });
                  invoiceConsecutiveNumArr.map(item => {
                    dispatch({
                      type: `${DOMAIN}/updateTableCell`,
                      payload: {
                        type: 'invoiceConsecutiveNum',
                        item,
                        ruleExplain: '发票连号',
                      },
                    });
                  });
                  return;
                }
              }
            });
          }

          /**
           * 单张出租车票金额不超过200
           * 定额发票金额不超过500
           */
          detailList.map(item => {
            if (item.invoiceentity && item.invoiceentity.length > 0) {
              item.invoiceentity.map(ele => {
                if (ele.invType === '1004') {
                  // 出租车票
                  if (+ele.amountTax > 200) {
                    this.setState({
                      tipModalVisible: true,
                    });
                    dispatch({
                      type: `${DOMAIN}/updateTableCell`,
                      payload: { item, ruleExplain: '发票超过限定金额' },
                    });
                    return;
                  } else {
                    dispatch({
                      type: `${DOMAIN}/updateTableCell`,
                      payload: { item, ruleExplain: '' },
                    });
                  }
                } else if (ele.invType === '1005') {
                  // 定额发票
                  if (+ele.amountTax > 500) {
                    this.setState({
                      tipModalVisible: true,
                    });
                    dispatch({
                      type: `${DOMAIN}/updateTableCell`,
                      payload: { item, ruleExplain: '发票超过限定金额' },
                    });
                    return;
                  } else {
                    dispatch({
                      type: `${DOMAIN}/updateTableCell`,
                      payload: { item, ruleExplain: '' },
                    });
                  }
                }
              });
            }
          });

          /**
           * 判断业务发生日期是否早于上个月的1号
           */
          // 获取当前月份上一个月的1号
          const lastMonthFirstDay =
            formData.applyDate &&
            moment(formData.applyDate)
              .subtract(1, 'months')
              .startOf('month')
              .format('YYYY-MM-DD');
          const delayList = detailList.filter(item =>
            moment(item.feeDate).isBefore(moment(lastMonthFirstDay))
          );
          if (delayList.length > 0) {
            // createMessage({ type: 'warn', description: '报销日期延误' });
            this.setState({
              tipModalVisible: true,
            });
            // eslint-disable-next-line array-callback-return
            delayList.map(item => {
              dispatch({
                type: `${DOMAIN}/updateTableCell`,
                payload: { item, ruleExplain: '报销日期延误' },
              });
            });
            return;
          }
        }

        if (param.id && !param.isCopy) {
          const { id = undefined, apprId = undefined, remark = undefined } = param;
          dispatch({
            type: `${DOMAIN}/save`,
            payload: {
              id,
              isSubmit,
              taskId: formData.bpmTaskId,
              params: { result: 'APPROVED', remark },
            },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/create`,
            payload: {
              isSubmit,
            },
          });
        }
      } else {
        createMessage({ type: 'warn', description: Object.values(error)[0].errors[0].message });
      }
    });
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    const {
      dispatch,
      loading,
      userExpenseSpecEdit: { formData, detailList, feeCodeList, reimTmpl },
      form: { getFieldDecorator },
    } = this.props;
    const { tipModalVisible } = this.state;

    const param = fromQs();

    const title = '专项费用报销' + formData.id ? '编辑' : '新增';
    const preparing = loading.effects[param.id ? `${DOMAIN}/query` : `${DOMAIN}/init`];
    const submitting =
      loading.effects[param.id && !param.isCopy ? `${DOMAIN}/save` : `${DOMAIN}/create`];
    const noSubmitStatus = ['APPROVING', 'APPROVED', 'CLOSED'];
    const apprStatusBtn = noSubmitStatus.includes(formData.apprStatus);
    const { type } = param; // 0普通修改 1 高级修改

    return (
      <PageHeaderWrapper title={title}>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={preparing || submitting}
            onClick={this.handleSave(false)}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={preparing || submitting || apprStatusBtn}
            onClick={this.handleSave(true)}
          >
            提交
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() =>
              param.sourceUrl ? closeThenGoto(param.sourceUrl) : closeThenGoto('/plat/expense/list')
            }
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
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
                  <Input disabled placeholder="系统生成" />
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
                  <Input disabled placeholder="系统生成" />
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
                    onChange={value => {
                      dispatch({
                        type: `${DOMAIN}/reInit`,
                        payload: {
                          reimResId: value.id,
                          reimResName: value.name,
                          resBuName: value.receiverBuName,
                          jobGrade: value.jobGrade,
                          remark: formData.remark,
                        },
                      });
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
                  }}
                >
                  <ReasonSelect
                    resId={formData.reimResId}
                    onChange={value => {
                      !isEmpty(value) &&
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            feeCodeList: [],
                          },
                        });
                    }}
                    disabled
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
                      if (
                        (formData || {}).reasonType === '03' &&
                        (formData || {}).reasonCode === 'TK000'
                      ) {
                        !isEmpty(value) && this.fetchFeeCode(formData.reasonType, value.id);
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
                  }}
                >
                  <AsyncSelect
                    disabled
                    allowClear={false}
                    source={() => selectOus().then(resp => resp.response)}
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
                  }}
                >
                  <UdcSelect allowClear={false} code="ACC:PAY_METHOD" disabled />
                </Field>
                <Field
                  name="reimDate"
                  label={formatMessage({
                    id: 'ui.menu.user.expense.form.reimDate',
                    desc: '记账日期',
                  })}
                  decorator={{
                    initialValue: formData.reimDate,
                  }}
                >
                  <DatePicker
                    placeholder="请输入记账日期"
                    format="YYYY-MM-DD"
                    className="x-fill-100"
                    disabled={!type || type !== '1'}
                  />
                </Field>
                <Field
                  name="finPeriodId"
                  label={formatMessage({
                    id: 'ui.menu.user.expense.form.finPeriod',
                    desc: '财务期间',
                  })}
                  decorator={{
                    initialValue: formData.finPeriodId,
                  }}
                >
                  <AsyncSelect
                    source={() => selectFinperiod().then(resp => resp.response)}
                    placeholder="请选择财务期间"
                    showSearch
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase.indexOf(input.toLowerCase()) >= 0
                    }
                    disabled={!type || type !== '1'}
                  />
                </Field>
                <Field
                  name="allocationFlag"
                  label={formatMessage({
                    id: `ui.menu.user.expense.form.allocationFlag`,
                    desc: '是否进行分摊',
                  })}
                  decorator={{
                    initialValue: formData.allocationFlag,
                  }}
                >
                  <RadioGroup disabled>
                    <Radio value={1}>是</Radio>
                    <Radio value={0}>否</Radio>
                  </RadioGroup>
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
                    dataKey={param.isCopy ? undefined : formData.id}
                    listType="text"
                    disabled={false}
                  />
                </Field>
                {/* <Field presentational /> */}
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
                    autosize={{ minRows: 2, maxRows: 5 }}
                    className="x-fill-100"
                    disabled
                  />
                </Field>
              </FieldList>

              <Divider dashed />

              {/* <div className="tw-card-title m-b-2">相关前置流程</div>

              <PreDocList
                reimTmpl={reimTmpl.detailList}
                dispatch={dispatch}
                dataSource={detailList}
                loading={false}
                domain={DOMAIN}
              />

              <br />

              <Divider dashed /> */}

              <div className="tw-card-title">
                费用明细（请先选择报销类型和事由号）
                <span style={{ color: 'red' }}>
                  报销月份以费用发生日期为准，每月仅允许发生一笔报销，请注意不要重复
                </span>
              </div>

              <br />

              <ExpenseDetailList
                reimTmpl={reimTmpl.detailList}
                dispatch={dispatch}
                dataSource={detailList}
                reimResId={formData.reimResId}
                formData={formData}
                loading={false}
                domain={DOMAIN}
                isSpec
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
                  <AccSelect resId={formData.reimResId} />
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
              {tipModalVisible && (
                <Modal
                  title="提示"
                  // width='80%'
                  visible={tipModalVisible}
                  onCancel={this.handleTipModalClose}
                  onOk={this.handleTipModalOk}
                >
                  存在不符合业务检查规则的数据，是否继续？
                </Modal>
              )}
            </>
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ExpenseEdit;
