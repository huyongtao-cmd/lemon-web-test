/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable prefer-const */
import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Card, Button, Spin, Form } from 'antd';
import Title from '@/components/layout/Title';
import { connect } from 'dva';
import moment from 'moment';
import math from 'mathjs';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { add as mathAdd, checkIfNumber, div, mul, sub } from '@/utils/mathUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { isEmpty, takeLast, add, isNil, gte, lte } from 'ramda';
import { toIsoDate } from '@/utils/timeUtils';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';

import BillInfo from './editModel/billInfo';
import PrePayInfo from './editModel/prePayInfo';
import BearDepInfo from './editModel/bearDepInfo';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';

import { FLOW_NO, CONFIGSCENE, checkAmt, ARRY_NO, getPaymentFlowNo } from '../constConfig';

const DOMAIN = 'prePaymentApplyEdit';

const tabConf = [
  {
    key: 'prePayInfo',
    tab: '预付款信息',
  },
  {
    key: 'billInfo',
    tab: '单据信息',
  },
];

const contentListSelected = (form, operationKey, mode) => {
  const contentList = {
    prePayInfo: <PrePayInfo form={form} mode={mode} />,
    DEPARTMENT: <BearDepInfo form={form} mode={mode} />,
    billInfo: <BillInfo form={form} mode={mode} />,
  };
  return contentList[operationKey];
};
@connect(({ loading, prePaymentApplyEdit, dispatch, user }) => ({
  loading,
  prePaymentApplyEdit,
  dispatch,
  user,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (name === 'signDate' || name === 'activateDate') {
      // antD 时间组件返回的是moment对象 转成字符串提交
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: formatDT(value) },
      });
    } else {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class Edit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operationKey: 'prePayInfo',
    };
  }

  componentDidMount() {
    const { mode, id, scene = '14', docNo } = fromQs();
    const {
      dispatch,
      user: {
        user: {
          extInfo: { resId },
        },
      },
    } = this.props;
    // 获取自定义配置
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: `PAYMENT_APPLY_EDIT:${CONFIGSCENE[scene]}`, resId, mode },
    }).then(res => {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { mode, id, docNo, scene },
      });
    });
  }

  onOperationTabChange = key => {
    this.setState({
      operationKey: key,
    });
  };

  // 保存
  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      prePaymentApplyEdit,
    } = this.props;
    const { mode, scene = '14' } = fromQs();
    const { payDetailList, formData } = prePaymentApplyEdit;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (payDetailList.length !== 0) {
          if (formData.currPaymentAmt > 0) {
            dispatch({
              type: `${DOMAIN}/save`,
              payload: {
                scene, // 预付款类型   商机点击过来 scene: 3
              },
            }).then(resq => {
              if (resq) {
                createMessage({ type: 'success', description: '保存成功' });
                closeThenGoto(
                  `/sale/purchaseContract/paymentApplyList/index?refresh=${Math.random()}`
                );
              } else {
                createMessage({ type: 'error', description: '保存失败' });
              }
            });
          } else {
            createMessage({ type: 'warn', description: '本次付款/核销金额必须要大于0' });
          }
        } else {
          createMessage({ type: 'warn', description: '付款明细不能为空' });
        }
      }
    });
  };

  // 提交
  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      prePaymentApplyEdit,
    } = this.props;
    const { scene = '14' } = fromQs();
    const { payDetailList, formData } = prePaymentApplyEdit;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (payDetailList.length !== 0) {
          if (formData.currPaymentAmt > 0) {
            dispatch({
              type: `${DOMAIN}/save`,
              payload: {
                scene,
              },
            }).then(res => {
              if (res) {
                // 提交前的校验
                if (checkAmt(prePaymentApplyEdit)) {
                  dispatch({
                    type: `${DOMAIN}/submit`,
                    payload: { id: res },
                  }).then(resq => {
                    if (resq.ok) {
                      createMessage({ type: 'success', description: '提交成功' });
                      closeThenGoto(
                        `/sale/purchaseContract/paymentApplyList/index?refresh=${Math.random()}`
                      );
                    } else {
                      createMessage({ type: 'error', description: resq.reason || '提交失败' });
                    }
                  });
                }
              } else {
                createMessage({ type: 'error', description: res.reason || '提交失败' });
              }
            });
          } else {
            createMessage({ type: 'warn', description: '本次付款/核销金额必须要大于0' });
          }
        } else {
          createMessage({ type: 'warn', description: '付款明细不能为空' });
        }
      }
    });
  };

  render() {
    const { operationKey } = this.state;
    const { form, loading, prePaymentApplyEdit } = this.props;
    const { formData, pageConfig } = prePaymentApplyEdit;
    const { mode } = fromQs();

    // 获取工作流组件相关数据
    let docId;
    let procDefKey;
    const { id, scene, paymentApplicationType } = formData;
    if (mode === 'view') {
      docId = id;
      procDefKey = getPaymentFlowNo({ scene, paymentApplicationType });
    }

    let obj = {};
    if (pageConfig && pageConfig.pageTabViews) {
      pageConfig.pageTabViews.map(item => {
        obj[item.tabKey] = item.visibleFlag;
      });
      if (obj.DEPARTMENT === 1) {
        if (tabConf.filter(item => item.key === 'DEPARTMENT').length === 0) {
          tabConf.push({
            key: 'DEPARTMENT',
            tab: '费用承担部门',
          });
        }
      }
      if (obj.WITHDRAW === 1) {
        if (tabConf.filter(item => item.key === 'WITHDRAW').length === 0) {
          tabConf.push({
            key: 'WITHDRAW',
            tab: '提现申请',
          });
        }
      }
    }
    return (
      <PageHeaderWrapper title="预付款申请编辑">
        <Spin
          spinning={
            loading.effects[`${DOMAIN}/query`] && loading.effects[`${DOMAIN}/getPageConfig`]
          }
        >
          {mode !== 'view' && (
            <Card className="tw-card-rightLine">
              <Button
                className="tw-btn-primary"
                icon="save"
                size="large"
                disabled={false}
                loading={loading.effects[`${DOMAIN}/save`]}
                onClick={this.handleSave}
              >
                <Title id="misc.save" defaultMessage="保存" />
              </Button>
              <Button
                className="tw-btn-primary"
                icon="save"
                size="large"
                loading={loading.effects[`${DOMAIN}/submit`]}
                disabled={false}
                onClick={this.handleSubmit}
              >
                <Title id="misc.submit" defaultMessage="提交" />
              </Button>
            </Card>
          )}
          <Card
            className="tw-card-multiTab"
            bordered={false}
            activeTabKey={operationKey}
            tabList={tabConf}
            onTabChange={this.onOperationTabChange}
          >
            {contentListSelected(form, operationKey, mode)}
          </Card>
          {mode === 'view' &&
            docId &&
            procDefKey && <BpmConnection source={[{ docId, procDefKey }]} />}
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default Edit;
