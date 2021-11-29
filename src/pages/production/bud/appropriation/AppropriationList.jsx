import React from 'react';
import { connect } from 'dva';
import { Form, Progress, Tooltip } from 'antd';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import Link from '@/components/production/basic/Link.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
import message from '@/components/production/layout/Message';
// @ts-ignore
import {
  budgetAppropriationListPaging,
  budgetAppropriationLogicalDelete,
} from '@/services/production/bud';
import router from 'umi/router';
import { isNil } from 'ramda';
import { fromQs } from '@/utils/production/stringUtil.ts';
import { outputHandle } from '@/utils/production/outputUtil.ts';

const DOMAIN = 'appropriationList';

@connect(({ loading, dispatch, appropriationList }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...appropriationList,
}))
class AppropriationList extends React.PureComponent {
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
    const { data } = await outputHandle(budgetAppropriationListPaging, { ...params, budgetId });
    return data;
  };

  deleteData = async keys => {
    const { data } = await outputHandle(budgetAppropriationLogicalDelete, { keys: keys.join(',') });
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

  renderSearchForm = () => [
    <SearchFormItem
      key="appropriationName"
      fieldType="BaseInput"
      label="名称"
      fieldKey="appropriationName"
      defaultShow
      advanced
    />,
  ];

  render() {
    const { form, treeLoading, formData, formMode, selectionList, ...rest } = this.props;

    const columns = [
      {
        title: '名称',
        dataIndex: 'appropriationName',
        ellipsis: true,
        sorter: true,
        render: (value, row, index) => (
          <Link
            onClick={() =>
              router.push(`/workTable/bud/appropriationDisplayPage?id=${row.id}&mode=DESCRIPTION`)
            }
          >
            {value}
          </Link>
        ),
      },

      {
        title: '拨款金额',
        dataIndex: 'applyAmt',
        className: 'prod-number-description',
        render: (value, row, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '状态',
        dataIndex: 'appropriationStatusDesc',
      },
      {
        title: '申请人',
        dataIndex: 'applyResName',
      },
      {
        title: '申请日期',
        dataIndex: 'applyDate',
      },
    ];

    return (
      <PageWrapper>
        <SearchTable
          selectType={null}
          searchTitle={undefined}
          defaultAdvancedSearch={false}
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          fetchData={this.fetchData}
          columns={columns}
          // onAddClick={() => router.push('/workTable/bud/appropriationDisplayPage?mode=EDIT')}
          // onEditClick={data => {
          //   if (data.appropriationStatus === 'CREATE') {
          //     router.push(`/workTable/bud/appropriationDisplayPage?id=${data.id}&mode=EDIT`);
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

export default AppropriationList;
