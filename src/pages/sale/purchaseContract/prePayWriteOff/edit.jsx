/* eslint-disable array-callback-return */
/* eslint-disable prefer-const */
/* eslint-disable no-undef */
/* eslint-disable react/jsx-filename-extension */
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

// import PayRecord from './model/payRecord';
import BillInfo from './editModel/billInfo';
import PrePayInfo from './editModel/prePayInfo';
import BearDepInfo from './editModel/bearDepInfo';
import { FLOW_NO, CONFIGSCENE, checkAmt, ARRY_NO, getPaymentFlowNo } from '../constConfig';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';

const DOMAIN = 'prePayWriteOffEdit';

const tabConf = [
  {
    key: 'prePayInfo',
    tab: '预付款核销信息',
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
@connect(({ loading, prePayWriteOffEdit, dispatch, user }) => ({
  loading,
  prePayWriteOffEdit,
  dispatch,
  user,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];

    // console.log('>>>>', name, value);

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
    const { preId, mode, id } = fromQs();
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
      payload: { pageNo: 'PAYMENT_APPLY_EDIT:WRITTENOFF', resId, mode },
    }).then(res => {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { preId, mode, id },
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
      prePayWriteOffEdit,
    } = this.props;
    const { mode } = fromQs();
    const { payDetailList, formData } = prePayWriteOffEdit;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (payDetailList.length !== 0) {
          if (formData.currPaymentAmt > 0) {
            dispatch({
              type: `${DOMAIN}/save`,
              payload: {
                scene: 15, // 预付款核销类型
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
      prePayWriteOffEdit,
    } = this.props;
    const { payDetailList, formData } = prePayWriteOffEdit;
    const { mode } = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // 付款明细不能为空且本次付款/核销金额必须要大于0
        if (payDetailList.length !== 0) {
          if (formData.currPaymentAmt > 0) {
            if (checkAmt(prePayWriteOffEdit)) {
              dispatch({
                type: `${DOMAIN}/save`,
                payload: {
                  scene: 15, // 预付款核销
                },
              }).then(res => {
                if (res) {
                  // 提交前的校验
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
                } else {
                  createMessage({ type: 'error', description: res.reason || '提交失败' });
                }
              });
            }
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
    const { form, prePayWriteOffEdit, loading } = this.props;
    const { formData, pageConfig } = prePayWriteOffEdit;
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
      <PageHeaderWrapper title="预付款核销编辑">
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
                loading={loading.effects[`${DOMAIN}/save`]}
                disabled={false}
                onClick={this.handleSave}
              >
                <Title id="misc.save" defaultMessage="保存" />
              </Button>
              <Button
                className="tw-btn-primary"
                icon="save"
                size="large"
                disabled={false}
                loading={loading.effects[`${DOMAIN}/submit`]}
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
