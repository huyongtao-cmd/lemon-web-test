import React, { PureComponent } from 'react';
import { Button, Form, Card, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import moment from 'moment';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import Loading from '@/components/core/DataLoading';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';

import component from './component/index';
import createComponent from './createComponent';
import { tabList } from './config';

const {
  CompetitorEdit,
  CaseEdit,
  SaleEdit,
  ExtrafeeEdit,
  StakeholderEdit,
  PartnerEdit,
  CategoryEdit,
  CostEstimationEdit,
  BenefitDistributionEdit,
  ChannelFeeEdit,
  QuoteEdit,
} = component;
const { OppoCreateCust, OppoCreateSale, OppoCreateInner, OppoCreateSource } = createComponent;

const DOMAIN = 'userOppsEdit';

@connect(
  ({
    loading,
    userOppsEdit,
    opportunityCostEstimation,
    opportunityBenefitDistribution,
    opportunityChannelFee,
    opportunityQuote,
    user,
    dispatch,
  }) => ({
    loading,
    userOppsEdit,
    opportunityCostEstimation,
    opportunityBenefitDistribution,
    opportunityChannelFee,
    opportunityQuote,
    user,
    dispatch,
  })
)
@Form.create({
  // form只能取值一次，新增保存之后需要刷新页面，否则changedFields为{}, 会报错
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (value instanceof Object && name !== 'forecastWinDate' && !Array.isArray(value)) {
      const key = name.split('Id')[0];
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [key + 'Id']: value.id, [key + 'Name']: value.name },
      });
    } else if (name === 'forecastWinDate') {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: moment(value).format('YYYY-MM-DD') },
      });
    } else {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }

    if (name === 'sourceType') {
      if (value === 'INTERNAL') {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { externalIden: null, externalName: null, externalPhone: null },
        });
      } else {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            internalBuName: null,
            internalBuId: null,
            internalResName: null,
            internalResId: null,
          },
        });
      }
    }
  },
})
@mountToTab()
class OppoDetail extends PureComponent {
  state = {
    tabKey: 'basic',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    const { id, tab, mode, page } = param;
    dispatch({
      type: `opportunityCostEstimation/updateState`,
      payload: {
        selectedList: [],
        selectedBenefitDistributionList: [],
        selectedChannelFeeList: [],
      },
    });
    dispatch({
      type: `opportunityQuote/updateState`,
      payload: {
        selectedList: [],
      },
    });
    // 获取页面配置信息
    if (tab === 'category') {
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'BUSINESS_EDIT_CATEGORY_CODE' },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'BUSINESS_EDIT_BASIC_INFORMATION' },
      });
    }

    if (mode && mode !== 'create') {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id, mode, tab, page },
      });
      this.setState({
        tabKey: tab,
      });
    } else if (page && page === 'leads') {
      dispatch({
        type: `${DOMAIN}/leadsTransform`,
        payload: { id, mode, tab, page },
      });
    }
  }

  onOperationTabChange = key => {
    const {
      dispatch,
      userOppsEdit: { mode },
    } = this.props;
    // dispatch({
    //   type: `${DOMAIN}/cleanPageConfig`,
    // });

    if (key === 'category') {
      dispatch({
        type: `${DOMAIN}/getCatCodePageConfig`,
        payload: { pageNo: 'BUSINESS_EDIT_CATEGORY_CODE' },
      });
    }
    //  else if (key === 'basic') {
    //   dispatch({
    //     type: `${DOMAIN}/getPageConfig`,
    //     payload: { pageNo: 'BUSINESS_EDIT_BASIC_INFORMATION' },
    //   });
    // }
    if (mode !== 'create') {
      this.setState({ tabKey: key });
    }
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      userOppsEdit: { formData },
      dispatch,
    } = this.props;
    const { tabKey } = this.state;

    if (tabKey === 'basic') {
      if (formData.sourceType === 'INTERNAL' && !formData.internalBuId && !formData.internalResId) {
        createMessage({ type: 'error', description: '请选择来源BU或者来源人' });
        return;
      }
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          dispatch({
            type: `${DOMAIN}/save`,
          });
        }
      });
    } else if (tabKey === 'category') {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          dispatch({
            type: `${DOMAIN}/saveCategory`,
          });
        }
      });
    } else if (tabKey === 'costEstimation') {
      dispatch({
        type: `opportunityCostEstimation/costeUpdate`,
      });
    } else if (tabKey === 'benefitDistribution') {
      dispatch({
        type: `opportunityBenefitDistribution/benefitSave`,
      });
    } else if (tabKey === 'channelFee') {
      dispatch({
        type: `opportunityChannelFee/channelSave`,
      });
    } else if (tabKey === 'quote') {
      dispatch({
        type: `opportunityQuote/offerUpdate`,
      });
    } else {
      dispatch({
        type: `userOppsDetail${tabKey}/save`,
        payload: { oppoId: formData.id },
      });
    }
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
      loading,
      dispatch,
      userOppsEdit: { page, formData, formDataSource, mode, pageConfig },
      userOppsEdit,
      opportunityCostEstimation: { selectedList },
      opportunityBenefitDistribution: { selectedBenefitDistributionList },
      opportunityChannelFee: { selectedChannelFeeList },
      opportunityQuote: { selectedList: quoteSelectedList },
      user,
      user: {
        user: {
          extInfo: { resId, baseBuId },
        },
      },
      form,
    } = this.props;
    // console.log(pageConfig);
    const { tabKey } = this.state;
    const disabledBtn =
      !!loading.effects[`${DOMAIN}/query`] ||
      !!loading.effects[`${DOMAIN}/save`] ||
      !!loading.effects[`${DOMAIN}/saveCategory`] ||
      !!loading.effects[`userOppsDetail${tabKey}/save`] ||
      !!loading.effects[`userOppsDetail${DOMAIN}/getPageConfig`];

    const submitBtn =
      loading.effects[`opportunityCostEstimation/costeUpdate`] ||
      loading.effects[`opportunityBenefitDistribution/benefitSave`] ||
      loading.effects[`opportunityChannelFee/channelSave`] ||
      loading.effects[`opportunityQuote/offerUpdate`] ||
      loading.effects[`opportunityCostEstimation/saveFlow`] ||
      loading.effects[`opportunityBenefitDistribution/benefitSaveFlow`] ||
      loading.effects[`opportunityChannelFee/channelSaveFlow`] ||
      loading.effects[`opportunityQuote/offerSaveFlow`] ||
      loading.effects[`opportunityCostEstimation/costeList`] ||
      loading.effects[`opportunityBenefitDistribution/benefitList`] ||
      loading.effects[`opportunityChannelFee/channelList`] ||
      loading.effects[`opportunityQuote/offerList`];

    const contentList = {
      basic: (
        <div>
          <OppoCreateCust
            form={form}
            domain={DOMAIN}
            userOppsDetail={userOppsEdit}
            dispatch={dispatch}
            user={user}
          />
          <Divider dashed />

          <OppoCreateSale
            form={form}
            domain={DOMAIN}
            userOppsDetail={userOppsEdit}
            dispatch={dispatch}
          />
          <Divider dashed />

          <OppoCreateInner
            form={form}
            domain={DOMAIN}
            userOppsDetail={userOppsEdit}
            dispatch={dispatch}
          />
          <Divider dashed />

          <OppoCreateSource
            form={form}
            domain={DOMAIN}
            userOppsDetail={userOppsEdit}
            dispatch={dispatch}
          />
        </div>
      ),

      sale: <SaleEdit domain={DOMAIN} userOppsDetail={userOppsEdit} />,
      case: <CaseEdit domain={DOMAIN} userOppsDetail={userOppsEdit} />,
      stakeholder: <StakeholderEdit domain={DOMAIN} userOppsDetail={userOppsEdit} />,
      partner: <PartnerEdit domain={DOMAIN} userOppsDetail={userOppsEdit} />,
      extrafee: <ExtrafeeEdit domain={DOMAIN} userOppsDetail={userOppsEdit} />,
      competitor: <CompetitorEdit domain={DOMAIN} userOppsDetail={userOppsEdit} />,
      category: !!formData.id && (
        <CategoryEdit form={form} domain={DOMAIN} userOppsDetail={userOppsEdit} />
      ),
      costEstimation: <CostEstimationEdit userOppsDetail={userOppsEdit} />,
      benefitDistribution: (
        <BenefitDistributionEdit domain={DOMAIN} userOppsDetail={userOppsEdit} />
      ),
      channelFee: <ChannelFeeEdit domain={DOMAIN} userOppsDetail={userOppsEdit} />,
      quote: <QuoteEdit domain={DOMAIN} userOppsDetail={userOppsEdit} />,
    };

    let keyList = [];
    if (pageConfig && pageConfig.pageTabViews && Array.isArray(pageConfig.pageTabViews)) {
      const resArr = this.filterTabByField(
        pageConfig.pageTabViews,
        formDataSource,
        resId,
        baseBuId
      );
      keyList = resArr.filter(view => view.visible).map(view => view.tabKey);
    }

    const permissionTabList = tabList.filter(tab => keyList.indexOf(tab.key) > -1);

    return (
      <PageHeaderWrapper title="商机编辑">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          {tabKey === 'costEstimation' ||
          tabKey === 'benefitDistribution' ||
          tabKey === 'channelFee' ||
          tabKey === 'quote' ? (
            <Button
              className="tw-btn-primary"
              size="large"
              disabled={submitBtn}
              onClick={() => {
                if (tabKey === 'costEstimation') {
                  if (
                    isEmpty(selectedList) ||
                    !isEmpty(
                      selectedList.filter(
                        v =>
                          v.approvalStatus === 'APPROVED' ||
                          v.activataStatus === '0' ||
                          v.approvalStatus === 'APPROVING'
                      )
                    )
                  ) {
                    createMessage({
                      type: 'warn',
                      description:
                        '请在成本估算中请选择未激活、未通过、未在审批中的成本估算方案再提交！',
                    });
                    return;
                  }
                  dispatch({
                    type: `opportunityCostEstimation/saveFlow`,
                    payload: {
                      resId,
                    },
                  });
                } else if (tabKey === 'benefitDistribution') {
                  if (
                    isEmpty(selectedBenefitDistributionList) ||
                    !isEmpty(
                      selectedBenefitDistributionList.filter(
                        v =>
                          v.approvalStatus === 'APPROVED' ||
                          v.activataStatus === '0' ||
                          v.approvalStatus === 'APPROVING'
                      )
                    )
                  ) {
                    createMessage({
                      type: 'warn',
                      description:
                        '请在利益分配中请选择未激活、未通过、未在审批中的利益分配方案再提交！',
                    });
                    return;
                  }

                  createConfirm({
                    width: 720,
                    content: (
                      <pre style={{ fontSize: '20px', fontWeight: 'bolder', color: 'red' }}>
                        {`\n1、请确保提交审批流程前已经保存数据！`}
                      </pre>
                    ),
                    onOk: () => {
                      dispatch({
                        type: `opportunityBenefitDistribution/benefitSaveFlow`,
                        payload: {
                          resId,
                        },
                      });
                    },
                  });
                } else if (tabKey === 'channelFee') {
                  if (
                    isEmpty(selectedChannelFeeList) ||
                    !isEmpty(
                      selectedChannelFeeList.filter(
                        v =>
                          v.approvalStatus === 'APPROVED' ||
                          v.activataStatus === '0' ||
                          v.approvalStatus === 'APPROVING'
                      )
                    )
                  ) {
                    createMessage({
                      type: 'warn',
                      description:
                        '请在渠道费用中请选择未激活、未通过、未在审批中的渠道费用方案再提交！',
                    });
                    return;
                  }
                  createConfirm({
                    width: 720,
                    content: (
                      <pre style={{ fontSize: '20px', fontWeight: 'bolder', color: 'red' }}>
                        {`\n1、请确保提交审批流程前已经保存数据！`}
                      </pre>
                    ),
                    onOk: () => {
                      dispatch({
                        type: `opportunityChannelFee/channelSaveFlow`,
                        payload: {
                          resId,
                        },
                      });
                    },
                  });
                } else {
                  if (
                    isEmpty(quoteSelectedList) ||
                    !isEmpty(
                      quoteSelectedList.filter(
                        v =>
                          v.approvalStatus === 'APPROVED' ||
                          v.activataStatus === '0' ||
                          v.approvalStatus === 'APPROVING'
                      )
                    )
                  ) {
                    createMessage({
                      type: 'warn',
                      description: '请选择未激活、未通过、未在审批中的报价方案再提交！',
                    });
                    return;
                  }
                  createConfirm({
                    width: 720,
                    content: (
                      <pre style={{ fontSize: '20px', fontWeight: 'bolder', color: 'red' }}>
                        {`\n1、请确保提交审批流程前已经保存数据！`}
                      </pre>
                    ),
                    onOk: () => {
                      dispatch({
                        type: `opportunityQuote/offerSaveFlow`,
                        payload: {
                          resId,
                        },
                      });
                    },
                  });
                }
              }}
            >
              提交
            </Button>
          ) : null}

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto(`/sale/management/${page}`)}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-multiTab"
          bordered={false}
          activeTabKey={tabKey}
          tabList={permissionTabList}
          onTabChange={this.onOperationTabChange}
        >
          {formData.id ? contentList[tabKey] : <Loading />}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default OppoDetail;
