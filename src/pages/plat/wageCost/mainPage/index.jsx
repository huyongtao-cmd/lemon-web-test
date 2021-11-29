import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Card, Button, Spin } from 'antd';
import Title from '@/components/layout/Title';
import { connect } from 'dva';
import moment from 'moment';
import math from 'mathjs';
import tabConf from '../common/tabPageConf';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { add, checkIfNumber, div, mul, sub } from '@/utils/mathUtils';

import WagePageMainDetail from './detail/detail';
import PayObj from './payObj/payObj';
import BU from './BU/BU';
import { mountToTab } from '@/layouts/routerControl';

const contentList = {
  detail: <WagePageMainDetail />,
  payObj: <PayObj />,
  BU: <BU />,
};
function to2(num) {
  if (num) {
    return num.toFixed(2);
  }
  return '';
}
const DOMAIN = 'wageCostMainPage';
@connect(({ loading, wageCostMainPage }) => ({
  loading,
  ...wageCostMainPage,
}))
@mountToTab()
class WageCostMainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operationkey: 'detail',
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    if (param.opMode === 'UPDATE') {
      dispatch({
        type: `${DOMAIN}/getViewItem`,
        payload: {
          id: param.id,
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/clean`,
      });
    }
  }

  onOperationTabChange = key => {
    this.setState({
      operationkey: key,
    });
  };

  // 保存时候的校验
  checkList = detailList => {
    let flag = false;
    detailList.forEach((item, index) => {
      const tempItem = item;
      tempItem.tempobj = {};
      // 判断 .应付工资=基本工资+岗位津贴+当月应发绩效工资+出差补贴+当量工资+加项-病假-减项
      const grossPayArrA = [
        'bscSalary',
        'allowanceSalary',
        'performanceWages',
        'travelSubsidies',
        'eqvaSalary',
        'addition',
      ];
      const grossPayArrB = ['sickLeave', 'deduction'];
      if (
        to2(tempItem.grossPay) !==
        to2(
          sub(
            grossPayArrA.reduce((a, b) => add(a || 0, tempItem[b] || 0), 0),
            grossPayArrB.reduce((a, b) => add(a || 0, tempItem[b] || 0), 0)
          )
        )
        // tempItem.bscSalary +
        //   tempItem.allowanceSalary +
        //   tempItem.performanceWages +
        //   tempItem.travelSubsidies +
        //   tempItem.eqvaSalary +
        //   tempItem.addition -
        //   (tempItem.sickLeave + tempItem.deduction)
      ) {
        tempItem.tempobj.grossPay = true;
        flag = true;
      }

      // 判断4.实发工资=应付工资-个人社保-个人公积金-个调税
      const netPayArr = ['perSocSec', 'perAccFund', 'perIncTax'];
      if (
        to2(tempItem.netPay) !==
        to2(netPayArr.reduce((a, b) => sub(a || 0, tempItem[b] || 0), tempItem.grossPay))
        // tempItem.grossPay - tempItem.perSocSec - tempItem.perAccFund - tempItem.perIncTax
      ) {
        tempItem.tempobj.netPay = true;
        flag = true;
      }

      // 公司福利保险合计=公司社保+公司公积金+残保金等+服务费
      const corBenefitsArr = ['corSocSec', 'corAccFund', 'disInsFund', 'serviceCharge'];
      if (
        to2(tempItem.corBenefits) !==
        to2(corBenefitsArr.reduce((a, b) => add(a || 0, tempItem[b] || 0), 0))
        // tempItem.corSocSec + tempItem.corAccFund + tempItem.disInsFund + tempItem.serviceCharge
      ) {
        tempItem.tempobj.corBenefits = true;
        flag = true;
      }
      // 公司成本合计=应付工资+公司福利保险合计+外包1+外包2+外包3+外包4+外包5
      const corCostArr = [
        'grossPay',
        'corBenefits',
        'outSupplier1',
        'outSupplier2',
        'outSupplier3',
        'outSupplier4',
        'outSupplier5',
      ];
      if (
        to2(tempItem.corCost) !== to2(corCostArr.reduce((a, b) => add(a || 0, tempItem[b] || 0), 0))
        // tempItem.grossPay +
        //   tempItem.corBenefits +
        //   tempItem.outSupplier1 +
        //   tempItem.outSupplier2 +
        //   tempItem.outSupplier3 +
        //   tempItem.outSupplier4 +
        //   tempItem.outSupplier5
      ) {
        tempItem.tempobj.corCost = true;
        flag = true;
      }
      // 社保个人小计=个人养保+个人医保+个人失保
      const perSubInsArr = ['perEndIns', 'perMedIns', 'perUneIns'];
      if (
        to2(tempItem.perSubIns) !==
        to2(perSubInsArr.reduce((a, b) => add(a || 0, tempItem[b] || 0), 0))
        // tempItem.perEndIns + tempItem.perMedIns + tempItem.perUneIns
      ) {
        tempItem.tempobj.perSubIns = true;
        flag = true;
      }
      // 公司社保小计=公司养保+公司医保+公司失保+公司工伤+公司生育+异地大病医疗
      const corSubInsArr = [
        'corEndIns',
        'corMedIns',
        'corUneIns',
        'corInjIns',
        'corMatIns',
        'corDifMedIns',
      ];
      if (
        to2(tempItem.corSubIns) !==
        to2(corSubInsArr.reduce((a, b) => add(a || 0, tempItem[b] || 0), 0))
        // tempItem.corEndIns +
        //   tempItem.corMedIns +
        //   tempItem.corUneIns +
        //   tempItem.corInjIns +
        //   tempItem.corMatIns +
        //   tempItem.corDifMedIns
      ) {
        tempItem.tempobj.corSubIns = true;
        flag = true;
      }
    });
    return {
      flag,
      detailList,
    };
  };

  // 保存
  handelSave = () => {
    const {
      dispatch,
      detailList,
      detailForm,
      payObjList,
      BUList,
      formRefs,
      mainDataId,
      payObjIsSave,
      BUIsSave,
    } = this.props;
    const { operationkey } = this.state;
    const param = fromQs();
    // 不同页面保存不同
    switch (operationkey) {
      case 'detail':
        formRefs.validateFields((err, values) => {
          if (!err) {
            // 保存form表单数据
            // eslint-disable-next-line no-param-reassign
            values.createTime = values.createTime
              ? moment(values.createTime).format('YYYY-MM-DDTHH:mm:ss')
              : '';
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                detailForm: values,
              },
            });
            // 校验表单内容
            const repObj = this.checkList(detailList);
            // 校验有问题
            if (repObj.flag || repObj.detailList.length === 0) {
              createMessage({ type: 'error', description: '校验失败,请检查内容' });
              dispatch({
                type: `${DOMAIN}/updateDetailList`,
                payload: {
                  detailList: repObj.detailList,
                },
              });
            } else {
              // 删除之前自定义的临时对象
              detailList.forEach((items, index) => {
                const temp = items;
                delete temp.tempobj;
              });
              if (param.opMode === 'UPDATE' || mainDataId) {
                dispatch({
                  type: `${DOMAIN}/detailUpdate`,
                  payload: {
                    detailView: detailList,
                    masterView: { ...detailForm, ...values },
                  },
                });
              } else {
                dispatch({
                  type: `${DOMAIN}/detailSave`,
                  payload: {
                    detailView: detailList,
                    masterView: values,
                  },
                });
              }
            }
          }
        });
        break;
      case 'payObj':
        // if (param.opMode === 'UPDATE' && payObjIsSave) {
        //   dispatch({
        //     type: `${DOMAIN}/payObjUpdate`,
        //   });
        // } else {
        //   dispatch({
        //     type: `${DOMAIN}/payObjSave`,
        //   });
        // }
        dispatch({
          type: `${DOMAIN}/payObjSave`,
        });
        break;
      case 'BU':
        // if (param.opMode === 'UPDATE' && BUIsSave) {
        //   dispatch({
        //     type: `${DOMAIN}/BUUpdate`,
        //   });
        // } else {
        //   dispatch({
        //     type: `${DOMAIN}/BUSave`,
        //   });
        // }
        dispatch({
          type: `${DOMAIN}/BUSave`,
        });
        break;
      default:
    }
  };

  // 提交
  handelSubmit = () => {
    const {
      dispatch,
      detailList,
      payObjList,
      BUList,
      mainDataId,
      payObjIsSave,
      BUIsSave,
    } = this.props;
    const param = fromQs();
    // 判断提交条件
    // 必须保存过一次，而且明细数据/付款对象/BU成本不能小于一条数据
    if (
      !param.taskId &&
      mainDataId &&
      payObjIsSave &&
      BUIsSave &&
      detailList.length > 0 &&
      payObjList.length > 0 &&
      BUList.length > 0
    ) {
      dispatch({
        type: `${DOMAIN}/submit`,
      });
    } else if (param.taskId) {
      dispatch({
        type: `${DOMAIN}/retryFlowPush`,
        payload: {
          id: param.id,
          boby: {
            result: 'APPLIED',
            remark: param.remark,
            taskId: param.taskId,
          },
        },
      });
    } else {
      createMessage({ type: 'error', description: '无法提交未保存的数据' });
    }
  };

  render() {
    console.log('wageCostMainPage', this.props);
    const { operationkey } = this.state;
    const { loading } = this.props;
    return (
      <PageHeaderWrapper title="薪资成本管理">
        <Spin
          spinning={
            loading.effects[`${DOMAIN}/detailSave`] ||
            loading.effects[`${DOMAIN}/detailUpdate`] ||
            loading.effects[`${DOMAIN}/submit`] ||
            loading.effects[`${DOMAIN}/retryFlowPush`] ||
            loading.effects[`${DOMAIN}/payObjSave`] ||
            loading.effects[`${DOMAIN}/payObjCreateData`] ||
            loading.effects[`${DOMAIN}/payObjUpdate`] ||
            loading.effects[`${DOMAIN}/BUSave`] ||
            loading.effects[`${DOMAIN}/BUCreateData`] ||
            loading.effects[`${DOMAIN}/BUUpdate`] ||
            loading.effects[`${DOMAIN}/getViewItem`] ||
            false
          }
        >
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={false}
              onClick={this.handelSave}
            >
              <Title id="misc.save" defaultMessage="保存" />
            </Button>
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={false}
              onClick={this.handelSubmit}
            >
              <Title id="misc.submit" defaultMessage="提交" />
            </Button>
          </Card>
          <Card
            className="tw-card-multiTab"
            bordered={false}
            activeTabKey={operationkey}
            tabList={tabConf}
            onTabChange={this.onOperationTabChange}
          >
            {contentList[operationkey]}
          </Card>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default WageCostMainPage;
