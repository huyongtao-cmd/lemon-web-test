import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Form, Select } from 'antd';
import { formatMessage } from 'umi/locale';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';

import BuDefinition from './Component/BuDefinition';
import ResDefinition from './Component/ResDefinition';

const DOMAIN = 'eqvaSalaryManage';

const operationTabList = [
  {
    key: 'BuDefinition',
    tab: 'BU整体定义',
  },
  {
    key: 'ResDefinition',
    tab: '资源个别定义',
  },
];

@connect(({ loading, eqvaSalaryManage, user }) => ({
  loading,
  eqvaSalaryManage,
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
class EqvaSalaryManage extends PureComponent {
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
      ResDefinition: <ResDefinition buId={buId} dispatch={dispatch} />,
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

export default EqvaSalaryManage;
