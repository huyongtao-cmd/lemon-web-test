/* eslint-disable */
import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { cloneDeep } from 'lodash';
import { Button, Card, Divider, Form, Input, Radio, Modal } from 'antd';
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
import { isEmpty, isNil, findIndex } from 'ramda';
import { fromQs } from '@/utils/stringUtils';
import { getReimTmpl, selectFeeCode, selectPayPlan } from '@/services/user/expense/expense';
import { selectSupplier } from '@/services/user/Contract/sales';
import { selectInternalOus } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { findIdByNo } from '@/services/user/task/task';
import {
  NormalAccSelect,
  BuSelect,
  ExpenseDetailList,
  PreDocList,
  ReasonSelect,
  ReimTypeSelectNormal,
  ResSelect,
  InvoiceModal,
} from '../components';
import { handleInvoiceVerify } from '@/services/user/expense/expense';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'userExpenseNormalCreate'; //

const accCodeList = [
  'MGT-6602-00502',
  'YMGT-5301-0010402',
  'GMGT-5001-00502',
  'DPCST-5401-00502',
  'OPCST-5001-00502',
  'STP-5001-00502',
  'BMGT-6602-00502',
  'SAL-6601-00502',
];
// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 非差旅费用报销
 */
@connect(({ loading, dispatch, user, userExpenseNormalCreate }) => ({
  loading,
  dispatch,
  user,
  userExpenseNormalCreate,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.userExpenseNormalCreate;
    const fields = {};
    Object.keys(formData).forEach(key => {
      fields[key] = Form.createFormField({ value: formData[key] });
    });
    return fields;
  },
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { formData, expenseOuList } = props.userExpenseNormalCreate;
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
              isNil(value.subContractId) || value.subContractId <= 0 ? 'NONPROJ' : 'PROJ'; // 子合同id非特指子合同id=0的记录不用改造
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
  state = {
    tipModalVisible: false,
    isSubmit: false,
  };

  componentDidMount() {
    const {
      dispatch,
      userExpenseNormalCreate: { formData },
    } = this.props;
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
            reasonCode = '',
          } = result;
          // 事由类型是采购合同'04'的时候，才请求付款阶段
          reasonType === '04' && !isNil(reasonId) && this.fetchPhase(reasonId);
          this.fetchTmpl(reimType1, reimType2, reimType3, feeCode);
          if (reasonType && !isNil(reasonId)) {
            if (reasonType === '03') {
              // 这里不需要判断 reasonId 为 0 了，reasonType 为 03 或者 04 的时候，就根据有的 expenseBuId 来拉数据做匹配即可
              !isNil(expenseBuId) && this.fetchFeeCode(reasonType, expenseBuId);
            } else if (reasonType === '04') {
              reasonCode === 'PU0000000000' // 线索领奖也会跳转到本页面，单不会传id进来；无效代码
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
          findIdByNo('TK000').then(taskId => {
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                reasonType: '03',
                reasonId: taskId.response,
                reasonCode: 'TK000',
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
                  resIds: formData.reimResId ? [`${formData.reimResId}`] : [], // 新增一行的时候，默认把当前的报销人给放进来。PS: 转换成字符串是因为number的匹配不到，这个没时间纠结了
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
      userExpenseNormalCreate: { formData },
    } = this.props;
    if (
      formData.reimType2 === 'PURCHASE' &&
      formData.reasonType === '04' &&
      formData.reasonId !== void 0 //此处是undefind 不用进行多租户改造
      // formData.reasonCode !== 'PU0000000000'
    ) {
      const { reimType2, reasonType, reasonId } = formData;
      const {
        reimType2: or2,
        reasonType: ort,
        reasonId: orId,
      } = prevProps.userExpenseNormalCreate.formData;

      if (reasonId !== orId) {
        this.fetchPhase(formData.reasonId); // 如果选择的是采购合同，则根据采购合同id获取 采购付款阶段数据
      }
    }
    // console.log(formData, prevProps.userExpenseNormalCreate.formData);
    const { reimType1, reimType2, reimType3, feeCode, expenseBuId } = formData;
    const {
      reimType1: or1,
      reimType2: or2,
      reimType3: or3,
      feeCode: oe,
    } = prevProps.userExpenseNormalCreate.formData;
    if (reimType1 && reimType2 && reimType3 && feeCode) {
      if (reimType1 !== or1 || reimType2 !== or2 || reimType3 !== or3 || feeCode !== oe) {
        this.fetchTmpl(reimType1, reimType2, reimType3, feeCode);
      }
    }

    const { reasonType, reasonId, reasonCode } = formData;
    const { reasonType: prt, reasonId: ori } = prevProps.userExpenseNormalCreate.formData;

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
      userExpenseNormalCreate: { formData, detailList },
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

  fetchPhase = contractId => {
    selectPayPlan(contractId).then(resp => {
      // 根据采购合同id获取采购付款阶段信息
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
        userExpenseNormalCreate: { formData },
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
  handleSave = isSubmit => () => {
    this.setState({
      isSubmit,
    });
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      userExpenseNormalCreate: { formData, detailList },
    } = this.props;
    // 获取url上的参数
    const param = fromQs();

    // console.log('formData, detailList', formData, detailList);
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

          // ---------强提示--------
          /**
           * 检查发票的开票日期：发票的开票日期不能早于业务发生日期（开票日期为空的，不做此限制）
           * 以下情况不做此项检查：①差旅费用报销：类型为“餐费”或“业务招待费”；②非差旅费用报销：科目为“误餐费”。
           */
          // dataIndex: 'feeType',
          let detailIndex;
          let invItem;
          const filterDetailList = detailList.filter(
            item => !accCodeList.includes(item.accCode) && !accCodeList.includes(item.accNo)
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

          /**
           * 餐费和业务招待费重复检查:
           * 非差旅费用报销中，如果同一天内有业务招待费和误餐费的，则检查结果=“餐费重复报销”
           */
          const accIdBusinessArr = detailList.filter(item => item.accCode === 'DPCST-5401-010');
          const accIdMealArr = detailList.filter(item => item.accCode === 'DPCST-5401-00502');
          if (accIdBusinessArr.length && accIdMealArr.length) {
            accIdBusinessArr.map(item => {
              accIdMealArr.map(ele => {
                if (item.feeDate === ele.feeDate) {
                  this.setState({
                    tipModalVisible: true,
                  });
                  // createMessage({ type: 'warn', description: '餐费业务招待费重复，请在备注中说明' });
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
              });
            });
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
    // if (param.id && !param.isCopy) {
    //   // 编辑保存
    //   validateFieldsAndScroll((error, values) => {

    //   });
    // } else {
    //   // 新建保存
    //   validateFieldsAndScroll((error, values) => {
    //     if (!error) {
    //         dispatch({
    //           type: `${DOMAIN}/create`,
    //           payload: {
    //             isSubmit,
    //           },
    //         });
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
      userExpenseNormalCreate: {
        formData = {},
        detailList,
        mode,
        phaseList,
        reimTmpl,
        feeCodeList,
      },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    const { tipModalVisible } = this.state;

    const param = fromQs();
    const title = '非差旅费用报销' + formData.id ? '编辑' : '新增';
    const preparing = loading.effects[param.id ? `${DOMAIN}/query` : `${DOMAIN}/init`];
    const submitting =
      loading.effects[param.id && !param.isCopy ? `${DOMAIN}/save` : `${DOMAIN}/create`];
    const noSubmitStatus = ['APPROVING', 'APPROVED', 'CLOSED'];
    const apprStatusBtn = noSubmitStatus.includes(formData.apprStatus);

    return (
      <PageHeaderWrapper title={param.isCopy ? '复制' : title}>
        <Card className="tw-card-rightLine">
          {fromQs().rewardFlag !== 'true' && (
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={preparing || submitting}
              onClick={this.handleSave(false)}
            >
              {formatMessage({ id: `misc.save`, desc: '保存' })}
            </Button>
          )}
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
                  <ReimTypeSelectNormal
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
                    initialValue: [
                      formData.reasonType,
                      formData.reasonId,
                      formData.reasonName,
                      formData.reasonCode,
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
                  <ReasonSelect
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

              <div className="tw-card-title">费用明细（请先选择报销类型和事由号）</div>

              <br />

              <ExpenseDetailList
                reimTmpl={reimTmpl.detailList}
                dispatch={dispatch}
                dataSource={detailList}
                reimResId={formData.reimResId}
                formData={formData}
                loading={false}
                domain={DOMAIN}
                // 报销单类型，用于判断发票时间
                expenseType="normal"
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
                  <NormalAccSelect resId={formData.reimResId} suppId={formData.supplierId} />
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
