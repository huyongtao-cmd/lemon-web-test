import React from 'react';
import { connect } from 'dva';

import Loading from '@/components/production/basic/Loading';
import TreeSearch from '@/components/production/business/TreeSearch';
import { Form, Row, Col, Button } from 'antd';

import PageWrapper from '@/components/production/layout/PageWrapper';
import TabsCard from '@/components/production/layout/TabsCard';

import FinancialAccSubjTab from './tabs/FinancialAccSubjTab';
import BudgetItemTab from './tabs/BudgetItemTab';
import BusinessAccItemTab from './tabs/BusinessAccItemTab';
// @ts-ignore
import { systemSelectionClearCache } from '@/services/production/system';
import SearchTable from '@/components/production/business/SearchTable.tsx';
import router from 'umi/router';
import Link from '@/components/production/basic/Link.tsx';

const DOMAIN = 'subjectIndex';

@connect(({ loading, dispatch, subjectIndex }) => ({
  treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...subjectIndex,
}))
class SubjectIndex extends React.PureComponent {
  componentDidMount() {
    this.callModelEffects('init');
  }

  // 修改model层state
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  // 调用model层异步方法
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  onSelect = selectedKeys => {
    this.callModelEffects('handleSelectChange', { id: selectedKeys[0] });
  };

  onCheck = () => {};

  render() {
    return (
      <PageWrapper>
        <TabsCard>
          <TabsCard.TabPane key="FinancialAccSubjTab" tab="会计科目">
            <FinancialAccSubjTab />
          </TabsCard.TabPane>
          <TabsCard.TabPane key="BudgetItemTab" tab="预算项目">
            <BudgetItemTab />
          </TabsCard.TabPane>
          <TabsCard.TabPane key="BusinessAccItemTab" tab="核算项目">
            <BusinessAccItemTab />
          </TabsCard.TabPane>
        </TabsCard>
      </PageWrapper>
    );
  }
}

export default SubjectIndex;
