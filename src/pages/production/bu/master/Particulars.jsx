import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import classnames from 'classnames';
import { Button, Card } from 'antd';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Loading from '@/components/core/DataLoading';
import BuBasicInfo from './Particulars/BasicInfo';
import BuResInfo from './Particulars/BuResInfo';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'orgbuLinmon';

const operationTabList = [
  {
    key: 'BasicInfo',
    tab: '基本信息',
  },
  {
    key: 'ResInfo',
    tab: '资源信息',
  },
];

@connect(({ loading, orgbuLinmon }) => ({
  loading: loading.effects[`${DOMAIN}/getSingle`],
  orgbuLinmon,
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
      ResInfo: <BuResInfo buId={buId} dispatch={dispatch} />,
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
