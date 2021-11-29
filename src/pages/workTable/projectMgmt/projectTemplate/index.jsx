import React from 'react';
import { connect } from 'dva';
import { Form, Switch } from 'antd';
import router from 'umi/router';
import { isEmpty } from 'ramda';
import Link from '@/components/production/basic/Link';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { outputHandle } from '@/utils/production/outputUtil';
import moment from 'moment';
import {
  ProductTableColumnsBlockConfig,
  ProductSearchFormItemBlockConfig,
} from '@/utils/pageConfigUtils';
// @ts-ignore
import {
  projectTemplatePagingRq,
  projectTemplateDeleteRq,
  projectTemplatePartialRq,
} from '@/services/workbench/project';

const DOMAIN = 'projectTemplate';

@connect(({ loading, dispatch, projectTemplate }) => ({
  loading,
  dispatch,
  ...projectTemplate,
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
class projectTemp extends React.Component {
  state = {};

  componentDidMount() {
    // this.callModelEffects("init")
    // const { dispatch } = this.props;
    // dispatch({
    //   type: `${DOMAIN}/getPageConfig`,
    //   payload: { pageNo: 'PRODUCT_TABLE' },
    // });
  }

  fetchData = async params => {
    const { response } = await projectTemplatePagingRq(params);
    return response.data;
  };

  deleteData = async keys =>
    outputHandle(projectTemplateDeleteRq, { ids: keys.join(',') }, undefined, false);

  changeStatus = async parmars => {
    const { response } = await projectTemplatePartialRq(parmars);
    return response.data;
  };

  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  renderColumns = () => {
    const { pageConfig } = this.props;
    const { getInternalState } = this.state;

    const fields = [
      {
        title: '模板名称',
        key: 'id',
        dataIndex: 'projectTemplateName',
        align: 'center',
        render: (value, row) => (
          <Link
            onClick={() =>
              router.push(
                `/workTable/projectMgmt/projectTemplate/detail?id=${row.id}&mode=DESCRIPTION`
              )
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '是否有效',
        key: 'enableFlag',
        dataIndex: 'enableFlag',
        align: 'center',
        render: (val, row) => (
          <Switch
            checkedChildren="有效"
            unCheckedChildren="无效"
            checked={val}
            onChange={e =>
              this.changeStatus({ id: row.id, enableFlag: e }).then(res => {
                const { refreshData } = getInternalState();
                refreshData();
              })
            }
          />
        ),
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
        key="projectTemplateName"
        fieldKey="projectTemplateName"
        label="模板名称"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="是否有效"
        fieldKey="enableFlag"
        key="enableFlag"
        fieldType="BaseSelect"
        parentKey="COM:ENABLE_FLAG"
        defaultShow
      />,
    ];

    return fields;
  };

  render() {
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
          columns={this.renderColumns()}
          onAddClick={() => router.push('/workTable/projectMgmt/projectTemplate/edit')}
          onEditClick={data =>
            router.push(`/workTable/projectMgmt/projectTemplate/edit?id=${data.id}&mode=EDIT`)
          }
          deleteData={data => this.deleteData(data)}
          extraButtons={[]}
          autoSearch
        />
      </PageWrapper>
    );
  }
}

export default projectTemp;
