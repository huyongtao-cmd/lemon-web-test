import React from 'react';
import { connect } from 'dva';

import { Form, Switch } from 'antd';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { outputHandle } from '@/utils/production/outputUtil';

// @ts-ignore
import {
  rulesTemplatePagingRq,
  rulesTemplateDeleteRq,
  rulesTemplateChangeDisableRq,
} from '@/services/workbench/contract';
import router from 'umi/router';

const DOMAIN = 'ruleTemplateMgmt';

@connect(({ loading, dispatch, ruleTemplateMgmt }) => ({
  treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...ruleTemplateMgmt,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      fields[key] = Form.createFormField({ value: tempValue });
    });
    return fields;
  },
})
class list extends React.PureComponent {
  state = {};

  componentDidMount() {
    this.callModelEffects('init');
    // const { dispatch } = this.props;
    // dispatch({
    //   type: `${DOMAIN}/getPageConfig`,
    //   payload: { pageNo: 'PROD_CONTACT_LIST' },
    // });
  }

  fetchData = async params => {
    const { response } = await rulesTemplatePagingRq(params);
    return response.data;
  };

  deleteData = async keys =>
    outputHandle(rulesTemplateDeleteRq, { ids: keys.join(',') }, undefined, false);

  changeStatus = async parmars => {
    const { response } = await rulesTemplateChangeDisableRq(parmars);
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

  onSelect = selectedKeys => {
    this.callModelEffects('handleSelectChange', { id: selectedKeys[0] });
  };

  renderSearchForm = () => {
    const { dispatch, associatedObjectClass1List, associatedObjectClass2List } = this.props;
    const { getInternalState = () => {} } = this.state;
    const internalState = getInternalState();

    return [
      <SearchFormItem
        key="rulesTemplateName"
        fieldKey="rulesTemplateName"
        label="规则模板名称"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        key="associatedObject"
        label="关联对象"
        fieldType="BaseSelect"
        fieldKey="associatedObject"
        parentKey="COM:ASSOCIATED_OBJECT"
        defaultShow
        onChange={(value, option, allOptions) => {
          internalState.form.setFieldsValue({
            associatedObjectClass1: null,
          });
          internalState.form.setFieldsValue({
            associatedObjectClass2: null,
          });

          if (!value) {
            this.setState({
              associatedObjectClass1Code: null,
            });
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                associatedObjectClass1List: [],
                associatedObjectClass2List: [],
              },
            });
            return;
          }

          const { extVarchar1 } = allOptions[0];
          this.setState({
            associatedObjectClass1Code: extVarchar1,
          });
          dispatch({
            type: `${DOMAIN}/queryAssociatedObjectClass1`,
            payload: extVarchar1,
          });
        }}
      />,
      <SearchFormItem
        label="关联分类对象1"
        key="associatedObjectClass1"
        fieldKey="associatedObjectClass1"
        fieldType="BaseSelect"
        descList={associatedObjectClass1List}
        defaultShow
        onChange={(value, option, allOptions) => {
          internalState.form.setFieldsValue({
            associatedObjectClass2: null,
          });

          if (!value) {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                associatedObjectClass2List: [],
              },
            });
            return;
          }

          const { associatedObjectClass1Code } = this.state;
          dispatch({
            type: `${DOMAIN}/queryAssociatedObjectClass2`,
            payload: {
              key: associatedObjectClass1Code,
              cascaderValues: value,
            },
          });
        }}
      />,
      <SearchFormItem
        label="关联分类对象2"
        key="associatedObjectClass2"
        fieldKey="associatedObjectClass2"
        fieldType="BaseSelect"
        descList={associatedObjectClass2List}
        defaultShow
      />,
      <SearchFormItem
        key="isDisabled"
        label="状态"
        fieldType="BaseSelect"
        fieldKey="isDisabled"
        parentKey="COM:ENABLE_FLAG"
        defaultShow
      />,
    ];
  };

  render() {
    const { pageConfig, formData, formMode, form, dispatch } = this.props;
    const { getInternalState } = this.state;

    const columns = [
      {
        title: '规则模板名称',
        key: 'rulesTemplateName',
        dataIndex: 'rulesTemplateName',
        align: 'center',
        // sorter: true,
        width: '30%',
        render: (value, row, index) => (
          <Link
            onClick={() =>
              router.push(
                `/workTable/contractMgmt/ruleTemplateMgmt/detail?id=${row.id}&mode=DESCRIPTION`
              )
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '关联对象',
        key: 'associatedObject',
        dataIndex: 'associatedObjectDesc',
        align: 'center',
        width: '20%',
      },
      {
        title: '关联对象分类1',
        key: 'associatedObjectClass1',
        dataIndex: 'associatedObjectClass1Desc',
        align: 'center',
        width: '20%',
      },
      {
        title: '关联对象分类2',
        key: 'associatedObjectClass2',
        dataIndex: 'associatedObjectClass2Desc',
        align: 'center',
        width: '20%',
      },
      {
        title: '状态',
        key: 'isDisabled',
        dataIndex: 'isDisabled',
        align: 'center',
        width: '10%',
        render: (val, row) => (
          <Switch
            checkedChildren="有效"
            unCheckedChildren="无效"
            checked={val}
            onChange={e => {
              this.changeStatus({ ids: row.id, isDisabled: e }).then(res => {
                const { refreshData } = getInternalState();
                refreshData();
              });
            }}
          />
        ),
      },
    ];

    return (
      <PageWrapper>
        <SearchTable
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          fetchData={this.fetchData}
          columns={columns}
          onAddClick={() => router.push('/workTable/contractMgmt/ruleTemplateMgmt/edit')}
          onEditClick={data =>
            router.push(`/workTable/contractMgmt/ruleTemplateMgmt/edit?id=${data.id}&mode=EDIT`)
          }
          deleteData={this.deleteData}
          // defaultAdvancedSearch
          // tableExtraProps={{
          //   scroll: {
          //     x: 3300,
          //   },
          // }}
          extraButtons={[]}
        />
      </PageWrapper>
    );
  }
}

export default list;
