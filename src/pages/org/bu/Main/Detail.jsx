import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Form, Select } from 'antd';
import { formatMessage } from 'umi/locale';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';

import BuBasicInfo from './Component/BasicInfo';
import BuCatsInfo from './Component/BuCatsInfo';
import BuFinanceInfo from './Component/BuFinanceInfo';
import BuResInfo from './Component/BuResInfo';
import BuBusinessScope from './Component/BuBusinessScope';
import BuBusinessTarget from './Component/BuBusinessTarget';
import Partner from './Component/Partner';
import Eqva from './Component/Eqva';

const DOMAIN = 'orgbu';

const operationTabList = [
  {
    key: 'BasicInfo',
    tab: '基本信息',
  },
  {
    key: 'FinanceInfo',
    tab: '财务信息',
  },
  {
    key: 'BuCat',
    tab: '类别码',
  },
  {
    key: 'ResInfo',
    tab: '资源信息',
  },
  {
    key: 'Partner',
    tab: '合伙人',
  },
  // {
  //   key: 'Eqva',
  //   tab: '资源当量收入',
  // },
  // {
  //   key: 'SettlementEQVA',
  //   tab: '结算当量',
  // },
  {
    key: 'BusinessScope',
    tab: '经营范围',
  },
  // {
  //   key: 'BusinessTarget',
  //   tab: '经营指标',
  // },
];

@connect(({ loading, orgbu }) => ({
  loading,
  orgbu,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const { value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { key, value },
    });
  },
})
class buDetail extends PureComponent {
  state = {
    operationkey: 'BasicInfo',
  };

  componentDidMount() {
    const urlParm = fromQs();
    const { dispatch } = this.props;
    dispatch({
      type: `orgbu/edit`,
      payload: {
        buId: urlParm.buId,
      },
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { operationkey } = this.state;

    const method = 'save' + operationkey;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/${method}`,
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto(`/org/bu/main`);
  };

  onOperationTabChange = key => {
    this.setState({ operationkey: key });
  };

  render() {
    const { dispatch, loading } = this.props;
    const { operationkey } = this.state;
    const { buId } = fromQs();

    const contentList = {
      BasicInfo: <BuBasicInfo buId={buId} dispatch={dispatch} />,
      FinanceInfo: <BuFinanceInfo buId={buId} dispatch={dispatch} />,
      BuCat: <BuCatsInfo buId={buId} dispatch={dispatch} />,
      ResInfo: <BuResInfo buId={buId} dispatch={dispatch} />,
      Partner: <Partner buId={buId} dispatch={dispatch} />,
      Eqva: <Eqva buId={buId} dispatch={dispatch} />,
      // SettlementEQVA: (
      //   <Card className="tw-card-adjust" bordered={false}>
      //     <BuSettlementEQVA buId={buId} dispatch={dispatch} />
      //   </Card>
      // ),
      BusinessScope: <BuBusinessScope buId={buId} dispatch={dispatch} />,
      BusinessTarget: <span>待开发</span>, // <BuBusinessTarget buId={orgbu.buId} dispatch={dispatch} />,
    };
    const partnerBtnDisbaled = loading.effects[`${DOMAIN}/savePartner`];

    return (
      <PageHeaderWrapper>
        {operationkey !== 'ResInfo' && (
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              type="primary"
              icon="save"
              size="large"
              disabled={
                operationkey === 'Eqva' || operationkey === 'FinanceInfo' || partnerBtnDisbaled
              }
              onClick={this.handleSave}
            >
              {formatMessage({ id: `misc.save`, desc: '保存' })}
            </Button>
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              disabled={false}
              onClick={this.handleCancel}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
        )}

        <Card
          className="tw-card-multiTab"
          bordered={false}
          tabList={operationTabList}
          onTabChange={this.onOperationTabChange}
        >
          {contentList[operationkey]}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default buDetail;
