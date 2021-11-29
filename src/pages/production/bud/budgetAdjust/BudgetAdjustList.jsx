import React from 'react';
import { connect } from 'dva';
import { Form, Progress, Tooltip } from 'antd';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import Link from '@/components/production/basic/Link.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
import message from '@/components/production/layout/Message';
// @ts-ignore
import { budgetAdjustListPaging, budgetLogicalDelete } from '@/services/production/bud';
import router from 'umi/router';
import { isNil } from 'ramda';
import { fromQs } from '@/utils/production/stringUtil.ts';
import { outputHandle } from '@/utils/production/outputUtil.ts';

const DOMAIN = 'appropriationList';

@connect(({ loading, dispatch, budgetAdjustList }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...budgetAdjustList,
}))
class BudgetAdjustList extends React.PureComponent {
  constructor(props) {
    super(props);
    const { budgetId } = fromQs();
    this.state = {
      budgetId,
    };
  }

  componentDidMount() {}

  fetchData = async params => {
    const { budgetId } = this.state;
    const { data } = await outputHandle(budgetAdjustListPaging, { ...params, budgetId });
    return data;
  };

  deleteData = async keys => {
    const { data } = await outputHandle(budgetLogicalDelete, { keys: keys.join(',') });
    return data;
  };

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

  render() {
    const columns = [
      {
        title: '版本',
        dataIndex: 'versionNo',
        sorter: true,
        render: (value, row, index) => (
          <Link
            onClick={() =>
              router.push(`/workTable/bud/budgetAdjustDisplayPage?id=${row.id}&mode=DESCRIPTION`)
            }
          >
            {`v${value}`}
          </Link>
        ),
      },
      {
        title: '调整人',
        dataIndex: 'applyResName',
      },
      {
        title: '调整日期',
        dataIndex: 'applyDate',
        sorter: true,
      },
      {
        title: '状态',
        dataIndex: 'budgetStatusDesc',
      },
    ];

    return (
      <PageWrapper>
        <SearchTable
          selectType={null}
          searchTitle={undefined}
          defaultAdvancedSearch={false}
          showSearchCardTitle={false}
          // searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          fetchData={this.fetchData}
          columns={columns}
          // onAddClick={() => router.push('/workTable/bud/budgetAdjustDisplayPage?mode=EDIT')}
          // onEditClick={data => {
          //   if (data.budgetAdjustStatus === 'CREATE') {
          //     router.push(`/workTable/bud/budgetAdjustDisplayPage?id=${data.id}&mode=EDIT`);
          //   } else {
          //     message({ type: 'error', content: '只有创建状态可以修改！' });
          //   }
          // }}
          // deleteData={this.deleteData}
        />
      </PageWrapper>
    );
  }
}

export default BudgetAdjustList;
