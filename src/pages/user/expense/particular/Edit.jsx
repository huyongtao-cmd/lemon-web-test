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
import { isEmpty, isNil, gte, gt } from 'ramda';
import { fromQs } from '@/utils/stringUtils';
import {
  getReimTmpl,
  selectFeeCode,
  selectPayPlan,
  getApplysByResId,
  getAvailableFeeApply,
} from '@/services/user/expense/expense';
import { selectSupplier, selectFinperiod } from '@/services/user/Contract/sales';
import { selectInternalOus } from '@/services/gen/list';
import {
  NormalAccSelect,
  BuSelect,
  ParticularExpenseDetailList,
  PreDocList,
  ReasonSelectParticular,
  ReimTypeSelect,
  ResSelect,
} from '../components';
import { handleInvoiceVerify } from '@/services/user/expense/expense';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'userExpenseParticularEdit'; //

const REQUIRE_FEEAPPLYID_AMOUNT = 1000;

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 特殊费用报销
 * * TAG :: 历史原因，spec 变成了专项报销，特殊费用报销就变成了 particular 了 ==
 */
@connect(({ loading, dispatch, user, userExpenseParticularEdit }) => ({
  loading,
  dispatch,
  user,
  userExpenseParticularEdit,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.userExpenseParticularEdit;
    const fields = {};
    Object.keys(formData).forEach(key => {
      fields[key] = Form.createFormField({ value: formData[key] });
    });
    return fields;
  },
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { formData, expenseOuList } = props.userExpenseParticularEdit;
    const { dispatch } = props;

    const key = Object.keys(changedFields)[0];
    const { value } = Object.values(changedFields)[0];

    switch (key) {
      case 'reimRes': {
        // 报销人联动
        if (formData.reimResId !== value.id) {
          props.dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              reimResId: value.id,
              reimResName: value.name,
              resBuName: value.receiverBuName,
              jobGrade: value.jobGrade,
            },
          });
        }
        break;
      }
      case 'reimType': {
        // 报销类型联动
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            reimType1: value[0],
            reimType2: value[1],
            reimType3: value[2],
          },
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
      case 'expenseOuId': {
        const newExpenseOuName = expenseOuList.filter(item => +item.id === +value)[0].name;
        // 费用承担公司变化
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            expenseOuId: value,
            expenseOuName: newExpenseOuName,
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
class ExpenseEdit extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      satisfiedFeeApply: false,
      tipModalVisible: false,
      isSubmit: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();

    selectInternalOus().then(resp => {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          expenseOuList: resp.response,
        },
      });
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
            reasonCode,
          } = result;
          // 事由类型是采购合同'04'的时候，才请求付款阶段
          reasonType === '04' && !isNil(reasonId) && this.fetchPhase(reasonId);
          this.fetchTmpl(reimType1, reimType2, reimType3, feeCode);
          if (!isNil(reimResId)) this.fetchFeeApply(reimResId); // reimResId 肯定存在的，不过还是做一下判断稳妥点
          if (!isNil(feeApplyId)) this.fetchFeeApplyAvailable(feeApplyId); // 同上
          if (reasonType && !isNil(reasonId)) {
            if (reasonType === '03') {
              // 这里不需要判断 reasonId 为 0 了，reasonType 为 03 或者 04 的时候，就根据有的 expenseBuId 来拉数据做匹配即可
              !isNil(expenseBuId) && this.fetchFeeCode(reasonType, expenseBuId);
            } else if (reasonType === '04') {
              reasonCode === 'PU0000000000'
                ? this.fetchFeeCode(reasonType, expenseBuId)
                : this.fetchFeeCode(reasonType, reasonId);
            } else this.fetchFeeCode(reasonType, reasonId);
          }
        }
      });
    } else {
      dispatch({
        type: `${DOMAIN}/init`,
      }).then(resId => {
        if (!isNil(resId)) this.fetchFeeApply(resId);
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      userExpenseParticularEdit: { formData },
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
      } = prevProps.userExpenseParticularEdit.formData;

      if (reasonId !== orId) {
        this.fetchPhase(formData.reasonId);
      }
    }
    // console.log(formData, prevProps.userExpenseParticularEdit.formData);
    const { reimType1, reimType2, reimType3, feeCode, expenseBuId } = formData;
    const {
      reimType1: or1,
      reimType2: or2,
      reimType3: or3,
      feeCode: oe,
    } = prevProps.userExpenseParticularEdit.formData;
    if (reimType1 && reimType2 && reimType3 && feeCode) {
      if (reimType1 !== or1 || reimType2 !== or2 || reimType3 !== or3 || feeCode !== oe) {
        this.fetchTmpl(reimType1, reimType2, reimType3, feeCode);
      }
    }

    const { reasonType, reasonId, reasonCode } = formData;
    const { reasonType: prt, reasonId: ori } = prevProps.userExpenseParticularEdit.formData;

    if (reasonType && !isNil(reasonId) && reasonCode) {
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
        userExpenseParticularEdit: { formData },
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

  fetchFeeApplyAvailable = feeApplyId => {
    getAvailableFeeApply(feeApplyId).then(({ status, response }) => {
      if (status === 100) {
        // 主动取消请求
      } else if (status === 200) {
        const { dispatch } = this.props;
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            feeApplyAvailable: response || 0,
          },
        });
      }
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
    const { isSubmit } = this.state;
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      userExpenseParticularEdit: { formData, detailList },
    } = this.props;
    const { satisfiedFeeApply } = this.state;
    const param = fromQs();
    if (param.id && !param.isCopy) {
      const { id = undefined, apprId = undefined, remark = undefined } = param;
      // 去掉了可报销金额的判断
      // if (!satisfiedFeeApply) {
      //   createMessage({ type: 'warn', description: '特殊费用报销申请单金额不满足要求' });
      //   return;
      // }
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
      // 去掉了可报销金额的判断
      // if (!satisfiedFeeApply) {
      //   createMessage({ type: 'warn', description: '特殊费用报销申请单金额不满足要求' });
      //   return;
      // }
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
      userExpenseParticularEdit: { formData, detailList },
    } = this.props;
    const { satisfiedFeeApply } = this.state;

    // 获取url上的参数
    const param = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (detailList.length > 0) {
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

          /**
           * 检查发票的开票日期：发票的开票日期不能早于业务发生日期（开票日期为空的，不做此限制）
           * 以下情况不做此项检查：①差旅费用报销：类型为“餐费”或“业务招待费”；②非差旅费用报销：科目为“误餐费”。
           */

          let detailIndex;
          let invItem;
          const invoiceDateBeforeFlag = detailList.some((item, index) => {
            if (item.invoiceentity && item.invoiceentity.length > 0) {
              detailIndex = index;

              const filterInvoiceentity = item.invoiceentity.filter(ele => ele.invoiceDate);
              if (
                filterInvoiceentity.some(ele => {
                  invItem = ele;
                  return moment(ele.invoiceDate).isBefore(moment(item.feeDate));
                })
              ) {
                return true;
              }
            }
          });

          if (invoiceDateBeforeFlag) {
            return createMessage({
              type: 'warn',
              description: `第【${detailIndex + 1}】行明细中发票【${invItem.invoiceNo ||
                ''}】开票日期早于业务发生日期，请检查`,
            });
          }

          // ---------弱提示--------
          /**
           *
           * 连号发票检查：从当前报销单提交日期往前推算60天的所有报销中，是否存在同号发票
           */
          // const hotelDetailList = detailList.filter(item => item.feeType === 'HOTEL');
          console.log('formData,detailList', formData, detailList);

          if (detailList.length > 0) {
            const newDetailList = cloneDeep(detailList);
            const res = handleInvoiceVerify({
              reimResId: formData.reimResId,
              detailList: newDetailList.map(item => {
                item.id = null;
                return item;
              }),
            }).then(res => {
              console.log('res ->', res);
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
          console.log('lastMonthFirstDay', lastMonthFirstDay);
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
          // 去掉了可报销金额的判断
          // if (!satisfiedFeeApply) {
          //   createMessage({ type: 'warn', description: '特殊费用报销申请单金额不满足要求' });
          //   return;
          // }
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
          // 去掉了可报销金额的判断
          // if (!satisfiedFeeApply) {
          //   createMessage({ type: 'warn', description: '特殊费用报销申请单金额不满足要求' });
          //   return;
          // }
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
      userExpenseParticularEdit: {
        formData = {},
        detailList,
        mode,
        phaseList,
        reimTmpl,
        feeCodeList,
        feeApplyList,
        feeApplyAvailable,
      },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;

    const param = fromQs();
    const { tipModalVisible } = this.state;
    const title = '特殊费用报销' + formData.id ? '编辑' : '新增';
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
            disabled={preparing || submitting || (apprStatusBtn && type === '0')}
            onClick={this.handleSave(false)}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>

          {!param.hightEdit && (
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={preparing || submitting}
              onClick={this.handleSave(true)}
            >
              提交
            </Button>
          )}

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
                  <AsyncSelect
                    allowClear={false}
                    source={feeApplyList}
                    onChange={value => {
                      if (!isNil(value)) this.fetchFeeApplyAvailable(value);
                      else
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            feeApplyAvailable: 0,
                          },
                        });
                    }}
                  />
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
                        this.fetchFeeApply(value.id);
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
                    isBSpecial
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
                  <ReasonSelectParticular
                    resId={formData.reimResId}
                    detailList={detailList}
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
                    disabled={
                      !(
                        (formData && formData.reasonCode === 'PU0000000000') ||
                        formData.reasonCode === 'TK000'
                      )
                    }
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
                  <RadioGroup>
                    <Radio value={1}>是</Radio>
                    <Radio value={0}>否</Radio>
                  </RadioGroup>
                </Field> */}
                {param.id && (
                  <Field
                    name="projCompany"
                    label="项目签约公司"
                    decorator={{
                      initialValue: formData.projCompany,
                    }}
                  >
                    <Input disabled />
                  </Field>
                )}
                {param.id && (
                  <Field
                    name="resCompany"
                    label="报销人所属公司"
                    decorator={{
                      initialValue: formData.resCompany,
                    }}
                  >
                    <Input disabled />
                  </Field>
                )}
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
                  fieldCol={1}
                  labelCol={{ span: 4, xxl: 3 }}
                  wrapperCol={{ span: 19, xxl: 20 }}
                  name="remark"
                  label="报销说明"
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
                {/* 选择报销申请单后，展示可报销额度 */}
                {formData.feeApplyId && (
                  <span style={{ fontWeight: 'bolder', color: 'red' }}>
                    {gt(feeApplyAvailable, 0)
                      ? `可报销金额${feeApplyAvailable}元`
                      : '当前申请单无可报销额度'}
                  </span>
                )}
              </div>

              <br />

              <ParticularExpenseDetailList
                reimTmpl={reimTmpl.detailList}
                dispatch={dispatch}
                dataSource={detailList}
                reimResId={formData.reimResId}
                formData={formData}
                loading={false}
                domain={DOMAIN}
                onTotalChange={totalLine => {
                  const { reimAmt = 0 } = totalLine;
                  // 首先可以报销，其次报销总额要小于等于可报销额度
                  this.setState({
                    satisfiedFeeApply: gt(feeApplyAvailable, 0) && gte(feeApplyAvailable, reimAmt),
                  });
                }}
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
                    reimType1={formData.reimType1}
                    reasonType={formData.reasonType}
                    reasonId={formData.reasonId}
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
