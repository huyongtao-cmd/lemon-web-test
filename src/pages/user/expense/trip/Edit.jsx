/* eslint-disable */
import React from 'react';
import { connect } from 'dva';
import { cloneDeep } from 'lodash';
import { Button, Card, Divider, Form, Input, Radio, Modal } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import moment from 'moment';
import FieldList from '@/components/layout/FieldList';
import { FileManagerEnhance, UdcSelect, Selection, DatePicker } from '@/pages/gen/field';
import { closeThenGoto, injectUdc, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import createMessage from '@/components/core/AlertMessage';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
// import { getReimTmpl, selectFeeCode, selectPayPlan } from '@/services/user/expense/expense';
import { fromQs } from '@/utils/stringUtils';
import { selectInternalOus } from '@/services/gen/list';
import { selectFinperiod } from '@/services/user/Contract/sales';
import {
  AccSelect,
  ReasonSelect,
  ReimTypeSelect,
  ResSelect,
  TripApplySelect,
  TripExpenseDetailList,
  TripModal,
} from '../components';
import { handleInvoiceVerify } from '@/services/user/expense/expense';
import { trueDependencies } from 'mathjs';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'userExpenseTripEdit'; //

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 差旅费用报销
 */
@connect(({ loading, dispatch, userExpenseTripEdit, user }) => ({
  loading,
  dispatch,
  userExpenseTripEdit,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.userExpenseTripEdit;
    const fields = {};
    Object.keys(formData).forEach(key => {
      fields[key] = Form.createFormField({ value: formData[key] });
    });
    return fields;
  },
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { formData, expenseOuList } = props.userExpenseTripEdit;
    const { dispatch } = props;

    const key = Object.keys(changedFields)[0];
    const { value } = Object.values(changedFields)[0];

    switch (key) {
      case 'reimRes': {
        // 报销人联动
        if (formData.reimResId !== value.id) {
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              reimResId: value.id,
              reimResName: value.name,
              resBuName: value.receiverBuName,
              jobGrade: value.jobGrade,
              custpaytravelFlag: value.custpaytravelFlag,
            },
          });
        }
        break;
      }
      case 'reimType': {
        let bookTicketFlag = 0;
        // 如果选择报销类型，且报销类型为 因公报销(BUSINESS)/行政订票(TICKET) 时， bookTicketFlag 为 1，否则为 0
        if (!isNil(value) && value[0] === 'BUSINESS' && value[1] === 'TICKET') bookTicketFlag = 1;
        else bookTicketFlag = 0;
        // 报销类型联动
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            reimType1: value[0],
            reimType2: value[1],
            reimType3: value[2],
            bookTicketFlag,
          },
        });
        dispatch({ type: `${DOMAIN}/updateState`, payload: { detailList: [] } });
        break;
      }
      case 'reason': {
        // 事由类型 / 事由号 联动
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            ...value,
            feeCode: undefined,
            reimType3: value.reasonType === '01' ? 'PROJ' : 'NONPROJ',
          },
        });
        dispatch({ type: `${DOMAIN}/updateState`, payload: { detailList: [] } });
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
      tipModalVisible: false,
      tipModalVisibleArr: [],
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
      });
    } else {
      dispatch({
        type: `${DOMAIN}/init`,
      });
    }
  }
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
      userExpenseTripEdit: { formData, detailList },
    } = this.props;
    const param = fromQs();
    const { id = null, apprId = null, remark = null, isCopy } = fromQs();
    if (id && !isCopy) {
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
      userExpenseTripEdit: { formData, detailList },
    } = this.props;

    const { roles } = formData;
    // 获取url上的参数
    const param = fromQs();
    console.log('formData, detailList ', formData, detailList);
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (detailList.length > 0) {
          // 必须关联发票或者填写无发票原因
          const tt = detailList
            // 餐费不做检验
            .filter(v => v.feeType !== 'MEAL')
            .filter(
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

          // const tt = invSelRows.filter(v =>
          // moment(feeDate).isAfter(moment(v.invBillingDate).add(3, 'months'))
          // );

          // ---------强提示--------
          /**
           * 购买方名称必须和费用承担公司一致，
           * 购方名称和报销人一样时，不受此规则限制
           */
          // const purchaserNameDiffFlag = detailList.some(item => {
          //   if (item.invoiceentity && item.invoiceentity.length > 0) {
          //     const tempInvSelRows = item.invoiceentity
          //       .filter(ele => ele.purchaserName)
          //       .filter(ele => ele.purchaserName !== formData.reimResName);
          //     if (tempInvSelRows.length > 0) {
          //       if (tempInvSelRows.some(ele => ele.purchaserName !== formData.expenseOuName)) {
          //         return true;
          //       }
          //     }
          //   }
          // });
          // if (purchaserNameDiffFlag) {
          //   return createMessage({
          //     type: 'warn',
          //     description: '必须选择购方名称和当前费用承担公司一致的发票',
          //   });
          // }

          /**
           * 检查发票的开票日期：发票的开票日期不能早于业务发生日期（开票日期为空的，不做此限制）
           * 以下情况不做此项检查：①差旅费用报销：类型为“餐费”或“业务招待费”；②非差旅费用报销：科目为“误餐费”。
           */

          let detailIndex;
          let invItem;
          const filterDetailList = detailList.filter(
            item => item.feeType !== 'MEAL' && item.feeType !== 'BUSINESS_ENTERTAIN'
          );
          const invoiceDateBeforeFlag = filterDetailList.some((item, index) => {
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
           * 餐费和业务招待费重复检查
           * 差旅费用报销中，差旅餐补贴计算里同时勾选了午餐和晚餐，同时当天又有业务招待费的，则检查结果=“餐费重复报销”
           */
          const mealArr = detailList.filter(item => item.feeType === 'MEAL'); // 餐费
          const businessArr = detailList.filter(item => item.feeType === 'BUSINESS_ENTERTAIN'); // 业务招待费
          if (mealArr.length && businessArr.length) {
            businessArr.map(item => {
              mealArr.map(ele => {
                if (ele.tripMealsDayList && ele.tripMealsDayList.length) {
                  ele.tripMealsDayList.map(v => {
                    if (item.feeDate === v.tripDate) {
                      if (v.noon === '1' || v.night === '1') {
                        this.setState({
                          tipModalVisible: true,
                        });
                        dispatch({
                          type: `${DOMAIN}/updateTableCell`,
                          payload: {
                            item,
                            ruleExplain: '餐费业务招待费重复，请在备注中说明',
                          },
                        });
                        dispatch({
                          type: `${DOMAIN}/updateTableCell`,
                          payload: { item: ele, ruleExplain: '餐费业务招待费重复，请在备注中说明' },
                        });
                        return;
                      } else {
                        dispatch({
                          type: `${DOMAIN}/updateTableCell`,
                          payload: {
                            item,
                            ruleExplain: '',
                          },
                        });
                      }
                    }
                  });
                }
              });
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
                    // createMessage({
                    //   type: 'warn',
                    //   description: `发票超过限定金额`,
                    // });
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
            delayList.map(item => {
              dispatch({
                type: `${DOMAIN}/updateTableCell`,
                payload: { item, ruleExplain: '报销日期延误' },
              });
            });
            return;
          }

          /**
           * 住宿费用超标检查: 根据职级、城市、报销日期范围
           *
           * 连号发票检查：从当前报销单提交日期往前推算60天的所有报销中，是否存在同号发票
           */
          // const hotelDetailList = detailList.filter(item => item.feeType === 'HOTEL');
          console.log('formData,detailList', formData, detailList);

          if (detailList.length > 0) {
            // const newDetailList = detailList.concat();
            const newDetailList = cloneDeep(detailList);
            console.log('detailList, newDetailList', detailList, newDetailList);
            const res = handleInvoiceVerify({
              reimResId: formData.reimResId,
              detailList: newDetailList.map(item => {
                item.id = null;
                return item;
              }),
            }).then(res => {
              if (res.response.ok) {
                // 平台总体负责人盖总、傅总不做住宿费超标校验，特殊处理
                if (!roles.includes('PLAT_ALL_PIC')) {
                  const exceedHotelFeeArr = res.response.datum.filter(
                    item => item.exceedHotelFee === true
                  );

                  if (exceedHotelFeeArr.length > 0) {
                    this.setState({
                      tipModalVisible: true,
                    });
                    exceedHotelFeeArr.map(item => {
                      dispatch({
                        type: `${DOMAIN}/updateTableCell`,
                        payload: {
                          type: 'exceedHotelFee',
                          item,
                          ruleExplain: '住宿费超标',
                        },
                      });
                    });
                    return;
                  }
                }

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
        }

        /**
         * 6)	出发时间与餐费检查
         * a)	根据报销单中费用类型为“火车票/飞机票”的，计算实际出差的日期区间
         * feeType: "AIR" 飞机票
         * feeType: "TRAIN" 火车票
         */
        // const tripDetailList = detailList.filter(
        //   item => item.feeType === 'AIR' || item.feeType === 'TRAIN'
        // );
        // const mealDetailList = detailList.filter(item => item.feeType === 'MEAL');
        // console.log('tripDetailList', tripDetailList);
        // const noInvoiceTripList = tripDetailList.filter(item => item.invoiceentity);
        // console.log('noInvoiceTripList', noInvoiceTripList);
        // if (noInvoiceTripList.length) {
        //   this.setState({
        //     tipModalVisible: true,
        //   });
        //   mealDetailList.map(ele => {
        //     dispatch({
        //       type: `${DOMAIN}/updateTableCell`,
        //       payload: { item: ele, ruleExplain: '餐补与差旅时间未检查' },
        //     });
        //   });
        //   return;
        // }

        const { id = null, apprId = null, remark = null, isCopy } = fromQs();
        if (id && !isCopy) {
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

    // const { id = null, apprId = null, remark = null, isCopy } = fromQs();
    // if (id && !isCopy) {
    //   // 编辑保存
    //   validateFieldsAndScroll((error, values) => {
    //     if (!error) {
    //       dispatch({
    //         type: `${DOMAIN}/save`,

    //         payload: {
    //           id,
    //           isSubmit,
    //           taskId: formData.bpmTaskId,
    //           params: { result: 'APPROVED', remark },
    //         },
    //       });
    //     } else {
    //       createMessage({ type: 'warn', description: Object.values(error)[0].errors[0].message });
    //     }
    //   });
    // } else {
    //   // 新建保存
    //   validateFieldsAndScroll((error, values) => {
    //     if (!error) {
    //       dispatch({
    //         type: `${DOMAIN}/create`,
    //         payload: {
    //           isSubmit,
    //         },
    //       });
    //     } else {
    //       createMessage({ type: 'warn', description: Object.values(error)[0].errors[0].message });
    //     }
    //   });
    // }
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    const {
      dispatch,
      loading,
      userExpenseTripEdit: {
        formData,
        detailList,
        mode,
        feeCodeList,
        tripApplyList,
        visible,
        modalParmas,
        mealMoenyList,
      },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    const { reimTmpl, _udcMap = {}, tipModalVisible } = this.state;
    const { cities = [] } = _udcMap;

    const param = fromQs();
    const { type } = param;

    const title = '差旅费用报销' + formData.id ? '编辑' : '新增';
    const preparing = loading.effects[param.id ? `${DOMAIN}/query` : `${DOMAIN}/init`];
    const submitting =
      loading.effects[param.id && !param.isCopy ? `${DOMAIN}/save` : `${DOMAIN}/create`];
    const noSubmitStatus = ['APPROVING', 'APPROVED', 'CLOSED'];
    const apprStatusBtn = noSubmitStatus.includes(formData.apprStatus);
    const saveOrCreateBtn =
      loading.effects[`${DOMAIN}/save`] || loading.effects[`${DOMAIN}/create`];
    // console.log('preparing', preparing);
    return (
      <PageHeaderWrapper title={title}>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={preparing || submitting || saveOrCreateBtn}
            onClick={this.handleSave(false)}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={preparing || submitting || apprStatusBtn || saveOrCreateBtn}
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
                    onChange={value => {
                      // 因为没有clear，所以不可能为空，就去掉了else
                      if (!isEmpty(value)) {
                        dispatch({
                          type: `${DOMAIN}/updateForm`,
                          payload: {
                            // 清空账户字段
                            abAccId: undefined,
                            accountNo: undefined,
                            bankName: undefined,
                            bankBranch: undefined,
                            holderName: undefined,
                            // 出差申请单改动的部分也清空
                            busitripApplyId: undefined,
                            expenseBuId: undefined,
                            expenseBuName: undefined,
                            expenseOuId: undefined,
                            expenseOuName: undefined,
                            reasonId: undefined,
                            reasonName: undefined,
                            reasonCode: undefined,
                            reasonType: undefined,
                            reasonTypeDesc: undefined,
                            sumBuId: undefined,
                            sumBuName: undefined,
                            // reimType3: undefined,
                            feeCode: undefined,
                            bookTicketFlag: undefined,
                            // reimType1: undefined,
                            // reimType2: undefined,
                            custpaytravelFlag: null,
                          },
                        });
                        dispatch({
                          type: `${DOMAIN}/selectTripApply`,
                          payload: {
                            id: param.id,
                            resId: value.id,
                            reimType1: formData.reimType1,
                          },
                        });

                        // 获取资源角色
                        dispatch({
                          type: `${DOMAIN}/getResRoles`,
                          payload: {
                            resId: value.id,
                          },
                        });
                      }
                      // else {
                      //   dispatch({
                      //     type: `${DOMAIN}/updateState`,
                      //     payload: {
                      //       tripApplyList: [],
                      //     },
                      //   });
                      // }
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
                  name="busitripApplyId"
                  label="出差申请单"
                  decorator={{
                    initialValue: formData.busitripApplyId,
                    rules: [
                      {
                        required: true,
                        message: '请输入出差申请单',
                      },
                    ],
                  }}
                >
                  <Selection.Columns
                    className="x-fill-100"
                    source={tripApplyList}
                    columns={[
                      { dataIndex: 'applyNo', title: '编号', span: 8 },
                      { dataIndex: 'applyName', title: '名称', span: 16 },
                    ]}
                    transfer={{ key: 'id', code: 'id', name: 'applyName' }}
                    dropdownMatchSelectWidth={false}
                    // dropdownStyle={{ width: 440 }}
                    showSearch
                    onColumnsChange={value => {
                      if (value) {
                        const {
                          id,
                          applyName,
                          expenseBuId,
                          expenseBuName,
                          ouId,
                          ouName,
                          reasonId,
                          reasonName,
                          reasonCode,
                          reasonType,
                          reasonTypeDesc,
                          sumBuId,
                          sumBuName,
                          // bookTicketFlag,
                          feeCode,
                          custpaytravelFlag,
                        } = value;
                        // const reimType = bookTicketFlag
                        //   ? {
                        //       reimType1: 'BUSINESS',
                        //       reimType2: 'TICKET',
                        //     }
                        //   : {};
                        const updateForm = {
                          busitripApplyId: id,
                          expenseBuId,
                          expenseBuName,
                          expenseOuId: ouId,
                          expenseOuName: ouName,
                          reasonId,
                          reasonName,
                          reasonCode,
                          reasonType,
                          reasonTypeDesc,
                          sumBuId,
                          sumBuName,
                          reimType3: reasonType === '01' ? 'PROJ' : 'NONPROJ',
                          feeCode,
                          custpaytravelFlag,
                          // bookTicketFlag,
                          // ...reimType,
                        };
                        dispatch({
                          type: `${DOMAIN}/updateForm`,
                          payload: { ...updateForm },
                        });
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            feeCodeList: value.feeCodeList,
                          },
                        });
                      } else {
                        dispatch({
                          type: `${DOMAIN}/updateForm`,
                          payload: {
                            busitripApplyId: undefined,
                            expenseBuId: undefined,
                            expenseBuName: undefined,
                            expenseOuId: undefined,
                            expenseOuName: undefined,
                            reasonId: undefined,
                            reasonType: undefined,
                            reasonTypeDesc: undefined,
                            sumBuId: undefined,
                            sumBuName: undefined,
                            reimType3: undefined,
                            feeCode: undefined,
                            bookTicketFlag: 0,
                            reimType1: undefined,
                            reimType2: undefined,
                            custpaytravelFlag: undefined,
                          },
                        });
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            feeCodeList: [],
                          },
                        });
                      }
                    }}
                  />
                  {/* <TripApplySelect
                    resId={formData.reimResId}
                    // initFeeCode={list => this.setState({ feeCodeList: list })}
                    initFeeCode={list =>
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          feeCodeList: list,
                        },
                      })
                    }
                  /> */}
                </Field>

                {param.id && (
                  <Field
                    name="expenseByTypeFoTrip"
                    label="费用承担方"
                    decorator={{
                      initialValue: formData.expenseByTypeFoTrip,
                    }}
                  >
                    <Selection.UDC
                      code="ACC:REIM_EXP_BY"
                      placeholder="请选择费用承担方"
                      disabled={param.type === '0'}
                    />
                  </Field>
                )}

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
                  <ReimTypeSelect
                    // disabled={formData.bookTicketFlag}
                    isTrip
                    detailList={detailList}
                    onChange={value => {
                      if (!isNil(value)) {
                        const [reimType1, ...rest] = value;
                        dispatch({
                          type: `${DOMAIN}/updateForm`,
                          payload: {
                            // 出差申请单改动的部分也清空
                            busitripApplyId: undefined,
                            expenseBuId: undefined,
                            expenseBuName: undefined,
                            expenseOuId: undefined,
                            expenseOuName: undefined,
                            reasonId: undefined,
                            reasonName: undefined,
                            reasonCode: undefined,
                            reasonType: undefined,
                            reasonTypeDesc: undefined,
                            sumBuId: undefined,
                            sumBuName: undefined,
                            reimType3: undefined,
                            feeCode: undefined,
                          },
                        });
                        dispatch({
                          type: `${DOMAIN}/selectTripApply`,
                          payload: {
                            id: param.id,
                            resId: formData.reimResId,
                            reimType1,
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
                    rules: [
                      {
                        required: true,
                        message: '请输入费用承担BU',
                      },
                    ],
                  }}
                >
                  <Input disabled />
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
                          '请输入' +
                          formatMessage({
                            id: `ui.menu.user.expense.form.feeCode`,
                            desc: '费用码',
                          }),
                      },
                    ],
                  }}
                >
                  <Selection
                    transfer={{ code: 'feeCode', name: 'feeCodeDesc' }}
                    source={feeCodeList}
                    // disabled
                  />
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
                  name="custpaytravelFlag"
                  label="客户承担差旅"
                  decorator={{
                    initialValue: formData.custpaytravelFlag || '',
                  }}
                >
                  <UdcSelect code="ACC:CONTRACT_CUSTPAY_TRAVEL" placeholder="请选择..." disabled />
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

              <div className="tw-card-title">费用明细</div>

              <br />

              <TripExpenseDetailList
                reimTmpl={reimTmpl.detailList}
                dispatch={dispatch}
                dataSource={detailList}
                formData={formData}
                loading={false}
                domain={DOMAIN}
                cities={cities}
                visible={visible}
                modalParmas={modalParmas}
                mealMoenyList={mealMoenyList}
                isPersonalAndTrip={
                  formData.reimType1 === 'PERSONAL' && formData.reimType2 === 'TRIP'
                }
                reimResId={formData.reimResId}
                expenseType="trip"
              />

              <TripModal cities={cities} dataSource={detailList} />

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
