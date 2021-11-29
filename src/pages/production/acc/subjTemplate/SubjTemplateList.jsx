import React from 'react';
import { connect } from 'dva';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable from '@/components/production/business/SearchTable';
// @ts-ignore
import { subjectTemplateListPaging, subjectTemplateLogicalDelete } from '@/services/production/acc';
import router from 'umi/router';

const DOMAIN = 'subjectTemplateList';

@connect(({ loading, dispatch, subjectTemplateList }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...subjectTemplateList,
}))
class LocaleList extends React.PureComponent {
  componentDidMount() {}

  fetchData = async params => {
    const { response } = await subjectTemplateListPaging(params);
    return response.data;
  };

  deleteData = async keys => {
    const { response } = await subjectTemplateLogicalDelete({ keys: keys.join(',') });
    return response.data;
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
      key="tmplCode"
      fieldType="BaseInput"
      label="编码"
      fieldKey="tmplCode"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="tmplName"
      fieldType="BaseInput"
      label="名称"
      fieldKey="tmplName"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="tmplType"
      fieldType="BaseSelect"
      label="类别"
      fieldKey="tmplType"
      defaultShow
      advanced={false}
      parentKey="ACC:SUBJECT_TEMPLATE:TYPE"
    />,
    <SearchFormItem
      key="enabledFlag"
      fieldType="BaseSelect"
      label="状态"
      fieldKey="enabledFlag"
      defaultShow
      advanced={false}
      parentKey="COM:ENABLE_FLAG"
    />,
  ];

  render() {
    const { form, treeLoading, formData, formMode, selectionList, ...rest } = this.props;

    const columns = [
      {
        title: '编码',
        dataIndex: 'tmplCode',
        align: 'center',
        ellipsis: true,
      },
      {
        title: '名称',
        dataIndex: 'tmplName',
        ellipsis: true,
        align: 'center',
        sorter: true,
        render: (value, row, index) => (
          <Link
            onClick={() =>
              router.push(
                `/workTable/subject/subjTemplateDisplayPage?id=${row.id}&mode=DESCRIPTION`
              )
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '类别',
        dataIndex: 'tmplTypeDesc',
        align: 'center',
        ellipsis: true,
      },
      {
        title: '适用类型',
        dataIndex: 'suitTypeDesc',
        align: 'center',
        ellipsis: true,
      },
      {
        title: '状态',
        dataIndex: 'enabledFlagDesc',
        align: 'center',
        ellipsis: true,
      },
    ];

    return (
      <PageWrapper>
        <SearchTable
          searchTitle={undefined}
          defaultAdvancedSearch={false}
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          fetchData={this.fetchData}
          columns={columns}
          onAddClick={() => router.push('/workTable/subject/subjTemplateDisplayPage?mode=EDIT')}
          onEditClick={data =>
            router.push(`/workTable/subject/subjTemplateDisplayPage?id=${data.id}&mode=EDIT`)
          }
          deleteData={this.deleteData}
        />
      </PageWrapper>
    );
  }
}

export default LocaleList;
