import React from 'react';
import { connect } from 'dva';
import { Form, Card, Radio, Button } from 'antd';
import { isEmpty, equals } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { outputHandle } from '@/utils/production/outputUtil';
import MemberModal from './MemberModal';
import { handleEmptyProps } from '@/utils/production/objectUtils';
import { fromQs } from '@/utils/production/stringUtil';

import { projectMemberPageRq, projectMemberDeleteRq } from '@/services/workbench/project';

const DOMAIN = 'projectMember';

const TYPE_MAP = {
  All: null,
  INTERNAL_RES: 'INTERNAL_RES',
  EXTERNAL_RES: 'EXTERNAL_RES',
  TEMPORARY_RES: 'TEMPORARY_RES',
};

@connect(({ loading, dispatch, projectMember }) => ({
  treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...projectMember,
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
  state = {
    memberTypeValue: null,
  };

  componentDidMount() {
    const { projectId } = fromQs();
    this.setState({
      projectId,
    });
    // this.callModelEffects("init")
    const { dispatch } = this.props;
    // dispatch({
    //   type: `${DOMAIN}/getPageConfig`,
    //   payload: { pageNo: 'PROJECT_TABLE' },
    // });
    // 拉取自定义选择项成员类型数据
    dispatch({
      type: `${DOMAIN}/getMemberType`,
      payload: { key: 'PRO:MEMBER_TYPE' },
    });
  }

  fetchData = async params => {
    const { memberTypeValue } = this.state;

    const { response } = await projectMemberPageRq(
      handleEmptyProps({ ...params, memberType: memberTypeValue, projectId: fromQs().projectId })
    );
    return response.data;
  };

  deleteData = async keys =>
    outputHandle(projectMemberDeleteRq, { ids: keys.join(',') }, undefined, false);

  renderSearchForm = () => {
    // const { pageConfig } = this.props;

    const fields = [
      <SearchFormItem
        key="memberName"
        label="资源姓名"
        fieldType="BaseInput"
        fieldKey="memberName"
        defaultShow
      />,
      <SearchFormItem
        key="memberGroup"
        label="所属小组"
        fieldType="BaseCustomSelect"
        fieldKey="memberGroup"
        parentKey="CUS:MEMBER_GROUP"
        defaultShow
      />,
      // <SearchFormItem
      //   key="memberType"
      //   label="成员类型"
      //   fieldType="BaseSelect"
      //   fieldKey="memberType"
      //   parentKey="PRO:MEMBER_TYPE"
      //   defaultShow
      // />,
    ];

    // const fieldsConfig = ProductSearchFormItemBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PROJECT_TABLE_SEARCHFORMITEM',
    //   fields
    // );

    return fields;
  };

  renderColumns = () => {
    // const { pageConfig } = this.props;

    const fields = [
      {
        title: '项目角色',
        key: 'projectRole',
        dataIndex: 'projectRole',
        align: 'center',
        sorter: true,
      },
      {
        title: '资源编号',
        key: 'memberResNo',
        dataIndex: 'memberResNo',
        align: 'center',
      },
      {
        title: '姓名',
        key: 'memberName',
        dataIndex: 'memberName',
        align: 'center',
      },
      {
        title: '成员类型',
        key: 'memberTypeDesc',
        dataIndex: 'memberTypeDesc',
        align: 'center',
      },
      {
        title: '所属小组',
        key: 'memberGroupDesc',
        dataIndex: 'memberGroupDesc',
        align: 'center',
      },
      {
        title: '联系方式',
        key: 'contactInformation',
        dataIndex: 'contactInformation',
        align: 'center',
      },
      {
        title: '备注',
        key: 'remark',
        dataIndex: 'remark',
        align: 'center',
      },
      {
        title: '预计开始日期',
        key: 'expectStartDate',
        dataIndex: 'expectStartDate',
        align: 'center',
      },
      {
        title: '预计结束日期',
        key: 'expectEndDate',
        dataIndex: 'expectEndDate',
        align: 'center',
      },
    ];

    // const fieldsConfig = ProductTableColumnsBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PROJECT_TABLE_COLUMNS',
    //   fields
    // );

    return fields;
  };

  checkoutType = type => {
    const { getInternalState } = this.state;

    this.setState({ memberTypeValue: type }, () => {
      getInternalState().refreshData();
    });
  };

  render() {
    const { dispatch, memberTypeList } = this.props;

    const { getInternalState, memberTypeValue, projectId } = this.state;

    const isCurrent = type => equals(type, memberTypeValue);
    const className = type => (isCurrent(type) ? 'tw-btn-primary' : 'tw-btn-default');

    return (
      <PageWrapper>
        <Card
          title={
            <Button.Group>
              <Button
                size="large"
                style={{ borderColor: '#284488' }}
                className={className(TYPE_MAP.All)}
                onClick={() => this.checkoutType(TYPE_MAP.All)}
              >
                全部
              </Button>
              {memberTypeList.map(v => (
                <Button
                  key={v.selectionValue}
                  size="large"
                  style={{ borderColor: '#284488' }}
                  className={className(TYPE_MAP[v.selectionValue])}
                  onClick={() => this.checkoutType(TYPE_MAP[v.selectionValue])}
                >
                  {v.selectionName || ''}
                </Button>
              ))}
            </Button.Group>
          }
          bordered={false}
          bodyStyle={{ padding: 0 }}
        />
        <MemberModal
          callBackFun={() => {
            const { refreshData } = getInternalState();
            refreshData();
          }}
          projectId={projectId}
        />
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
          onAddClick={() => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                visible: true,
                tableInternalState: getInternalState(),
              },
            });
          }}
          onEditClick={data => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                visible: true,
                tableInternalState: getInternalState(),
              },
            });

            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: data,
            });
          }}
          deleteData={data => this.deleteData(data)}
          extraButtons={[
            {
              key: 'copy',
              title: '复制',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRows } = internalState;
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    visible: true,
                    tableInternalState: getInternalState(),
                  },
                });

                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    ...selectedRows[0],
                    id: null,
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
