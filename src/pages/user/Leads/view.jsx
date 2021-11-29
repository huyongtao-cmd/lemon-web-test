import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import moment from 'moment';
import { Button, Card } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import router from 'umi/router';

const { Description } = DescriptionList;

const DOMAIN = 'userLeadsDetail';

@connect(({ loading, userLeadsDetail, dispatch }) => ({
  loading,
  userLeadsDetail,
  dispatch,
}))
@mountToTab()
class UserLeadsDetailView extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    // 页面可配置化数据请求
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'LEADS_MANAGEMENT_DETAILS' },
    });
    if (param) {
      param.id &&
        dispatch({
          type: `${DOMAIN}/query`,
          payload: param,
        });
    } else {
      dispatch({
        type: `${DOMAIN}/clean`,
      });
    }
  }

  renderPage = () => {
    const {
      mode,
      userLeadsDetail: { formData, pageConfig },
    } = this.props;
    const isInternal = formData.sourceType === 'INTERNAL';
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentBlockConfig = {};
    pageConfig.pageBlockViews.forEach(view => {
      if (view.blockKey === 'LEADS_MANAGEMENT_DETAILS') {
        // 线索详情
        currentBlockConfig = view;
      }
    });
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const {
      leadsName = {},
      leadsNo = {},
      remark = {},
      custName = {},
      custContact = {},
      contactPhone = {},
      contactDept = {},
      contactPosition = {},
      custIdst = {},
      salesmanResId = {},
      leadsStatus = {},
      closeReason = {},
      createUserId = {},
      createTime = {},
      isReward = {},
      rewardBuId = {},
      isRewardReason = {},
      rewardPrice = {},
      isReceived = {},
      sourceType = {},
      internalBuId = {},
      internalResId = {},
      externalIden = {},
      externalName = {},
      externalPhone = {},
      rewardType = {},
      rewardObj = {},
    } = pageFieldJson;
    const basicFields = [
      <Description key="leadsName" term={leadsName.displayName} sortno={leadsName.sortNo}>
        {formData.leadsName}
      </Description>,
      <Description key="leadsNo" term={leadsNo.displayName} sortno={leadsNo.sortNo}>
        {formData.leadsNo}
      </Description>,
      <Description key="remark" term={remark.displayName} sortno={remark.sortNo}>
        {formData.remark}
      </Description>,
      <Description key="custName" term={custName.displayName} sortno={custName.sortNo}>
        {formData.custName}
      </Description>,
      <Description key="custContact" term={custContact.displayName} sortno={custContact.sortNo}>
        {formData.custContact}
      </Description>,
      <Description key="contactPhone" term={contactPhone.displayName} sortno={contactPhone.sortNo}>
        {formData.contactPhone}
      </Description>,
      <Description key="contactDept" term={contactDept.displayName} sortno={contactDept.sortNo}>
        {formData.contactDept}
      </Description>,
      <Description
        key="contactPosition"
        term={contactPosition.displayName}
        sortno={contactPosition.sortNo}
      >
        {formData.contactPosition}
      </Description>,
      <Description term={custIdst.displayName} key="custIdst" sortno={custIdst.sortNo}>
        {formData.custIdstDesc}
      </Description>,
      <Description
        key="salesmanResId"
        sortno={salesmanResId.sortNo}
        term={salesmanResId.displayName}
      >
        {formData.salesmanName}
      </Description>,
      <Description key="rewardType" sortno={rewardType.sortNo} term={rewardType.displayName}>
        {formData.rewardTypeName}
      </Description>,
      <Description key="rewardObj" sortno={rewardObj.sortNo} term={rewardObj.displayName}>
        {formData.rewardObjName}
      </Description>,
      <Description key="leadsStatus" sortno={leadsStatus.sortNo} term={leadsStatus.displayName}>
        {formData.leadsStatusDesc}
      </Description>,
      <Description key="closeReason" sortno={closeReason.sortNo} term={closeReason.displayName}>
        {formData.closeReasonDesc}
      </Description>,
      <Description key="createUserId" sortno={createUserId.sortNo} term={createUserId.displayName}>
        {formData.createUserName}
      </Description>,
      <Description key="createTime" sortno={createTime.sortNo} term={createTime.displayName}>
        {formData.createTime
          ? moment(formData.createTime).format('YYYY-MM-DD')
          : formData.createTime}
      </Description>,
      mode !== 'oneZero' && (
        <Description key="isReward" sortno={isReward.sortNo} term={isReward.displayName}>
          {formData.isRewardValue}
        </Description>
      ),
      mode !== 'oneZero' && (
        <Description key="rewardBuId" sortno={rewardBuId.sortNo} term={rewardBuId.displayName}>
          {formData.rewardBuIdName}
        </Description>
      ),
      mode !== 'oneZero' && (
        <Description
          key="isRewardReason"
          sortno={isRewardReason.sortNo}
          term={isRewardReason.displayName}
        >
          {formData.iRewardReason}
        </Description>
      ),
      mode !== 'oneZero' && (
        <Description key="rewardPrice" sortno={rewardPrice.sortNo} term={rewardPrice.displayName}>
          {formData.rewardPrice}
        </Description>
      ),
      mode !== 'oneZero' && (
        <Description key="isReceived" sortno={isReceived.sortNo} term={isReceived.displayName}>
          {formData.isReceived}
        </Description>
      ),
    ];
    const filterList = basicFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    const sourceFields = [
      <Description term={sourceType.displayName} key="sourceType" sortno={sourceType.sortNo}>
        {isInternal ? '内部' : '外部'}
      </Description>,
      isInternal ? (
        <Description
          key="internalBuId"
          sortno={internalBuId.sortNo}
          term={internalBuId.displayName}
        >
          {formData.internalBuName}
        </Description>
      ) : (
        <Description
          key="externalIden"
          sortno={externalIden.sortNo}
          term={externalIden.displayName}
        >
          {formData.externalIden}
        </Description>
      ),
      isInternal ? (
        <Description
          key="internalResId"
          sortno={internalResId.sortNo}
          term={internalResId.displayName}
        >
          {formData.internalResName}
        </Description>
      ) : (
        <Description
          key="externalName"
          sortno={externalName.sortNo}
          term={externalName.displayName}
        >
          {formData.externalName}
        </Description>
      ),
      isInternal ? (
        <div />
      ) : (
        <Description
          key="externalPhone"
          sortno={externalPhone.sortNo}
          term={externalPhone.displayName}
        >
          {formData.externalPhone}
        </Description>
      ),
      isInternal ? (
        <Description key="rewardType" sortno={rewardType.sortNo} term={rewardType.displayName}>
          {formData.rewardTypeName}
        </Description>
      ) : (
        <div />
      ),
      isInternal ? (
        <Description key="rewardObj" sortno={rewardObj.sortNo} term={rewardObj.displayName}>
          {formData.rewardObjName}
        </Description>
      ) : (
        <div />
      ),
    ];
    const filterList1 = sourceFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    return (
      <>
        <DescriptionList
          size="large"
          title={formatMessage({
            id: `app.settings.menuMap.basicMessage`,
            desc: '基本信息',
          })}
          col={2}
        >
          {filterList}
        </DescriptionList>
        <DescriptionList
          size="large"
          title={formatMessage({ id: `app.settings.menuMap.source`, desc: '来源信息' })}
          col={2}
        >
          {filterList1}
        </DescriptionList>
      </>
    );
  };

  render() {
    const {
      loading,
      mode,
      userLeadsDetail: { formData, pageConfig },
    } = this.props;
    const { id } = fromQs();
    const isInternal = formData.sourceType === 'INTERNAL';
    const allBpm = [{ docId: id, procDefKey: 'TSK_S01', title: '线索分配流程' }];
    return (
      <PageHeaderWrapper>
        {!mode ? (
          <Card className="tw-card-rightLine">
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() => {
                const { from } = fromQs();
                closeThenGoto(markAsTab(from));
              }}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
        ) : null}
        <Card
          className="tw-card-adjust"
          title={
            <Title icon="profile" id="app.settings.menuMap.leadsDetail" defaultMessage="线索详情" />
          }
          bordered={false}
        >
          {!loading.effects[`${DOMAIN}/getPageConfig`] && formData.id ? (
            this.renderPage()
          ) : (
            <Loading />
          )}
        </Card>
        {!mode ? <BpmConnection source={allBpm} /> : null}
      </PageHeaderWrapper>
    );
  }
}

export default UserLeadsDetailView;
