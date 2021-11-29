import React from 'react';
import { connect } from 'dva';
import { Form, Switch } from 'antd';
import router from 'umi/router';
import { isEmpty } from 'ramda';
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
  projectRiskPagingRq,
  projectRiskDeleteRq,
  projectRiskPartialRq,
} from '@/services/workbench/project';
import { fromQs } from '@/utils/production/stringUtil';

const DOMAIN = 'projectRisk';

@connect(({ loading, dispatch, projectRisk }) => ({
  loading,
  dispatch,
  ...projectRisk,
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
class indexCom extends React.PureComponent {
  state = {};

  componentDidMount() {
    // this.callModelEffects("init")
    // const { dispatch } = this.props;
    // dispatch({
    //   type: `${DOMAIN}/getPageConfig`,
    //   payload: { pageNo: 'PRODUCT_TABLE' },
    // });
    const { projectId } = fromQs();
    this.setState({
      projectId,
    });
  }

  fetchData = async params => {
    if (fromQs().projectId) {
      const { response } = await projectRiskPagingRq({ ...params, projectId: fromQs().projectId });
      return response.data;
    }
    const { response } = await projectRiskPagingRq({ ...params });
    return response.data;
  };

  deleteData = async keys =>
    outputHandle(projectRiskDeleteRq, { ids: keys.join(',') }, undefined, false);

  changeStatus = async parmars => {
    const { response } = await projectRiskPartialRq(parmars);
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
        title: '风险等级',
        key: 'riskLevel',
        dataIndex: 'riskLevelDesc',
        align: 'center',
      },
      {
        title: '风险内容',
        key: 'riskContent',
        dataIndex: 'riskContent',
      },
      {
        title: '应对策略',
        key: 'countermeasure',
        dataIndex: 'countermeasure',
      },
      {
        title: '状态',
        key: 'enableFlag',
        dataIndex: 'enableFlag',
        align: 'center',
        render: (val, row) => (
          <Switch
            checkedChildren="有效"
            unCheckedChildren="无效"
            checked={val}
            disabled={!fromQs().projectId}
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
        title: '创建人',
        key: 'createUserId',
        dataIndex: 'createUserIdDesc',
        align: 'center',
      },
      {
        title: '创建时间',
        key: 'createTime',
        dataIndex: 'createTime',
        align: 'center',
        render: val => (val ? moment(val).format('YYYY-MM-DD hh:mm:ss') : ''),
      },
    ];

    // const fieldsConfig = ProductTableColumnsBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PRODUCT_TABLE_COLUMNS',
    //   fields
    // );

    return fields;
  };

  renderSearchForm = () => {
    const { pageConfig } = this.props;

    const fields = [
      <SearchFormItem
        key="projectId"
        fieldKey="projectId"
        label="项目"
        fieldType="ProjectSimpleSelect"
        defaultShow
        visible={!fromQs().projectId}
      />,
      <SearchFormItem
        key="riskContent"
        fieldKey="riskContent"
        label="风险内容"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="风险等级"
        fieldKey="riskLevel"
        key="riskLevel"
        fieldType="BaseCustomSelect"
        parentKey="CUS:RISK_LEVEL"
        defaultShow
      />,
      <SearchFormItem
        label="状态"
        fieldKey="enableFlag"
        key="enableFlag"
        fieldType="BaseSelect"
        parentKey="COM:ENABLE_FLAG"
        defaultShow
      />,
      <SearchFormItem
        key="createUserId"
        label="创建人"
        fieldType="UserSimpleSelect"
        fieldKey="createUserId"
        defaultShow
      />,
    ];

    // const fieldsConfig = ProductSearchFormItemBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PRODUCT_TABLE_SAERCHFORM',
    //   fields
    // );

    return fields;
  };

  render() {
    const { getInternalState, projectId } = this.state;

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
          onAddClick={
            fromQs().projectId
              ? () => {
                  if (fromQs().projectId) {
                    router.push(
                      `/workTable/projectMgmt/projectMgmtList/projectRisk/edit?projectId=${projectId ||
                        ''}`
                    );
                  } else {
                    router.push('/workTable/projectMgmt/projectRisk/edit');
                  }
                }
              : null
          }
          onEditClick={
            fromQs().projectId
              ? data => {
                  if (fromQs().projectId) {
                    router.push(
                      `/workTable/projectMgmt/projectMgmtList/projectRisk/edit?id=${data.id ||
                        ''}&mode=EDIT`
                    );
                  } else {
                    router.push(
                      `/workTable/projectMgmt/projectRisk/edit?id=${data.id || ''}&mode=EDIT`
                    );
                  }
                }
              : null
          }
          deleteData={fromQs().projectId ? data => this.deleteData(data) : null}
          extraButtons={[]}
        />
      </PageWrapper>
    );
  }
}

export default indexCom;
