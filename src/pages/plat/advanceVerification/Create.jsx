import React from 'react';
import { connect } from 'dva';
import { Button, Card, Divider, Form, Input, Radio } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import { FileManagerEnhance, UdcSelect, Selection } from '@/pages/gen/field';
import { closeThenGoto, markAsTab, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import createMessage from '@/components/core/AlertMessage';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import { fromQs } from '@/utils/stringUtils';
import { getReimTmpl, selectFeeCode, selectPayPlan } from '@/services/user/expense/expense';
import { selectSupplier } from '@/services/user/Contract/sales';
import { selectInternalOus, selectUsersWithBu } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import moment from 'moment';
import {
  NormalAccSelect,
  BuSelect,
  ExpenseDetailList,
  PreDocList,
  ReasonSelect,
  ReimTypeSelect,
  ResSelect,
} from './components';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'advanceVerificationCreate'; //

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 非差旅费用报销
 */
@connect(({ loading, dispatch, user, advanceVerificationCreate }) => ({
  loading,
  dispatch,
  user,
  advanceVerificationCreate,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.advanceVerificationCreate;
    const fields = {};
    Object.keys(formData).forEach(key => {
      fields[key] = Form.createFormField({ value: formData[key] });
    });
    return fields;
  },
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { formData } = props.advanceVerificationCreate;
    const { dispatch } = props;

    const key = Object.keys(changedFields)[0];
    const { value } = Object.values(changedFields)[0];

    switch (key) {
      case 'reimType': {
        // 报销类型联动
        const updateFormData = {
          reimType1: value[0],
          reimType2: value[1],
          reimType3: value[2],
        };
        if (value[0] === 'BUSINESS' && value[1] === 'PURCHASE') {
          updateFormData.reasonType = '04'; // 当是 因公报销-采购付款的时候，事由类型固定为 采购合同
          updateFormData.reimType3 = 'NONPROJ';
        }
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: updateFormData,
        });
        dispatch({ type: `${DOMAIN}/updateState`, payload: { detailList: [] } });
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
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            ...value,
            feeCode: undefined,
            // reimType3: value.reasonType === '01' ? 'PROJ' : 'NONPROJ',
            reimType3: realReimType3,
          },
        });
        dispatch({ type: `${DOMAIN}/updateState`, payload: { detailList: [] } });
        break;
      }
      case 'expenseBu': {
        // 承担BU
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            expenseBuId: value.id,
            expenseBuName: value.buName,
            expenseOuId: value.ouId,
            expenseOuName: value.ouName,
          },
        });
        break;
      }
      case 'abAcc': {
        // 收款账户 联动
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
        break;
      }

      default: {
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [key]: value },
        });
      }
    }
  },
})
@mountToTab()
class AdvanceVerificationCreate extends React.PureComponent {
  componentDidMount() {
    const {
      dispatch,
      advanceVerificationCreate: { formData },
    } = this.props;
    const param = fromQs();
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
            reasonCode = {},
          } = result;
          // 事由类型是采购合同'04'的时候，才请求付款阶段
          reasonType === '04' && !isNil(reasonId) && this.fetchPhase(reasonId);
          this.fetchTmpl(reimType1, reimType2, reimType3, feeCode);
          if (reasonType && !isNil(reasonId)) {
            // 预付款详情接口中不会返回reasonType，下面代码不用改造
            if (reasonType === '03') {
              // 这里不需要判断 reasonId 为 0 了，reasonType 为 03 或者 04 的时候，就根据有的 expenseBuId 来拉数据做匹配即可
              !isNil(expenseBuId) && this.fetchFeeCode(reasonType, expenseBuId);
            } else if (reasonType === '04') {
              reasonCode === 'PU0000000000' // 无效代码
                ? this.fetchFeeCode(reasonType, expenseBuId)
                : this.fetchFeeCode(reasonType, reasonId);
            } else this.fetchFeeCode(reasonType, reasonId);
          }
        }
      });
    } else {
      dispatch({
        type: `${DOMAIN}/init`,
      }).then(res => {
        // 领奖操作,回填表单数据
        const {
          rewardFlag,
          rm,
          bz,
          expenseBu,
          expenseOuId,
          leadNo,
          leadName,
          expenseBuName,
        } = param;
        if (rewardFlag === 'true') {
          this.fetchFeeCode('03', expenseBu);
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              reasonType: '03',
              reasonId: 0, // 无效代码，不用多租户改造
              reasonName: 'TK000-无任务',
              expenseBuId: Number(expenseBu),
              expenseOuId,
              feeCode: 'MKT',
              expenseByType: 'ELITESLAND',
              remark: `线索报备奖:${leadNo}-${leadName}`,
              expenseBuName,
              reimType1: 'PERSONAL',
              reimType2: 'NORM',
              reimType3: 'NONPROJ',
              rewardFlag: 'YES',
            },
          });
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              detailList: [
                {
                  invCnt: 0,
                  currCode: bz,
                  taxAmt: 0,
                  reimAmt: 0,
                  taxedReimAmt: rm,
                  adjustedAmt: 0,
                  invFlag: 1,
                  taxRate: '0',
                  resIds: formData.applyResId ? [`${formData.applyResId}`] : [], // 新增一行的时候，默认把当前的报销人给放进来。PS: 转换成字符串是因为number的匹配不到，这个没时间纠结了
                  feeDate: moment().format('YYYY-MM-DD'),
                  reimDesc: `线索报备奖:${leadNo}-${leadName}`,
                },
              ],
            },
          });
        }
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      advanceVerificationCreate: { formData },
    } = this.props;
    if (
      formData.reimType2 === 'PURCHASE' &&
      formData.reasonType === '04' &&
      formData.reasonId !== void 0 // 此处是判断不为 undefined 不用多租户改造
    ) {
      const { reimType2, reasonType, reasonId } = formData;
      const {
        reimType2: or2,
        reasonType: ort,
        reasonId: orId,
      } = prevProps.advanceVerificationCreate.formData;

      if (reasonId !== orId) {
        this.fetchPhase(formData.reasonId);
      }
    }
    // console.log(formData, prevProps.advanceVerificationCreate.formData);
    const { reimType1, reimType2, reimType3, feeCode, expenseBuId } = formData;
    const {
      reimType1: or1,
      reimType2: or2,
      reimType3: or3,
      feeCode: oe,
    } = prevProps.advanceVerificationCreate.formData;
    if (reimType1 && reimType2 && reimType3 && feeCode) {
      if (reimType1 !== or1 || reimType2 !== or2 || reimType3 !== or3 || feeCode !== oe) {
        this.fetchTmpl(reimType1, reimType2, reimType3, feeCode);
      }
    }

    const { reasonType, reasonId, reasonCode } = formData;
    const {
      reasonType: prt,
      reasonId: ori,
      reasonCode: prc,
    } = prevProps.advanceVerificationCreate.formData;

    if (reasonType && !isNil(reasonCode)) {
      // 引入 isNil 是因为， 无任务 是 0，js 上还是认为是 false
      if (reasonType !== prt || reasonId !== ori) {
        if (reasonType === '03') {
          // reasonType === '03' 事由类型是 BU 的时候，请求的id应该是 费用承担BU expenseBuId
          // 对于 03， reasonId 为 0 是 无任务
          reasonCode !== 'TK000' && this.fetchFeeCode(reasonType, expenseBuId);
        } else if (reasonType === '04') {
          // reasonType === '04' 事由类型是 采购合同 的时候，同上
          // 对于 04， reasonId 为 0 是 无项目合同
          reasonCode !== 'PU0000000000' && this.fetchFeeCode(reasonType, reasonId);
        } else {
          this.fetchFeeCode(reasonType, reasonId);
        }
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

      const {
        dispatch,
        advanceVerificationCreate: { formData },
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
      advanceVerificationCreate: {
        formData = {},
        detailList,
        mode,
        phaseList,
        reimTmpl,
        feeCodeList,
      },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;

    const param = fromQs();
    const preparing = loading.effects[`${DOMAIN}/query`];
    const submitting = loading.effects[`${DOMAIN}/save`];
    const noSubmitStatus = ['APPROVING', 'APPROVED', 'CLOSED'];
    const apprStatusBtn = noSubmitStatus.includes(formData.apprStatus);

    return (
      <PageHeaderWrapper title="预付款核销申请">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={preparing || submitting || apprStatusBtn}
            onClick={this.handleSave}
          >
            提交
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto(param.sourceUrl)}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="预付款核销申请" />}
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
                  <Input disabled />
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
                    onChange={e => {
                      // bu任务 '03'
                      if (formData.reasonType === '03' && (formData || {}).reasonCode === 'TK000') {
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
                    allowClear={false}
                    source={() => selectInternalOus().then(resp => resp.response)}
                  />
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
                  <AsyncSelect allowClear={false} source={feeCodeList} />
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
                  <UdcSelect allowClear={false} code="ACC:REIM_EXP_BY" />
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
                  <UdcSelect allowClear={false} code="ACC:PAY_METHOD" />
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
                  <Selection.UDC code="ACC:HX_TYPE" placeholder="请选择核销方式" />
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
                  <Selection.UDC code="ACC:ADPAY_HX_STATE" placeholder="请选择核销状态" disabled />
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
                    disabled={false}
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
                  <Input.TextArea autosize={{ minRows: 2, maxRows: 5 }} className="x-fill-100" />
                </Field>
              </FieldList>

              <Divider dashed />

              {formData.reimType2 === 'PURCHASE' &&
                formData.reasonType === '04' &&
                formData.reasonId !== undefined && (
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
                        name="supplierId"
                        label={formatMessage({
                          id: `ui.menu.user.expense.form.supplierName`,
                          desc: '供应商',
                        })}
                        decorator={{
                          initialValue: formData.supplierId,
                          rules: [
                            {
                              required: true,
                              message:
                                '请选择' +
                                formatMessage({
                                  id: `ui.menu.user.expense.form.supplierName`,
                                  desc: '供应商',
                                }),
                            },
                          ],
                        }}
                      >
                        {/* <Input disabled /> */}
                        <AsyncSelect
                          source={() => selectSupplier().then(resp => resp.response)}
                          placeholder="请选择供应商"
                          showSearch
                          filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          onChange={value => {
                            // 报销人联动
                            if (formData.supplierId !== value) {
                              dispatch({
                                type: `${DOMAIN}/updateForm`,
                                payload: {
                                  // 清空账户字段
                                  supplierId: value,
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
                        name="phaseDesc"
                        label={formatMessage({
                          id: `ui.menu.user.expense.form.phaseDesc`,
                          desc: '采购付款阶段',
                        })}
                        transfer={{ key: 'id', code: 'id', name: 'name' }}
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
                        />
                      </Field>
                    </FieldList>

                    <Divider dashed />
                  </>
                )}

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

              <div className="tw-card-title">费用明细（请先选择报销类型和事由号）</div>

              <br />

              <ExpenseDetailList
                reimTmpl={reimTmpl.detailList}
                dispatch={dispatch}
                dataSource={detailList}
                reimResId={formData.applyResId}
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
                  <NormalAccSelect resId={formData.applyResId} suppId={formData.supplierId} />
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

              <br />
              <div style={{ marginTop: 60 }} />
            </>
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default AdvanceVerificationCreate;
