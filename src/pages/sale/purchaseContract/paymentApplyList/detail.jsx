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
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';

import BillInfo from './detailModel/billInfo';
import BearDepInfo from './detailModel/bearDepInfo';
import PrePayInfo from './detailModel/payInfo';
import CashOutInfo from './detailModel/cashOutInfo';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { getUrl } from '@/utils/flowToRouter';

import { CONFIGSCENE, FLOW_NO, checkAmt, ARRY_NO, getPaymentFlowNo } from '../constConfig';

const DOMAIN = 'paymentApplyDetail';
const tabConf = [
  {
    key: 'prePayInfo',
    tab: '付款单信息',
  },
  {
    key: 'billInfo',
    tab: '单据信息',
  },
];

const contentListSelected = (form, operationKey) => {
  const { mode } = fromQs();
  const contentList = {
    prePayInfo: <PrePayInfo form={form} />,
    DEPARTMENT: <BearDepInfo form={form} mode={mode} />,
    WITHDRAW: <CashOutInfo form={form} />,
    billInfo: <BillInfo form={form} />,
  };
  return contentList[operationKey];
};
@connect(({ loading, paymentApplyDetail, dispatch, user }) => ({
  loading,
  paymentApplyDetail,
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
    const param = fromQs();
    const {
      dispatch,
      user: {
        user: {
          extInfo: { resId },
        },
      },
    } = this.props;
    // 获取自定义配置
    param.taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: param.taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });

    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { mode: param.mode, id: param.id },
      }).then(res => {
        if (res) {
          dispatch({
            type: `${DOMAIN}/getPageConfig`,
            payload: { pageNo: `PAYMENT_APPLY_EDIT:${CONFIGSCENE[res]}`, resId },
          });
        }
      });
    }
  }

  onOperationTabChange = key => {
    this.setState({
      operationKey: key,
    });
  };

  // 只保存不提交
  handleSaveNotSubmit = parmas => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      paymentApplyDetail,
    } = this.props;

    const { mode, scene, docNo } = fromQs();
    const { taskId, remark, result } = parmas;
    const { payDetailList, formData } = paymentApplyDetail;
    if (payDetailList.length !== 0) {
      if (formData.currPaymentAmt > 0) {
        // 批量提交付款记录
        dispatch({
          type: `${DOMAIN}/paymentSlipBatchOperation`,
        }).then(response => {
          if (response.ok) {
            dispatch({
              type: `${DOMAIN}/save`,
              payload: {
                scene: scene || parmas.scene,
              },
            }).then(resq => {
              if (resq !== '') {
                createMessage({ type: 'success', description: '保存成功' });
                closeThenGoto(
                  `/sale/purchaseContract/paymentApplyList/index?refresh=${Math.random()}`
                );
              } else {
                createMessage({ type: 'error', description: '保存失败' });
              }
            });
          } else {
            createMessage({ type: 'error', description: response.reason || '提交付款记录单失败' });
          }
        });
      } else {
        createMessage({ type: 'warn', description: '本次付款/核销金额必须要大于0' });
      }
    } else {
      createMessage({ type: 'warn', description: '付款明细不能为空' });
    }
  };

  // 保存
  handleSave = parmas => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      paymentApplyDetail,
    } = this.props;

    const { mode, scene, docNo } = fromQs();
    const { taskId, remark, result } = parmas;
    const { payDetailList, formData } = paymentApplyDetail;
    if (payDetailList.length !== 0) {
      if (formData.currPaymentAmt > 0) {
        // 批量提交付款记录
        dispatch({
          type: `${DOMAIN}/paymentSlipBatchOperation`,
        }).then(response => {
          if (response.ok) {
            dispatch({
              type: `${DOMAIN}/save`,
              payload: {
                scene: scene || parmas.scene,
              },
            }).then(res => {
              if (res) {
                if (taskId) {
                  dispatch({
                    type: `${DOMAIN}/reSubmit`,
                    payload: {
                      id: res,
                      flow: {
                        taskId,
                        remark,
                        result,
                      },
                    },
                  }).then(resq => {
                    if (resq.ok) {
                      createMessage({ type: 'success', description: '保存成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    } else {
                      createMessage({ type: 'error', description: '保存失败' });
                    }
                  });
                }
              }
            });
          } else {
            createMessage({ type: 'error', description: response.reason || '提交付款记录单失败' });
          }
        });
      } else {
        createMessage({ type: 'warn', description: '本次付款/核销金额必须要大于0' });
      }
    } else {
      createMessage({ type: 'warn', description: '付款明细不能为空' });
    }
  };

  // 提交
  handleSubmit = parmas => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      paymentApplyDetail,
    } = this.props;
    const { mode, scene, docNo } = fromQs();
    const { payDetailList, formData } = paymentApplyDetail;
    const { taskId, remark, result } = parmas;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // 付款明细不能为空且本次付款/核销金额必须要大于0
        if (payDetailList.length !== 0) {
          if (formData.currPaymentAmt > 0) {
            dispatch({
              type: `${DOMAIN}/save`,
              payload: {
                scene: scene || parmas.scene,
              },
            }).then(res => {
              if (res) {
                if (taskId) {
                  dispatch({
                    type: `${DOMAIN}/reSubmit`,
                    payload: {
                      id: res,
                      flow: {
                        taskId,
                        remark,
                        result,
                      },
                    },
                  }).then(resq => {
                    if (resq.ok) {
                      createMessage({ type: 'success', description: '提交成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    } else {
                      createMessage({ type: 'error', description: '提交失败' });
                    }
                  });
                } else {
                  dispatch({
                    type: `${DOMAIN}/submit`,
                    payload: { id: res },
                  }).then(resq => {
                    if (resq.ok) {
                      createMessage({ type: 'success', description: '提交成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    } else {
                      createMessage({ type: 'error', description: resq.reason || '提交失败' });
                    }
                  });
                }
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
    const { form, paymentApplyDetail, dispatch, loading } = this.props;
    const { fieldsConfig, formData, flowForm, pageConfig } = paymentApplyDetail;
    const { taskKey } = fieldsConfig;
    const { validateFieldsAndScroll } = form;
    const param = fromQs();
    const { taskId } = param;

    // 获取工作流组件相关数据
    const { id, scene, paymentApplicationType } = formData;
    const docId = id;
    const procDefKey = getPaymentFlowNo({ scene, paymentApplicationType });

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
      <PageHeaderWrapper title="付款申请单审批">
        <BpmWrapper
          fields={formData}
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          scope={procDefKey}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, formData: formD, bpmForm }) => {
            const { key } = operation;
            const payload = {
              taskId: param.taskId,
              remark: bpmForm.remark,
            };
            if (key === 'FLOW_PASS') {
              // 相关bu处理人
              if (taskKey.indexOf('ACCOUNTANCY') !== -1) {
                payload.result = 'APPROVED';
                payload.scene = formData.scene;
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    if (checkAmt(paymentApplyDetail, 'detail')) {
                      this.handleSave(payload);
                    }
                    return Promise.resolve(false);
                  }
                  return Promise.resolve(false);
                });
                return Promise.resolve(false);
              }
              return Promise.resolve(true);
            }

            if (key === 'FLOW_RETURN') {
              return Promise.resolve(true);
            }

            if (key === 'FLOW_COMMIT') {
              payload.result = 'APPROVED';
              payload.scene = formData.scene;
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  if (checkAmt(paymentApplyDetail, 'detail')) {
                    this.handleSubmit(payload);
                  }
                }
              });
              return Promise.resolve(false);
            }

            // add by sheldor at 2020/8/5:审批驳回后增加单据保存功能
            if (key === 'FLOW_SAVE') {
              payload.scene = formData.scene;
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  if (checkAmt(paymentApplyDetail, 'detail')) {
                    this.handleSaveNotSubmit(payload);
                  }
                }
              });
              return Promise.resolve(false);
            }

            return Promise.resolve(false);
          }}
        >
          <Spin
            spinning={
              loading.effects[`${DOMAIN}/query`] && loading.effects[`${DOMAIN}/getPageConfig`]
            }
          >
            <Card
              className="tw-card-multiTab"
              bordered={false}
              activeTabKey={operationKey}
              tabList={tabConf}
              onTabChange={this.onOperationTabChange}
            >
              {contentListSelected(form, operationKey)}
            </Card>
          </Spin>
        </BpmWrapper>
        {!taskId && docId && procDefKey && <BpmConnection source={[{ docId, procDefKey }]} />}
      </PageHeaderWrapper>
    );
  }
}

export default Edit;
