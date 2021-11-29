import React from 'react';
import { connect } from 'dva';
import { Form, Modal } from 'antd';
import router from 'umi/router';
import { isEmpty } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import PageWrapper from '@/components/production/layout/PageWrapper';
import { createConfirm } from '@/components/core/Confirm';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import createMessage from '@/components/core/AlertMessage';
import { outputHandle } from '@/utils/production/outputUtil';
import {
  ProductTableColumnsBlockConfig,
  ProductSearchFormItemBlockConfig,
} from '@/utils/pageConfigUtils';
import { remindString } from '@/components/production/basic/Remind';

// @ts-ignore
import {
  projectManagementPgingRq,
  projectManagementDeleteRq,
  projectManagementPartialRq,
} from '@/services/workbench/project';

const DOMAIN = 'projectMgmtList';

@connect(({ loading, dispatch, projectMgmtList }) => ({
  treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...projectMgmtList,
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
class index extends React.PureComponent {
  state = {};

  componentDidMount() {
    // this.callModelEffects("init")
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PROJECT_TABLE' },
    });
  }

  fetchData = async params => {
    const { createTime, ...restparams } = params;
    if (Array.isArray(createTime) && (createTime[0] || createTime[1])) {
      [restparams.createTimeStart, restparams.createTimeEnd] = createTime;
    }

    const { response } = await projectManagementPgingRq(restparams);
    return response.data;
  };

  skip = row => {
    const { projectClass1, projectClass2 } = row;
    if (projectClass1 === 'PROJECT' && projectClass2 === 'PRODUCTION_DEPT') {
      router.push(
        `/workTable/projectMgmt/projectMgmtList/projectOverview?id=${row.id}&mode=DESCRIPTION`
      );
    } else {
      router.push(`/workTable/projectMgmt/projectMgmtList/detail?id=${row.id}&mode=DESCRIPTION`);
    }
  };

  deleteData = async keys =>
    outputHandle(projectManagementDeleteRq, { ids: keys.join(',') }, undefined, false);

  changeStatus = async parmars => {
    const { response } = await projectManagementPartialRq(parmars);
    return response.data;
  };

  renderSearchForm = () => {
    const { pageConfig } = this.props;

    const fields = [
      <SearchFormItem
        key="projectNameOrNo"
        fieldKey="projectNameOrNo"
        label="项目编号/名称"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        key="inchargeCompany"
        label="所属公司"
        fieldType="BaseCustomSelect"
        fieldKey="inchargeCompany"
        parentKey="CUS:INTERNAL_COMPANY"
        defaultShow
      />,
      <SearchFormItem
        key="inchargeBuId"
        label="项目负责部门"
        fieldType="BuSimpleSelect"
        fieldKey="inchargeBuId"
        defaultShow
      />,
      <SearchFormItem
        key="pmResId"
        label="项目负责人"
        fieldType="ResSimpleSelect"
        fieldKey="pmResId"
        defaultShow
      />,
      <SearchFormItem
        key="relatedRes1Id"
        label="项目相关资源"
        fieldType="ResSimpleSelect"
        fieldKey="relatedRes1Id"
        defaultShow
      />,
      <SearchFormItem
        label="项目类型1"
        fieldKey="projectClass1"
        key="projectClass1"
        fieldType="BaseCustomSelect"
        parentKey="CUS:PROJECT_CLASS1"
        defaultShow
      />,
      <SearchFormItem
        label="项目类型2"
        fieldKey="projectClass2"
        key="projectClass2"
        fieldType="BaseCustomSelect"
        parentKey="CUS:PROJECT_CLASS2"
        defaultShow
      />,
      <SearchFormItem
        label="项目状态"
        fieldKey="projectStatus"
        key="projectStatus"
        fieldType="BaseSelect"
        parentKey="PRO:PROJECT_STATUS"
        defaultShow
      />,
      <SearchFormItem
        label="相关产品"
        fieldKey="relatedProductId"
        key="relatedProductId"
        fieldType="ProductSimpleSelect"
        defaultShow
      />,

      <SearchFormItem
        key="createUserId"
        label="创建人"
        fieldType="UserSimpleSelect"
        fieldKey="createUserId"
        defaultShow
      />,
      <SearchFormItem
        key="createTime"
        label="创建时间"
        fieldType="BaseDateRangePicker"
        fieldKey="createTime"
        defaultShow
      />,
    ];

    const fieldsConfig = ProductSearchFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'PROJECT_TABLE_SEARCHFORMITEM',
      fields
    );

    return fieldsConfig;
  };

  renderColumns = () => {
    const { pageConfig } = this.props;

    const fields = [
      {
        title: '项目编号',
        key: 'projectNo',
        dataIndex: 'projectNo',
        align: 'center',
        sorter: true,
        render: (value, row) => <Link onClick={() => this.skip(row)}>{value}</Link>,
      },
      {
        title: '项目名称',
        key: 'projectName',
        dataIndex: 'projectName',
        align: 'center',
      },
      {
        title: '相关产品',
        key: 'relatedProductId',
        dataIndex: 'relatedProductIdDesc',
        align: 'center',
      },
      {
        title: '项目类型1',
        key: 'projectClass1',
        dataIndex: 'projectClass1Desc',
        align: 'center',
      },
      {
        title: '项目类型2',
        key: 'projectClass2',
        dataIndex: 'projectClass2Desc',
        align: 'center',
      },
      {
        title: '项目状态',
        key: 'projectStatus',
        dataIndex: 'projectStatusDesc',
        align: 'center',
      },
      {
        title: '所属公司',
        key: 'inchargeCompany',
        dataIndex: 'inchargeCompanyDesc',
        align: 'center',
      },
      {
        title: '项目负责部门',
        key: 'inchargeBuId',
        dataIndex: 'inchargeBuIdDesc',
        align: 'center',
      },
      {
        title: '项目负责人',
        key: 'pmResId',
        dataIndex: 'pmResIdDesc',
        align: 'center',
      },
      {
        title: '项目相关资源2',
        key: 'relatedRes2Id',
        dataIndex: 'relatedRes2IdDesc',
        align: 'center',
      },
      {
        title: '项目相关资源3',
        key: 'relatedRes3Id',
        dataIndex: 'relatedRes3IdDesc',
        align: 'center',
      },
      {
        title: '项目相关资源1',
        key: 'relatedRes1Id',
        dataIndex: 'relatedRes1IdDesc',
        align: 'center',
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
        render: value => value.replace('T', ' '),
      },
    ];

    const fieldsConfig = ProductTableColumnsBlockConfig(
      pageConfig,
      'blockKey',
      'PROJECT_TABLE_COLUMNS',
      fields
    );

    return fieldsConfig;
  };

  render() {
    const { getInternalState } = this.state;

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
          onAddClick={() => router.push('/workTable/projectMgmt/projectMgmtList/edit')}
          onEditClick={data => {
            const { selectedRows } = getInternalState();
            const tt = selectedRows.filter(v => v.projectStatus !== 'CREATE');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: remindString({
                  remindCode: 'COM:E:ALLOW_MODIFY_CHECK',
                  defaultMessage: `仅“新建”状态允许修改！`,
                }),
              });
              return;
            }
            router.push(`/workTable/projectMgmt/projectMgmtList/edit?id=${data.id}&mode=EDIT`);
          }}
          deleteData={data => {
            const { selectedRows } = getInternalState();
            const tt = selectedRows.filter(v => v.projectStatus !== 'CREATE');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: remindString({
                  remindCode: 'COM:ALLOW_DELETE_CHECK',
                  defaultMessage: `仅“新建”状态的项目允许删除！`,
                }),
              });
              return Promise.resolve({ ok: false });
            }
            return this.deleteData(data);
          }}
          tableExtraProps={{
            scroll: {
              x: 2400,
            },
          }}
          extraButtons={[
            {
              key: 'adjust',
              title: '调整',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                // eslint-disable-next-line no-console
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(v => v.projectStatus !== 'ACTIVE');
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: remindString({
                      remindCode: 'COM:ALLOW_ADJUST_CHECK',
                      defaultMessage: `仅“激活”状态允许调整！`,
                    }),
                  });
                  return;
                }
                router.push(
                  `/workTable/projectMgmt/projectMgmtList/edit?id=${
                    selectedRows[0].id
                  }&mode=EDIT&scene=adjust`
                );
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'active',
              title: '激活',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(v => v.projectStatus !== 'CLOSE');
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: remindString({
                      remindCode: 'COM:E:ALLOW_REACTIVE_CHECK',
                      defaultMessage: `仅“已关闭”的项目允许激活！`,
                    }),
                  });
                  return;
                }

                createConfirm({
                  content: remindString({
                    remindCode: 'COM:W:REACTIVE_WARN',
                    defaultMessage: '继续操作将重新激活选中的数据，请确认是否继续？',
                  }),
                  onOk: () => {
                    this.changeStatus({
                      id: selectedRowKeys.join(','),
                      projectStatus: 'ACTIVE',
                    }).then(res => {
                      const { refreshData } = internalState;
                      refreshData();
                    });
                  },
                });
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'close',
              title: '关闭',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(v => v.projectStatus !== 'ACTIVE');
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: remindString({
                      remindCode: 'COM:ALLOW_CLOSE_CHECK',
                      defaultMessage: `仅“激活”状态允许关闭！`,
                    }),
                  });
                  return;
                }
                createConfirm({
                  content: remindString({
                    remindCode: 'COM:W:CLOSE_WARN',
                    defaultMessage: '继续操作将关闭选中的数据，请确认是否继续？',
                  }),
                  onOk: () => {
                    this.changeStatus({
                      id: selectedRowKeys.join(','),
                      projectStatus: 'CLOSE',
                    }).then(res => {
                      const { refreshData } = internalState;
                      refreshData();
                    });
                  },
                });
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
          ]}
        />
      </PageWrapper>
    );
  }
}

export default index;
