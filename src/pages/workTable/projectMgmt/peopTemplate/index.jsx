import React from 'react';
import { connect } from 'dva';
import { Form, Switch } from 'antd';
import router from 'umi/router';
import { fromQs } from '@/utils/production/stringUtil';
import { isEmpty } from 'ramda';
import Link from '@/components/production/basic/Link';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { outputHandle } from '@/utils/production/outputUtil';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import {
  ProductTableColumnsBlockConfig,
  ProductSearchFormItemBlockConfig,
} from '@/utils/pageConfigUtils';
// @ts-ignore
import { peopTemplatePagingRq, peopTemplateDeleteRq } from '@/services/workbench/project';

const DOMAIN = 'peopTemplate';

@connect(({ loading, dispatch, peopTemplate }) => ({
  loading,
  dispatch,
  ...peopTemplate,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      if (Array.isArray(tempValue)) {
        tempValue.forEach((temp, index) => {
          Object.keys(temp).forEach(detailKey => {
            fields[`${key}[${index}].${detailKey}`] = Form.createFormField({
              value: temp[detailKey],
            });
          });
        });
      } else {
        fields[key] = Form.createFormField({ value: tempValue });
      }
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };

    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: newFieldData,
    });
  },
})
class perpTemlateList extends React.Component {
  state = {
    projectTemplateId: null,
    expandedRowKeys: [],
  };

  componentDidMount() {
    const { projectTemplateId, _refresh } = fromQs();
    this.setState({
      projectTemplateId,
    });
    if (_refresh === 0) {
      const { getInternalState } = this.state;
      const { refreshData } = getInternalState();
      refreshData();
    }
  }

  fetchData = async params => {
    const { response } = await peopTemplatePagingRq({
      ...params,
      projectTemplateId: fromQs().projectTemplateId,
    });
    return response.data;
  };

  deleteData = async keys =>
    outputHandle(peopTemplateDeleteRq, { ids: keys.join(',') }, undefined, false);

  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  renderColumns = () => {
    const { pageConfig } = this.props;

    const fields = [
      {
        title: '项目角色',
        key: 'id',
        dataIndex: 'projectRole',
        align: 'center',
      },
      {
        title: '所属小组',
        key: 'memberGroupDesc',
        dataIndex: 'memberGroupDesc',
        align: 'center',
      },
      {
        title: '备注',
        key: 'remark',
        dataIndex: 'remark',
        align: 'center',
      },
    ];

    return fields;
  };

  renderSearchForm = () => {
    const { pageConfig } = this.props;

    const fields = [
      <SearchFormItem
        key="projectRole"
        fieldKey="projectRole"
        label="项目角色"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="所属小组"
        fieldKey="memberGroup"
        key="memberGroup"
        fieldType="BaseCustomSelect"
        parentKey="CUS:MEMBER_GROUP"
        defaultShow
      />,
    ];

    return fields;
  };

  // onExpand = (expanded, record) => {
  //   const { expandedRowKeys } = this.state;
  //   if (expanded) {
  //     this.setState({
  //       expandedRowKeys: [...expandedRowKeys, record.id],
  //     });
  //   } else {
  //     this.setState({
  //       expandedRowKeys: expandedRowKeys.filter(v => v !== record.id),
  //     });
  //   }
  // };

  render() {
    const { dispatch } = this.props;

    const {
      getInternalState,
      visible,
      expandedRowKeys,
      executeStatus,
      projectTemplateId,
    } = this.state;
    return (
      <PageWrapper>
        <SearchTable
          autoSearch
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{
            projectTemplateId,
          }}
          fetchData={this.fetchData}
          columns={this.renderColumns()}
          onAddClick={() =>
            router.push(
              `/workTable/projectMgmt/peopTemplate/edit?projectTemplateId=${projectTemplateId}`
            )
          }
          onEditClick={data =>
            router.push(
              `/workTable/projectMgmt/peopTemplate/edit?id=${
                data.id
              }&projectTemplateId=${projectTemplateId}&mode=EDIT`
            )
          }
          deleteData={data => this.deleteData(data)}
          extraButtons={[]}
        />
      </PageWrapper>
    );
  }
}
export default perpTemlateList;
