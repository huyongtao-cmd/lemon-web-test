import React, { Component } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import classnames from 'classnames';
import { Card, Button, Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { FileManagerEnhance } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';

const { Description } = DescriptionList;
const DOMAIN = 'prePayMgmtPreview';

@connect(({ prePayMgmtPreview, user, loading }) => ({ prePayMgmtPreview, user, loading }))
@mountToTab()
class PrePayMgmtPreview extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: id });
    taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: taskId,
        })
      : dispatch({ type: `${DOMAIN}/cleanFlow` });
  }

  render() {
    const {
      dispatch,
      loading,
      prePayMgmtPreview: { formData, fieldsConfig: config, flowForm },
    } = this.props;

    const { id, taskId, back } = fromQs();

    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={config}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              size="large"
              onClick={() => {
                router.push(`/plat/purchPay/advanceVerification/List?id=${id}`);
              }}
            >
              核销记录
            </Button>
            {fromQs().id && (
              <a
                href={`/print?scope=ACC_A29&id=${fromQs().id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: 'auto', marginRight: 8 }}
              >
                <Tooltip title="打印单据">
                  <Button
                    className={classnames('tw-btn-default')}
                    type="dashed"
                    icon="printer"
                    size="large"
                  />
                </Tooltip>
              </a>
            )}
            <Button
              className={classnames('tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() => closeThenGoto('/plat/purchPay/prePayMgmt')}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
          <Card
            className="tw-card-adjust"
            bordered={false}
            title={<Title icon="profile" text="预付款申请详情" />}
          >
            <DescriptionList size="large" col={2}>
              <Description term="单据号">{formData.applyNo}</Description>
              <Description term="单据名称">{formData.applyName}</Description>
              <Description term="相关特殊费用申请">{formData.feeApplyName}</Description>
              <Description term="申请人">{formData.applyResName}</Description>
              <Description term="申请人Base BU">{formData.applyBuName}</Description>
              <Description term="相关采购合同">{formData.pcontractName}</Description>
              <Description term="是否项目">{formData.applyTypeDesc}</Description>
              <Description term="事由号">{formData.reasonName}</Description>
              <Description term="业务类型">{formData.prepayTypeDesc}</Description>
              <Description term="费用承担BU">{formData.expenseBuName}</Description>
              <Description term="供应商">{formData.supplierName}</Description>
              <Description term="付款户名">{formData.holderName}</Description>
              <Description term="收款账户">{formData.accountNo}</Description>
              <Description term="收款银行">{formData.bankName}</Description>
              <Description term="预付款总额">{formData.adpayAmt}</Description>
              <Description term="预计核销日期">{formData.adpayHxDate}</Description>
              <Description term="申请日期">{formData.applyDate}</Description>
              {formData.applyStatus === 'APPROVED' && (
                <Description term="核销状态">{formData.processStateName}</Description>
              )}
              {formData.applyStatus === 'APPROVED' && (
                <Description term="是否延期核销">{formData.isHxDelayName}</Description>
              )}

              <Description term="申请状态">{formData.applyStatusDesc}</Description>
              <Description term="相关附件">
                <FileManagerEnhance
                  api="/api/worth/v1/adpay/sfs/token"
                  dataKey={formData.id}
                  listType="text"
                  preview
                />
              </Description>
              <Description term="费用所属公司">{formData.feeExtendOuName}</Description>
              <Description term="备注说明">{formData.remark}</Description>
            </DescriptionList>
          </Card>
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'ACC_A29' }]} />}
        </BpmWrapper>
        <br />
        <div style={{ marginTop: 60 }} />
      </PageHeaderWrapper>
    );
  }
}

export default PrePayMgmtPreview;
