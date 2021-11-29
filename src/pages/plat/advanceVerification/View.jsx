import React from 'react';
import { connect } from 'dva';
import { Button, Card, Divider, Form, Input, Radio, Tooltip } from 'antd';
import moment from 'moment';
import { formatMessage, FormattedMessage } from 'umi/locale';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import { FileManagerEnhance, UdcSelect, Selection } from '@/pages/gen/field';
import { closeThenGoto, markAsTab, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import Loading from '@/components/core/DataLoading';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import { fromQs, toUrl } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import DescriptionList from '@/components/layout/DescriptionList';
import { selectInternalOus, selectUsersWithBu } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import Link from 'umi/link';
import {
  NormalAccSelect,
  ExpenseDetailList,
  PreDocList,
  ReasonSelect,
  ReimTypeSelect,
  TripExpenseDetailList,
} from './components';
import createMessage from '@/components/core/AlertMessage';
import { request } from '@/utils/networkUtils';
import api from '@/api';

import {
  getReimTmpl,
  selectFeeCode,
  selectPayPlan,
  checkExpensePeriod,
  checkProjectBudget,
} from '@/services/user/expense/expense';

const { revoke } = api.bpm;
const { Field } = FieldList;

const RadioGroup = Radio.Group;
const { Description } = DescriptionList;

const DOMAIN = 'advanceVerificationView'; //

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 费用报销
 */
@connect(({ loading, dispatch, user, advanceVerificationView }) => ({
  loading,
  dispatch,
  user,
  advanceVerificationView,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.advanceVerificationView;
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
class advanceVerificationView extends React.PureComponent {
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
            reasonCode,
            reimType1,
            reimType2,
            reimType3,
            feeCode,
            expenseBuId,
          } = result;
          // 事由类型是采购合同'04'的时候，才请求付款阶段
          reasonType === '04' && !isNil(reasonId) && this.fetchPhase(reasonId);
          this.fetchTmpl(reimType1, reimType2, reimType3, feeCode);
          if (reasonType && !isNil(reasonId)) {
            if (reasonType === '03') {
              // 这里不需要判断 reasonId 为 0 了，reasonType 为 03 或者 04 的时候，就根据有的 expenseBuId 来拉数据做匹配即可
              !isNil(expenseBuId) && this.fetchFeeCode(reasonType, expenseBuId);
            } else if (reasonType === '04') {
              reasonCode === 'PU0000000000' // 多租户改造 采购合同0 根据费用承担bu获取费用码
                ? this.fetchFeeCode(reasonType, expenseBuId)
                : this.fetchFeeCode(reasonType, reasonId);
            } else this.fetchFeeCode(reasonType, reasonId);
          }
        }
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      advanceVerificationView: { formData },
    } = this.props;
    if (
      formData.reimType2 === 'PURCHASE' &&
      formData.reasonType === '04' &&
      formData.reasonId !== void 0 // 此处是判断undefined不用多租户改造
    ) {
      const { reimType2, reasonType, reasonId } = formData;
      const {
        reimType2: or2,
        reasonType: ort,
        reasonId: orId,
      } = prevProps.advanceVerificationView.formData;

      if (reasonId !== orId) {
        this.fetchPhase(formData.reasonId);
      }
    }
    // console.log(formData, prevProps.advanceVerificationView.formData);
    const { reimType1, reimType2, reimType3, feeCode } = formData;
    const {
      reimType1: or1,
      reimType2: or2,
      reimType3: or3,
      feeCode: oe,
    } = prevProps.advanceVerificationView.formData;
    if (reimType1 && reimType2 && reimType3 && feeCode) {
      if (reimType1 !== or1 || reimType2 !== or2 || reimType3 !== or3 || feeCode !== oe) {
        this.fetchTmpl(reimType1, reimType2, reimType3, feeCode);
      }
    }

    const { reasonType, reasonId } = formData;
    const { reasonType: prt, reasonId: ori } = prevProps.advanceVerificationView.formData;

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
        advanceVerificationView: { formData },
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

  // 保存按钮事件
  handleSave = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
    } = this.props;
    // 获取url上的参数
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
        });
      } else {
        createMessage({ type: 'warn', description: Object.values(error)[0].errors[0].message });
      }
    });
  };

  amtChange = amt => {
    const {
      dispatch,
      form: { setFieldsValue },
    } = this.props;
    let reimAmt = 0;
    const amtData = amt.map(item => parseFloat(item.taxedReimAmt));
    amtData.forEach(item => {
      reimAmt += item;
    });
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        reimAmt,
      },
    });
    setFieldsValue({
      reimAmt,
    });
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    const {
      dispatch,
      loading,
      advanceVerificationView: {
        formData,
        detailList,
        flowForm,
        fieldsConfig,
        phaseList,
        reimTmpl,
        feeCodeList,
      },
      form: { getFieldDecorator, setFieldsValue, validateFieldsAndScroll },
    } = this.props;
    const param = fromQs();
    const { taskId, id } = param;
    let pageOnlyView =
      fieldsConfig.buttons && fieldsConfig.buttons[0]
        ? fieldsConfig.buttons[0].key !== 'FLOW_COMMIT'
        : true;
    pageOnlyView = param.mode === 'view' ? true : pageOnlyView;
    const preparing = loading.effects[param.id ? `${DOMAIN}/query` : `${DOMAIN}/init`];

    const enableAdjustedAmt = false;

    // console.log('fieldsConfig', fieldsConfig);
    return (
      <PageHeaderWrapper title="预付款核销申请详情">
        <BpmWrapper
          // fields={formData}
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          scope="ACC_A60"
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { taskKey } = fieldsConfig;
            const { key } = operation;
            const { remark, branch } = bpmForm;
            if (key === 'FLOW_COMMIT') {
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  dispatch({
                    type: `${DOMAIN}/save`,
                    payload: {
                      branch,
                      remark,
                      result: 'APPLIED',
                      taskId,
                    },
                  });
                } else {
                  createMessage({
                    type: 'warn',
                    description: Object.values(error)[0].errors[0].message,
                  });
                }
              });

              return Promise.resolve(false);
            }

            return Promise.resolve(true);
          }}
        >
          <Card className="tw-card-rightLine">
            <a
              href={`/print?scope=ACC_A60&id=${fromQs().id}`}
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
                    : closeThenGoto('/user/flow/process');
              }}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
          <Card
            className="tw-card-adjust deepColorDecorator"
            bordered={false}
            title={<Title icon="profile" text="预付款核销申请详情" />}
          >
            {preparing || preparing === undefined ? (
              <Loading />
            ) : (
              <>
                <div className="tw-card-title">基本信息</div>
                <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                  <Field
                    name="prepayApplyNo"
                    label="预付款核销单号"
                    decorator={{
                      initialValue: formData.prepayApplyNo,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="applyResId"
                    label="申请人"
                    decorator={{
                      initialValue: formData.applyResId,
                      rules: [
                        {
                          required: true,
                          message: '请输入申请人',
                        },
                      ],
                    }}
                  >
                    <Selection.Columns
                      source={selectUsersWithBu}
                      columns={[
                        { dataIndex: 'code', title: '编号', span: 10 },
                        { dataIndex: 'name', title: '名称', span: 14 },
                      ]}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      placeholder="请选择申请人"
                      showSearch
                      disabled={pageOnlyView}
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
                              applyResId: value,
                            },
                          });
                          setFieldsValue({
                            // 清空供应商
                            supplierId: undefined,
                            phaseDesc: undefined,
                            // 清空账户字段
                            abAccId: undefined,
                            accountNo: undefined,
                            bankName: undefined,
                            bankBranch: undefined,
                            holderName: undefined,
                            applyResId: value,
                          });
                        }
                      }}
                    />
                  </Field>

                  <Field
                    name="applyNo"
                    label="关联预付款"
                    decorator={{
                      initialValue: formData.applyNo,
                    }}
                  >
                    <Link
                      className="tw-link"
                      to={`/plat/purchPay/prePayMgmt/detail?id=${formData.adpayId}`}
                    >
                      {formData.applyNo}
                    </Link>
                  </Field>

                  <Field
                    name="prepayType"
                    label="业务类型"
                    decorator={{
                      initialValue: formData.prepayType,
                    }}
                  >
                    <Selection.UDC code="ACC:PREPAY_TYPE" placeholder="请选择业务类型" disabled />
                  </Field>

                  <Field
                    name="adpayAmt"
                    label="预付款总额"
                    decorator={{
                      initialValue: formData.adpayAmt,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="adpayHxDate"
                    label="预计核销日期"
                    decorator={{
                      initialValue: formData.adpayHxDate,
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
                    {pageOnlyView ? (
                      <ReimTypeSelect isTrip={false} disabled />
                    ) : (
                      <ReimTypeSelect
                        detailList={detailList}
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
                    )}
                  </Field>
                  {!pageOnlyView && (
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
                        resId={formData.applyResId}
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
                  )}
                  {pageOnlyView &&
                    formData.reasonType === '04' && (
                      <Field
                        name="reason"
                        label={formatMessage({
                          id: `ui.menu.user.expense.form.reasonType`,
                          desc: '事由类型 / 事由号',
                        })}
                        decorator={{
                          initialValue: [
                            formData.reasonType,
                            formData.reasonId,
                            formData.reasonName,
                          ],
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
                        <Link
                          className="tw-link"
                          to={`/sale/contract/purchasesDetail?pid=${formData.reasonId}`}
                        >
                          {formData.reasonTypeName}-{formData.reasonName}
                        </Link>
                      </Field>
                    )}
                  {pageOnlyView &&
                    formData.reasonType !== '04' && (
                      <Field
                        name="reason"
                        label={formatMessage({
                          id: `ui.menu.user.expense.form.reasonType`,
                          desc: '事由类型 / 事由号',
                        })}
                        decorator={{
                          initialValue: [
                            formData.reasonType,
                            formData.reasonId,
                            formData.reasonName,
                          ],
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
                        <ReasonSelect disabled resId={formData.applyResId} />
                      </Field>
                    )}

                  <Field
                    name="expenseBuId"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.expenseBuName`,
                      desc: '费用承担BU',
                    })}
                    decorator={{
                      initialValue: Number(formData.expenseBuId) || undefined,
                      // initialValue: formData.expenseBuId
                      //   ? { buName: formData.expenseBuName, id: formData.expenseBuId + '' }
                      //   : undefined,
                      rules: [
                        {
                          required: true,
                          message: '请选择费用承担BU',
                        },
                      ],
                    }}
                  >
                    <Selection.ColumnsForBu
                      disabled={pageOnlyView}
                      onChange={e => {
                        // bu任务 '03'
                        if (
                          formData.reasonType === '03' &&
                          (formData || {}).reasonCode === 'TK000'
                        ) {
                          !isNil(e) && this.fetchFeeCode(formData.reasonType, e);
                        }
                        // 采购合同 '04'
                        if (
                          formData.reasonType === '04' &&
                          (formData || {}).reasonCode === 'PU0000000000'
                        ) {
                          // 这个时候的 reasonType 应传 '03' 很神奇
                          !isNil(e) && this.fetchFeeCode('03', e);
                        }
                        dispatch({
                          type: `${DOMAIN}/updateForm`,
                          payload: { expenseBu: e },
                        });
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
                      disabled={pageOnlyView}
                      allowClear={false}
                      source={() => selectInternalOus().then(resp => resp.response)}
                    />
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
                    <AsyncSelect allowClear={false} source={feeCodeList} disabled={pageOnlyView} />
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
                    <UdcSelect allowClear={false} code="ACC:REIM_EXP_BY" disabled={pageOnlyView} />
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
                    <UdcSelect allowClear={false} code="ACC:PAY_METHOD" disabled={pageOnlyView} />
                  </Field>

                  <Field
                    name="hxType"
                    label="核销方式"
                    decorator={{
                      initialValue: formData.hxType,
                      rules: [
                        {
                          required: true,
                          message: '请选择核销方式',
                        },
                      ],
                    }}
                  >
                    <Selection.UDC
                      code="ACC:HX_TYPE"
                      placeholder="请选择核销方式"
                      disabled={pageOnlyView}
                    />
                  </Field>

                  <Field
                    name="alreadyAmt"
                    label="已核销金额"
                    decorator={{
                      initialValue: formData.alreadyAmt,
                    }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="reimAmt"
                    label="核销金额"
                    decorator={{
                      initialValue: formData.reimAmt,
                    }}
                  >
                    <Input disabled />
                  </Field>

                  <Field
                    name="processState"
                    label="核销状态"
                    decorator={{
                      initialValue: formData.processState,
                    }}
                  >
                    <Selection.UDC
                      code="ACC:ADPAY_HX_STATE"
                      placeholder="请选择核销状态"
                      disabled
                    />
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
                      api="/api/worth/v1/adpay/sfs/token"
                      dataKey={undefined}
                      listType="text"
                      disabled={pageOnlyView}
                    />
                  </Field>
                  <Field presentational />
                  <Field
                    fieldCol={1}
                    labelCol={{ span: 4, xxl: 3 }}
                    wrapperCol={{ span: 19, xxl: 20 }}
                    name="remark"
                    label="备注说明"
                    decorator={{
                      initialValue: formData.remark,
                    }}
                  >
                    <Input.TextArea
                      autosize={{ minRows: 2, maxRows: 5 }}
                      className="x-fill-100"
                      disabled={pageOnlyView}
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
                          <Input disabled={pageOnlyView} />
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
                          <Selection.Columns
                            source={phaseList}
                            transfer={{ key: 'id', code: 'id', name: 'name' }}
                            placeholder="请选择采购付款阶段"
                            showSearch
                            disabled={pageOnlyView}
                          />
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

                <ExpenseDetailList
                  disabled={pageOnlyView}
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
                  amtChange={this.amtChange}
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
                    <NormalAccSelect
                      resId={formData.applyResId}
                      suppId={formData.supplierId}
                      disabled={pageOnlyView}
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
                    name="accName"
                    label={formatMessage({
                      id: `ui.menu.user.expense.form.holderName`,
                      desc: '户名',
                    })}
                    decorator={{
                      initialValue: formData.accName,
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
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'ACC_A60' }]} />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default advanceVerificationView;
