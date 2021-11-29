import React, { PureComponent } from 'react';
import moment from 'moment';
import classnames from 'classnames';
import { Button, Card } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import { FileManagerEnhance } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';

const { Description } = DescriptionList;

const DOMAIN = 'platComputerApplyDetail';

const TASK_BUY_COMPUTER_SUBMIT = 'ACC_A26_01_BUY_COMPUTER_SUBMIT_i';

@connect(({ loading, platComputerApplyDetail, dispatch }) => ({
  loading,
  ...platComputerApplyDetail,
  dispatch,
}))
@mountToTab()
class ComputerApplyDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    param &&
      param.taskId &&
      dispatch({
        type: `${DOMAIN}/fetchConfig`,
        payload: param.taskId,
      });
    dispatch({
      type: `${DOMAIN}/query`,
      payload: param,
    });
  }

  render() {
    const { loading, dispatch, formData, fieldsConfig, flowForm } = this.props;
    const { taskId, id } = fromQs();
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    return (
      <PageHeaderWrapper title="自购电脑申请详情">
        <BpmWrapper
          fields={[]}
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
            const { key } = operation;
            if (taskKey === TASK_BUY_COMPUTER_SUBMIT) {
              const { remark } = bpmForm;
              closeThenGoto(
                `/plat/expense/computer/apply/edit?id=${id}&page=my&taskId=${taskId}&remark=${remark}`
              );
              return Promise.resolve(false);
            }
            return Promise.resolve(true);
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className={classnames('separate', 'tw-btn-default', 'stand')}
              icon="undo"
              size="large"
              disabled={disabledBtn}
              onClick={() => closeThenGoto('/plat/expense/computer/apply')}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>

          <Card
            className="tw-card-adjust"
            title={
              <Title icon="profile" id="app.settings.menuMap.basic" defaultMessage="基础设置" />
            }
            bordered={false}
          >
            {formData && formData.id ? (
              <>
                <DescriptionList size="large" title="" col={2}>
                  <Description term="申请人/BASE地">
                    {formData.applyResName}/{formData.baseCityName}
                  </Description>
                  <Description term="申请人所属BU">{formData.resBuName}</Description>
                  <Description term="品牌型号及颜色">{formData.deviceDesc}</Description>
                  <Description term="票据号">{formData.billNo}</Description>
                  <Description term="内存">{formData.memSize}</Description>
                  <Description term="硬盘">{formData.hdSize}</Description>
                  <Description term="购置金额">{formData.devicePrice}</Description>
                  <Description term="购置日期">
                    {formData.buyDate ? moment(formData.buyDate).format('YYYY-MM-DD') : undefined}
                  </Description>
                  <Description term="补贴起始月份">{formData.startPeriodId}</Description>
                  <Description term="补贴额度">{formData.monthlyAmt}</Description>
                  <Description term="附件">
                    <FileManagerEnhance
                      api="/api/op/v1/device/sfs/token"
                      dataKey={formData.id}
                      listType="text"
                      disabled
                      preview
                    />
                  </Description>
                </DescriptionList>

                <DescriptionList size="large" col={1}>
                  <Description term="备注">{formData.applyDesc}</Description>
                </DescriptionList>
              </>
            ) : (
              <Loading />
            )}
          </Card>
          {/* 详情页要添加相关流程项目，因此是不存在 taskId 的时候才展示 */}
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'ACC_A26' }]} />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default ComputerApplyDetail;
