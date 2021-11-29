import React, { PureComponent } from 'react';
import { Button, Form, Card, Divider } from 'antd';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import moment from 'moment';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';

import component from './component/index';
import createComponent from './createComponent';

const {
  CompetitorEdit,
  CaseEdit,
  SaleEdit,
  ExtrafeeEdit,
  StakeholderEdit,
  PartnerEdit,
  CategoryEdit,
  CostEstimationEdit,
} = component;
const { OppoCreateCust, OppoCreateSale, OppoCreateInner, OppoCreateSource } = createComponent;

const DOMAIN = 'userOppsCreate';

@connect(({ loading, userOppsCreate, user, dispatch }) => ({
  loading,
  userOppsCreate,
  user,
  dispatch,
}))
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
    dispatch({ type: `${DOMAIN}/clean` });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BUSINESS_EDIT_BASIC_INFORMATION' },
    });
    if (page && page === 'leads') {
      dispatch({
        type: `${DOMAIN}/leadsTransform`,
        payload: { id, mode, tab, page },
      });
    }
  }

  onOperationTabChange = key => {
    const {
      dispatch,
      userOppsCreate: { mode },
    } = this.props;
    if (mode !== 'create') {
      this.setState({ tabKey: key });
    }
    if (key === 'category') {
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'BUSINESS_EDIT_CATEGORY_CODE' },
      });
    } else if (key === 'basic') {
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'BUSINESS_EDIT_BASIC_INFORMATION' },
      });
    }
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      userOppsCreate: { formData },
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
    } else {
      dispatch({
        type: `userOppsDetail${tabKey}/save`,
        payload: { oppoId: formData.id },
      });
    }
  };

  render() {
    const {
      loading,
      dispatch,
      userOppsCreate: { page, formData, mode },
      userOppsCreate,
      user,
      form,
    } = this.props;
    const { tabKey } = this.state;

    const disabledBtn =
      !!loading.effects[`${DOMAIN}/leadsTransform`] ||
      !!loading.effects[`${DOMAIN}/save`] ||
      !!loading.effects[`${DOMAIN}/saveCategory`] ||
      !!loading.effects[`userOppsDetail${tabKey}/save`] ||
      !!loading.effects[`userOppsDetail${DOMAIN}/getPageConfig`];

    const contentList = {
      basic: (
        <div>
          <OppoCreateCust
            form={form}
            domain={DOMAIN}
            userOppsDetail={userOppsCreate}
            dispatch={dispatch}
            user={user}
          />
          <Divider dashed />

          <OppoCreateSale
            form={form}
            domain={DOMAIN}
            userOppsDetail={userOppsCreate}
            dispatch={dispatch}
          />
          <Divider dashed />

          <OppoCreateInner
            form={form}
            domain={DOMAIN}
            userOppsDetail={userOppsCreate}
            dispatch={dispatch}
          />
          <Divider dashed />

          <OppoCreateSource
            form={form}
            domain={DOMAIN}
            userOppsDetail={userOppsCreate}
            dispatch={dispatch}
          />
        </div>
      ),
      sale: <SaleEdit domain={DOMAIN} userOppsDetail={userOppsCreate} />,
      case: <CaseEdit domain={DOMAIN} userOppsDetail={userOppsCreate} />,
      stakeholder: <StakeholderEdit domain={DOMAIN} userOppsDetail={userOppsCreate} />,
      partner: <PartnerEdit domain={DOMAIN} userOppsDetail={userOppsCreate} />,
      extrafee: <ExtrafeeEdit domain={DOMAIN} userOppsDetail={userOppsCreate} />,
      competitor: <CompetitorEdit domain={DOMAIN} userOppsDetail={userOppsCreate} />,
      category: !!formData.id && (
        <CategoryEdit form={form} domain={DOMAIN} userOppsDetail={userOppsCreate} />
      ),
      costEstimation: <CostEstimationEdit domain={DOMAIN} userOppsDetail={userOppsCreate} />,
    };

    const tabLists = [
      {
        key: 'basic',
        tab: formatMessage({ id: `user.management.oppo.oppo`, desc: '基本信息' }),
      },
      {
        key: 'sale',
        tab: (
          <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
            {formatMessage({ id: `user.management.oppo.sale`, desc: '销售清单' })}
          </span>
        ),
      },
      {
        key: 'case',
        tab: (
          <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
            {formatMessage({ id: `user.management.oppo.case`, desc: '案情分析与跟进' })}
          </span>
        ),
      },
      {
        key: 'stakeholder',
        tab: (
          <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
            {formatMessage({ id: `user.management.oppo.stakeholder`, desc: '商机干系人' })}
          </span>
        ),
      },
      {
        key: 'partner',
        tab: (
          <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
            {formatMessage({ id: `user.management.oppo.partner`, desc: '合作伙伴' })}
          </span>
        ),
      },
      // {
      //   key: 'extrafee',
      //   tab: (
      //     <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
      //       {formatMessage({ id: `user.management.oppo.extrafee`, desc: '额外销售费用' })}
      //     </span>
      //   ),
      // },
      {
        key: 'competitor',
        tab: (
          <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
            {formatMessage({ id: `user.management.oppo.competitor`, desc: '竞争对手' })}
          </span>
        ),
      },
      {
        key: 'costEstimation',
        tab: (
          <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
            成本估算
          </span>
        ),
      },
      {
        key: 'benefitDistribution',
        tab: (
          <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
            利益分配
          </span>
        ),
      },
      {
        key: 'channelFee',
        tab: (
          <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
            渠道费用
          </span>
        ),
      },
      {
        key: 'quote',
        tab: (
          <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>报价</span>
        ),
      },
      {
        key: 'category',
        tab: (
          <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
            {formatMessage({ id: `user.management.oppo.category`, desc: '类别码' })}
          </span>
        ),
      },
    ];

    return (
      <PageHeaderWrapper title="商机报备">
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
        </Card>
        <Card
          className="tw-card-multiTab"
          bordered={false}
          activeTabKey={tabKey}
          tabList={tabLists}
          onTabChange={this.onOperationTabChange}
        >
          {contentList[tabKey]}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default OppoDetail;
