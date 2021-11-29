import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { omit } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import Link from '@/components/production/basic/Link.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
// @ts-ignore

import { outputHandle } from '@/utils/production/outputUtil.ts';
import {
  copyrightLogicalDelete,
  copyrightPaging,
} from '@/services/production/adm/copyright/copyright';

const DOMAIN = 'coryrightList';

@connect(({ dispatch, coryrightList }) => ({
  dispatch,
  ...coryrightList,
}))
class Copyrightist extends React.PureComponent {
  fetchData = async params => {
    const { signDate } = params;
    let a = {};
    if (signDate !== undefined && signDate.length === 2) {
      const [signDateFrom, signDateTo] = signDate;
      a = { signDateFrom, signDateTo };
    }
    const { authorizedDate } = params;
    let b = {};
    if (authorizedDate !== undefined && authorizedDate.length === 2) {
      const [authorizedStartDate, authorizedEndDate] = authorizedDate;
      b = { authorizedStartDate, authorizedEndDate };
    }
    const queryPatams = { ...params, ...a, ...b };
    const { data } = await outputHandle(copyrightPaging, {
      ...omit(['signDate', 'authorizedDate'], queryPatams),
    });
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

  deleteData = async keys =>
    outputHandle(copyrightLogicalDelete, { keyArr: keys.join(',') }, undefined, false);

  renderSearchForm = () => [
    <SearchFormItem
      key="copyrightName"
      fieldKey="copyrightName"
      fieldType="BaseInput"
      label="名称"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="copyrightType"
      fieldKey="copyrightType"
      fieldType="BaseCustomSelect"
      label="版权类型"
      defaultShow
      parentKey="CUS:COPYRIGHT_TYPE"
      advanced
    />,
    <SearchFormItem
      key="authorizedScope"
      fieldKey="authorizedScope"
      fieldType="BaseCustomSelect"
      label="授权范围"
      defaultShow
      parentKey="CUS:AUTHORIZED_SCOPE"
      advanced
    />,
    <SearchFormItem
      key="copyrightStatus"
      fieldKey="copyrightStatus"
      fieldType="BaseCustomSelect"
      label="状态"
      defaultShow
      advanced
      parentKey="CUS:COPYRIGHT_STATUS"
    />,
    <SearchFormItem
      key="contractId"
      fieldKey="contractId"
      fieldType="ContractSimpleSelect"
      label="相关合同"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="signDate"
      fieldKey="signDate"
      fieldType="BaseDateRangePicker"
      label="签约日期"
      defaultShow
    />,
    <SearchFormItem
      key="authorizedDate"
      fieldKey="authorizedDate"
      fieldType="BaseDateRangePicker"
      label="版权周期起始日"
      defaultShow
    />,
    <SearchFormItem
      key="author"
      fieldKey="author"
      fieldType="BaseInput"
      label="作者"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="copyrightPicResId"
      fieldKey="copyrightPicResId"
      fieldType="ResSimpleSelect"
      label="版权负责人"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="createUserId"
      fieldKey="createUserId"
      fieldType="UserSimpleSelect"
      label="创建人"
      defaultShow
    />,
  ];

  render() {
    const { form, formData, formMode, selectionList } = this.props;
    const columns = [
      {
        title: '名称',
        dataIndex: 'copyrightName',
        ellipsis: true,
        render: (value, row) => (
          <Link
            onClick={() =>
              router.push(`/workTable/adm/copyrightDisplayPage?id=${row.id}&mode=DESCRIPTION`)
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '版权类型',
        dataIndex: 'copyrightTypeDesc',
        ellipsis: true,
      },
      {
        title: '授权范围',
        dataIndex: 'authorizedScopeDesc',
        ellipsis: true,
      },
      {
        title: '申请状态',
        dataIndex: 'copyrightStatusDesc',
        ellipsis: true,
      },
      {
        title: '相关合同',
        dataIndex: 'contractDesc',
        render: (value, row) => (
          <Link
            onClick={() =>
              router.push(
                `/workTable/contractMgmt/contractList/detail?id=${row.contractId}&mode=DESCRIPTION`
              )
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '签约日期',
        dataIndex: 'signDate',
        ellipsis: true,
      },
      {
        title: '币种',
        dataIndex: 'currCodeDesc',
        ellipsis: true,
      },
      {
        title: '版权金额',
        dataIndex: 'copyrightAmt',
        ellipsis: true,
        align: 'right',
      },
      {
        title: '版权周期',
        dataIndex: 'authorizedDate',
        ellipsis: true,
        render: (value, row) => row.authorizedStartDate + '~' + row.authorizedEndDate,
      },
      {
        title: '作者',
        dataIndex: 'author',
        ellipsis: true,
      },
      {
        title: '版权负责人',
        dataIndex: 'copyrightPicResDesc',
        ellipsis: true,
      },
      {
        title: '创建人',
        dataIndex: 'createUserDesc',
        ellipsis: true,
      },
    ];

    return (
      <PageWrapper>
        <SearchTable
          searchTitle={undefined}
          defaultAdvancedSearch={false}
          showSearchCardTitle={false}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          autoSearch
          fetchData={this.fetchData}
          columns={columns}
          // tableExtraProps={{ scroll: { x: 2400 } }}
          onAddClick={() => router.push('/workTable/adm/copyrightDisplayPage?mode=EDIT')}
          onEditClick={data => {
            router.push(`/workTable/adm/copyrightDisplayPage?id=${data.id}&mode=EDIT`);
          }}
          deleteData={this.deleteData}
        />
      </PageWrapper>
    );
  }
}

export default Copyrightist;
