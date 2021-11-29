import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Form, Select } from 'antd';
import { formatMessage } from 'umi/locale';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';

import BuDefinition from './Component/BuDefinition';
import PlatDefinition from './Component/PlatDefinition';

const DOMAIN = 'settlePriceManage';

const operationTabList = [
  {
    key: 'BuDefinition',
    tab: '本BU自定义结算价',
  },
  {
    key: 'PlatDefinition',
    tab: '平台定义结算价',
  },
];

@connect(({ loading, settlePriceManage, user }) => ({
  loading,
  settlePriceManage,
  user,
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
class SettlePriceManage extends PureComponent {
  state = {
    operationkey: 'BuDefinition',
  };

  componentDidMount() {
    const urlParm = fromQs();
    const { dispatch } = this.props;
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

  onOperationTabChange = key => {
    this.setState({ operationkey: key });
  };

  render() {
    const { dispatch, user } = this.props;
    const { operationkey } = this.state;
    const { buId } = fromQs();

    const contentList = {
      BuDefinition: <BuDefinition buId={buId} dispatch={dispatch} />,
      PlatDefinition: <PlatDefinition buId={buId} dispatch={dispatch} />,
    };

    return (
      <PageHeaderWrapper>
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

export default SettlePriceManage;
