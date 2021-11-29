import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Button, Card, DatePicker, Form } from 'antd';
import classnames from 'classnames';
import { isEmpty } from 'ramda';

import { fromQs } from '@/utils/stringUtils';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';

import { infoEditTabList } from '@/pages/plat/res/profile/config';
import infoEditTaskOne from './infoEditTaskOne';

// tab的页面
const { CenterBasicInfo, Edubg, Workbg, ProExp, Finance, SelfEvaluation } = infoEditTaskOne;

const DOMAIN = 'userCenterInfoDetail';
@connect(({ loading, userCenterInfoDetail }) => ({
  loading,
  userCenterInfoDetail,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const key = Object.keys(changedFields)[0];
    const value = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { key, value: value.value },
    });
  },
})
@mountToTab()
class InfoDetailsTaskOne extends PureComponent {
  state = {
    operationkey: 'basic',
  };

  onOperationTabChange = key => {
    this.setState({ operationkey: key });
  };

  render() {
    const { form } = this.props;
    const { operationkey } = this.state;
    const contentList = {
      basic: <CenterBasicInfo form={form} domain={DOMAIN} />,
      edubg: <Edubg />,
      workbg: <Workbg />,
      proExp: <ProExp />,
      financeInfo: <Finance />,
      selfEvaluation: <SelfEvaluation />,
    };

    return (
      <Card
        className="tw-card-multiTab"
        bordered={false}
        activeTabKey={operationkey}
        tabList={infoEditTabList}
        onTabChange={this.onOperationTabChange}
      >
        {contentList[operationkey]}
      </Card>
    );
  }
}

export default InfoDetailsTaskOne;
