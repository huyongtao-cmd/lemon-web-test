import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import classnames from 'classnames';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { FileManagerEnhance } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';

import Purchase from '../TabContent/PurchaseDetail';
import Gathering from '../TabContent/GatheringDetail';
import SharingReadOnly from '../TabContent/SharingReadOnly';
import FeeReadOnly from '../TabContent/FeeReadOnly';
import PurchaseDemandDealReadOnly from '../TabContent/PurchaseDemandDealReadOnly';
import ChannelFeeReadOnly from '../TabContent/ChannelFeeReadOnly';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';

const DOMAIN = 'userContractEditSub';
const { Description } = DescriptionList;
const operationTabList = [
  {
    key: 'Info',
    tab: '合同信息',
  },
  {
    key: 'Purchase',
    tab: '采购合同',
  },
  {
    key: 'Gathering',
    tab: '收款计划',
  },
  {
    key: 'Sharing',
    tab: '收益分配',
  },
  {
    key: 'Fee',
    tab: '相关费用',
  },
  {
    key: 'PurchaseDemandDeal',
    tab: '采购需求处理',
  },
  {
    key: 'ChannelFee',
    tab: '渠道费用确认单',
  },
];

@connect(({ loading, dispatch, userContractEditSub, user }) => ({
  loading,
  dispatch,
  userContractEditSub,
  user,
}))
@mountToTab()
class SubDetail extends PureComponent {
  state = {};

  componentDidMount() {
    // 初始得到主合同id给formData赋值
    const { dispatch, user = {} } = this.props;
    const {
      user: { extInfo = {} },
    } = user;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/querySub`,
      payload: id,
    }).then(res => {
      if (res.ok) {
        const { demandType, signBuIdInchargeResId } = res.datum;
        // demandType  SERVICES_TRADE、PRODUCT_TRADE显示采购需求处理
        if (demandType !== 'SERVICES_TRADE' && demandType !== 'PRODUCT_TRADE') {
          this.getPagesConfig(res);
        } else {
          // 加载页面配置
          dispatch({
            type: `${DOMAIN}/getPageConfig`,
            payload: { pageNo: 'SALE_CONTRACT_DETAIL_SUB' },
          });
        }

        // if (extInfo.resId === signBuIdInchargeResId) {
        //   // 签单BU负责人
        //   dispatch({
        //     type: `${DOMAIN}/getPageConfig`,
        //     payload: { pageNo: 'SALE_CONTRACT_DETAIL_SUB:SING_BU_RES_ID' },
        //   });
        // }
      }
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        operationkeyDetail: 'Info',
      },
    });
  }

  // 场景化拉取Tab
  getPagesConfig = res => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'SALE_CONTRACT_DETAIL_SUB:detailNot' },
    });
  };

  onOperationTabChange = key => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { operationkeyDetail: key },
    });
  };

  handleEdit = () => {
    const { mainId, id } = fromQs();
    closeThenGoto(`/sale/contract/editSub?mainId=${mainId}&id=${id}`);
  };

  handleCancel = () => {
    // closeThenGoto('/sale/contract/salesList');
    router.goBack();
  };

  // 根据权限配置中的表单字段修改visible属性
  filterTabByField = (pageTabViews, formData, resId, baseBuId) => {
    const arr = JSON.parse(JSON.stringify(pageTabViews));
    arr.forEach((item, index) => {
      Array.isArray(item.permissionViews) &&
        item.permissionViews.forEach(view => {
          if (view.allowType === 'FIELD') {
            if (formData[view.allowValue] === resId) {
              !item.visible ? (arr[index].visible = true) : null;
            }
          }
          if (view.allowType === 'BUFIELD') {
            if (formData[view.allowValue] === baseBuId) {
              !item.visible ? (arr[index].visible = true) : null;
            }
          }
        });
    });
    return arr;
  };

  render() {
    const {
      userContractEditSub: { formData, operationkeyDetail, pageConfig = {} },
      user: {
        user: {
          extInfo: { resId, baseBuId },
        },
      },
    } = this.props;

    const { pageBlockViews = [] } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }

    let pageFieldView = [];
    pageBlockViews.forEach(block => {
      if (block.blockKey === 'SALE_CONTRACT_DETAIL_SUB') {
        pageFieldView = block.pageFieldViews;
      }
    });
    if (!pageFieldView || pageFieldView.length === 0) {
      return <div />;
    }
    const pageFieldJson = {};
    pageFieldView.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    let keyList = [];
    if (pageConfig && pageConfig.pageTabViews) {
      const resArr = this.filterTabByField(pageConfig.pageTabViews, formData, resId, baseBuId);
      keyList = resArr.filter(view => view.visible).map(view => view.tabKey);
    }
    const permissionTabList = operationTabList.filter(tab => keyList.indexOf(tab.key) > -1);

    const baseInfo = [
      <Description key="contractName" term="子合同名称">
        {formData.contractName}
      </Description>,
      <Description key="contractNo" term="编号">
        {formData.contractNo}
      </Description>,
      <Description key="mainContractId" term="主合同">
        {formData.mainContractName}
      </Description>,
      <Description key="userdefinedNo" term="参考合同号">
        {formData.userdefinedNo}
      </Description>,
      <Description key="signBuId" term="签单BU">
        {formData.signBuName}
      </Description>,
      <Description key="salesmanResId" term="销售负责人">
        {formData.salesmanResName}
      </Description>,
      <Description key="deliBuId" term="交付BU">
        {formData.deliBuName}
      </Description>,
      <Description key="deliResId" term="交付负责人">
        {formData.deliResName}
      </Description>,
      <Description key="preSaleBuId" term="售前BU">
        {formData.preSaleBuName}
      </Description>,
      <Description key="preSaleResId" term="售前负责人">
        {formData.preSaleResName}
      </Description>,
      <Description key="pmoResId" term="PMO">
        {formData.pmoResIdName}
      </Description>,
      <Description key="regionBuId" term="销售区域BU">
        {formData.regionBuName}
      </Description>,
      <Description key="signDate" term="签订日期">
        {formData.signDate}
      </Description>,
      <Description key="startDate" term="合同开始日期">
        {formData.startDate}
      </Description>,
      <Description key="endDate" term="合同结束日期">
        {formData.endDate}
      </Description>,
      <Description key="attache" term="附件">
        <FileManagerEnhance
          api="/api/op/v1/contract/sub/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled
          preview
        />
      </Description>,
      <Description key="deliveryAddress" term="交付地点">
        {formData.deliveryAddress}
      </Description>,
      <Description key="contractStatus" term="合同状态">
        {formData.contractStatusDesc}
      </Description>,
      <Description key="closeReason" term="关闭原因">
        {formData.closeReasonDesc}
      </Description>,
      <Description key="activateDate" term="合同激活日期">
        {formData.activateDate}
      </Description>,
      <Description key="closeDate" term="合同关闭日期">
        {formData.closeDate}
      </Description>,
      <Description key="currCode" term="币种">
        {formData.currCodeDesc}
      </Description>,
      <Description key="paperStatus" term="纸质合同状态">
        {formData.paperStatusDesc}
      </Description>,
      <Description key="emptyField" term="占位" style={{ visibility: 'hidden' }}>
        , 占位
      </Description>,
      <DescriptionList key="paperDesc" size="large" col={1}>
        <Description term={pageFieldJson.paperDesc.displayName}>
          <pre>{formData.paperDesc}</pre>
        </Description>
      </DescriptionList>,
      <DescriptionList key="remark" size="large" col={1}>
        <Description term={pageFieldJson.remark.displayName}>
          <pre>{formData.remark}</pre>
        </Description>
      </DescriptionList>,
      <Description key="createUserId" term="创建人">
        {formData.createUserName}
      </Description>,
      <Description key="createTime" term="创建日期">
        {formData.createTime}
      </Description>,
    ]
      .filter(desc => pageFieldJson[desc.key].visibleFlag === 1)
      .map(desc => ({
        ...desc,
        props: {
          ...desc.props,
          term: pageFieldJson[desc.key].displayName,
        },
      }))
      .sort((d1, d2) => d1.sortNo - d2.sortNo);

    const saleInfo = [
      <Description key="productId" term="产品">
        {formData.productName}
      </Description>,
      <Description key="briefDesc" term="简要说明">
        {formData.briefDesc}
      </Description>,
      <Description key="workType" term="工作类型">
        {formData.workTypeDesc}
      </Description>,
      <Description key="promotionType" term="促销码">
        {formData.promotionTypeDesc}
      </Description>,
      <Description key="rangeProp" term="范围性质">
        {formData.rangePropDesc}
      </Description>,
      <Description key="halfOpenDesc" term="半开口说明">
        {formData.halfOpenDesc}
      </Description>,
      <Description key="saleType1" term="产品大类">
        {formData.saleType1Desc}
      </Description>,
      <Description key="saleType2" term="产品小类">
        {formData.saleType2Desc}
      </Description>,
      <Description key="prodProp" term="供应主体类别">
        {formData.prodPropDesc}
      </Description>,
      <Description key="projProp" term="提成类别">
        {formData.projPropDesc}
      </Description>,
      <Description key="channelType" term="交易方式">
        {formData.channelTypeDesc}
      </Description>,
      <Description key="cooperationType" term="交易性质">
        {formData.cooperationTypeDesc}
      </Description>,
      <Description key="demandType" term="需求类型">
        {formData.demandTypeName}
      </Description>,
    ]
      .filter(desc => pageFieldJson[desc.key].visibleFlag === 1)
      .map(desc => ({
        ...desc,
        props: {
          ...desc.props,
          term: pageFieldJson[desc.key].displayName,
        },
      }))
      .sort((d1, d2) => d1.sortNo - d2.sortNo);

    const finInfo = [
      <Description key="custpaytravelFlag" term="客户承担差旅费">
        {formData.custpaytravelFlagDesc}
      </Description>,
      <Description key="reimbursementDesc" term="报销政策说明">
        {formData.reimbursementDesc}
      </Description>,
      <Description key="amtTaxRate" term="含税总金额/税率">
        {formData.amt} / {formData.taxRate}%
      </Description>,
      <Description key="noTax" term="不含税金额">
        {formData.noTax}
      </Description>,
      <Description key="purchasingSum" term="相关项目采购">
        {formData.purchasingSum}
      </Description>,
      <Description key="extraAmt" term="其它应减费用">
        {formData.extraAmt}
      </Description>,
      <Description key="effectiveAmt" term="有效合同额">
        {formData.effectiveAmt}
      </Description>,
      <Description key="grossProfit" term="毛利">
        {formData.grossProfit}
      </Description>,
      <Description key="finPeriodId" term="财务期间">
        {formData.finPeriodName}
      </Description>,
    ]
      .filter(desc => pageFieldJson[desc.key].visibleFlag === 1)
      .map(desc => ({
        ...desc,
        props: {
          ...desc.props,
          term: pageFieldJson[desc.key].displayName,
        },
      }))
      .sort((d1, d2) => d1.sortNo - d2.sortNo);

    const contentList = {
      Info: (
        <>
          <DescriptionList
            size="large"
            title={formatMessage({ id: `sys.system.basicInfo`, desc: '基本信息' })}
            col={2}
            hasSeparator
          >
            {baseInfo}
          </DescriptionList>

          <DescriptionList size="large" title="销售信息" col={2} hasSeparator>
            {saleInfo}
          </DescriptionList>

          <DescriptionList size="large" title="财务信息" col={2}>
            {finInfo}
          </DescriptionList>
        </>
      ),
      Purchase: <Purchase />,
      Gathering: <Gathering />,
      Sharing: <SharingReadOnly formData={formData} />,
      Fee: <FeeReadOnly />,
      PurchaseDemandDeal: <PurchaseDemandDealReadOnly />,
      ChannelFee: <ChannelFeeReadOnly />,
    };

    const allBpm = [{ docId: formData.flowId, procDefKey: 'ACC_A62', title: '子合同激活审批流程' }];

    return (
      <PageHeaderWrapper title="销售子合同详情">
        <Card className="tw-card-rightLine">
          {/* <Button
            className="tw-btn-primary"
            type="primary"
            icon="form"
            size="large"
            onClick={this.handleEdit}
          >
            {formatMessage({ id: `misc.edit`, desc: '编辑' })}
          </Button> */}
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-multiTab"
          bordered={false}
          tabList={permissionTabList}
          onTabChange={this.onOperationTabChange}
          activeTabKey={operationkeyDetail}
        >
          {contentList[operationkeyDetail]}
        </Card>
        <BpmConnection source={allBpm} />
      </PageHeaderWrapper>
    );
  }
}

export default SubDetail;
