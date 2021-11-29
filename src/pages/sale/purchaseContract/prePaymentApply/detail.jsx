/* eslint-disable consistent-return */
/* eslint-disable no-else-return */
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
import { getUrl } from '@/utils/flowToRouter';

import BillInfo from './detailModel/billInfo';
import PrePayInfo from './detailModel/prePayInfo';
import BearDepInfo from './detailModel/bearDepInfo';
import { checkAmt, ARRY_NO, FLOW_NO, CONFIGSCENE, getPaymentFlowNo } from '../constConfig';
import { mountToTab, closeThenGoto, closeTab } from '@/layouts/routerControl';

const DOMAIN = 'prePaymentApplyDetail';

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

const contentListSelected = (form, operationKey) => {
  const { mode } = fromQs();
  const contentList = {
    prePayInfo: <PrePayInfo form={form} />,
    DEPARTMENT: <BearDepInfo form={form} mode={mode} />,
    billInfo: <BillInfo form={form} />,
  };
  return contentList[operationKey];
};

@connect(({ loading, prePaymentApplyDetail, dispatch, user }) => ({
  loading,
  prePaymentApplyDetail,
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
    const {
      dispatch,
      user: {
        user: {
          extInfo: { resId },
        },
      },
    } = this.props;
    const param = fromQs();
    // 获取自定义配置
    param.taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: param.taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {
              taskKey: '',
            },
          },
        });

    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: {
          id: param.id,
          mode: param.mode,
        },
      }).then(res => {
        console.info('haha+' + res);
        dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: { pageNo: `PAYMENT_APPLY_EDIT:${CONFIGSCENE[res]}`, resId },
        });
      });
    }
  }

  onOperationTabChange = key => {
    this.setState({
      operationKey: key,
    });
  };

  // 保存
  handleSave = parmas => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      prePaymentApplyDetail,
    } = this.props;
    const { taskId, remark, result } = parmas;
    const { payDetailList, formData } = prePaymentApplyDetail;
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
                scene: parmas.scene, // 预付款类型   商机点击过来 scene: 3
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
      prePaymentApplyDetail,
    } = this.props;
    const { taskId, remark, result } = parmas;
    const { payDetailList, formData } = prePaymentApplyDetail;
    if (payDetailList.length !== 0) {
      if (formData.currPaymentAmt > 0) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            scene: parmas.scene,
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
                  createMessage({ type: 'error', description: '提交失败' });
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
  };

  render() {
    const { operationKey } = this.state;
    const { loading, form, prePaymentApplyDetail, dispatch } = this.props;
    const { validateFieldsAndScroll } = form;
    const { formData, flowForm, fieldsConfig, pageConfig } = prePaymentApplyDetail;
    const { taskKey } = fieldsConfig;
    const param = fromQs();
    const { taskId, prcId } = param;

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
      <PageHeaderWrapper title="预付款申请审批">
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
            // 通过
            if (key === 'FLOW_PASS') {
              // 相关bu处理人
              if (taskKey.indexOf('ACCOUNTANCY') !== -1) {
                payload.result = 'APPROVED';
                payload.scene = formData.scene;
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    // 提交前的校验
                    if (checkAmt(prePaymentApplyDetail, 'detail')) {
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
            // 退回
            if (key === 'FLOW_RETURN') {
              return Promise.resolve(true);
            }
            // 提交
            if (key === 'FLOW_COMMIT') {
              payload.result = 'APPROVED';
              payload.scene = formData.scene;
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  // 提交前的校验
                  if (checkAmt(prePaymentApplyDetail)) {
                    this.handleSubmit(payload);
                  }
                  return Promise.resolve(false);
                }
                return Promise.resolve(false);
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
