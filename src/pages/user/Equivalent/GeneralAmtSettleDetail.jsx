import React, { PureComponent } from 'react';
import { Button, Card, Input, Select, Form, Divider, Col, InputNumber } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';

import { fromQs } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';

const DOMAIN = 'generalAmtSettleDetail';
const { Description } = DescriptionList;
const SUBMIT_KEY = 'ACC_A50_01_SUBMIT_i';

@connect(({ loading, generalAmtSettleDetail, dispatch }) => ({
  loading,
  ...generalAmtSettleDetail,
  dispatch,
}))
@mountToTab()
class GeneralAmtSettleCreate extends PureComponent {
  componentDidMount() {
    const { dispatch, contractList } = this.props;
    const param = fromQs();
    if (param.id) {
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: { id: param.id },
      });
    }
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
  }

  handleTransfer = id => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/transfer`,
      payload: { id },
    });
  };

  render() {
    const { loading, formData, dispatch, fieldsConfig, flowForm } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/queryDetail`];

    const sideStyle = { textAlign: 'center', fontWeight: 'bold' };

    const { taskId, id } = fromQs();

    return (
      <PageHeaderWrapper title="泛用金额结算">
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, formData: formD, bpmForm }) => {
            const { taskKey } = fieldsConfig;
            // 提交节点-修改按钮
            if (
              taskKey === SUBMIT_KEY &&
              (formData.apprStatus === 'REJECTED' || formData.apprStatus === 'WITHDRAW')
            ) {
              closeThenGoto(
                `/plat/intelStl/generalAmtSettleCreate?id=${formData.id}&apprId=${taskId}&remark=${
                  bpmForm.remark
                }`
              );
              return Promise.resolve(false);
            }
            return Promise.resolve(true);
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              type="primary"
              icon="save"
              size="large"
              disabled={disabledBtn}
              onClick={() => this.handleTransfer(formData.id)}
            >
              过账
            </Button>
            <Button
              className="tw-btn-primary"
              type="primary"
              icon="save"
              size="large"
              disabled={disabledBtn}
              onClick={() => {
                dispatch({
                  type: `${DOMAIN}/cancel`,
                  payload: { id: formData.id },
                });
              }}
            >
              取消过账
            </Button>
          </Card>

          <Card
            title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
            bordered={false}
            className="tw-card-adjust"
          >
            <DescriptionList title="申请信息" size="large" col={2} hasSeparator>
              <Description term="单据创建人">{formData.applyResName}</Description>
              <Description term="结算单号">{formData.settleNo}</Description>
              <Description term="单据创建类型">{formData.createTypeDesc}</Description>
              <Description term="申请日期">{formData.applyDate}</Description>
              <Description term="状态">{formData.settleStatusDesc}</Description>
            </DescriptionList>

            <DescriptionList title="结算相关信息" size="large" col={2} hasSeparator>
              <Description term="业务类型">{formData.busiTypeDesc}</Description>
              <Description term="相关业务单据号">{formData.relevNo}</Description>
              <Description term="相关子合同">{formData.contractName}</Description>
              <Description term="收款号">{formData.recvplanName}</Description>
              <Description term="相关项目">{formData.projName}</Description>
              <Description term="交易总额">{formData.approveSettleAmt}</Description>
              <Description term="交易日期">{formData.settleDate}</Description>
              <Description term="币种">{formData.currCodeDesc}</Description>
              <Description term="财务期间">{formData.finPeriodName}</Description>
            </DescriptionList>

            <DescriptionList title="交易方信息" size="large" col={2} hasSeparator>
              <div
                className="ant-form-item ant-col-xs-24 ant-col-sm-8"
                style={{ ...sideStyle, textAlign: 'center' }}
              >
                支出方
              </div>
              <div className="ant-form-item ant-col-xs-24 ant-col-sm-4" style={sideStyle}>
                --------&gt;
              </div>
              <div
                className="ant-form-item ant-col-xs-24 ant-col-sm-12"
                style={{ ...sideStyle, textAlign: 'center' }}
              >
                收入方
              </div>
              <Description term="支出账户">{formData.outAccountName}</Description>
              <Description term="收入账户">{formData.inAccountName}</Description>
              <Description term="费用码">{formData.outFeeCodeDesc}</Description>
              <Description term="费用码">{formData.inFeeCodeDesc}</Description>
              <Description term="财务科目">{formData.outAccDesc}</Description>
              <Description term="财务科目">{formData.inAccDesc}</Description>
            </DescriptionList>
          </Card>
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default GeneralAmtSettleCreate;
