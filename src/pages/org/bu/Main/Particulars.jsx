import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import classnames from 'classnames';
import { Button, Card } from 'antd';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Loading from '@/components/core/DataLoading';
import BuBasicInfo from './Particulars/BasicInfo';
import BuCatsInfo from './Particulars/BuCatsInfo';
import BuFinanceInfo from './Particulars/BuFinanceInfo';
import BuResInfo from './Particulars/BuResInfo';
import BuBusinessScope from './Particulars/BuBusinessScope';
import BuBusinessTarget from './Particulars/BuBusinessTarget';
import Partner from './Particulars/Partner';
import Eqva from './Particulars/Eqva';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';

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
  loading: loading.effects[`${DOMAIN}/getSingle`],
  orgbu,
}))
class BuParticulars extends PureComponent {
  state = {
    myBuId: 0,
    operationkey: 'BasicInfo',
  };

  componentDidMount() {
    const { buId } = fromQs();
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getSingle`,
      payload: {
        buId: buId || 0,
      },
    }).then(myBuId => this.setState({ myBuId }));
  }

  handleBack = () => {
    router.push(`/org/bu/main`);
  };

  onOperationTabChange = key => {
    this.setState({ operationkey: key });
  };

  render() {
    const { dispatch, loading } = this.props;
    const { operationkey, myBuId } = this.state;
    const buId = fromQs().buId || myBuId;
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

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={() => {
              closeThenGoto(`/org/bu/main`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-multiTab"
          bordered={false}
          tabList={operationTabList}
          onTabChange={this.onOperationTabChange}
        >
          {!loading ? contentList[operationkey] : <Loading />}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BuParticulars;
