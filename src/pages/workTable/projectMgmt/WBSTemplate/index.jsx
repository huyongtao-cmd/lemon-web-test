import React from 'react';
import { connect } from 'dva';
import { Form, Switch } from 'antd';
import router from 'umi/router';
import { isEmpty } from 'ramda';
import Link from '@/components/production/basic/Link';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import { createConfirm } from '@/components/core/Confirm';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { outputHandle } from '@/utils/production/outputUtil';
import { fromQs } from '@/utils/production/stringUtil';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import {
  ProductTableColumnsBlockConfig,
  ProductSearchFormItemBlockConfig,
} from '@/utils/pageConfigUtils';
// @ts-ignore
import {
  WBSTemplatePagingRq,
  templatePhaseDeleteRq,
  templatePlanDeleteRq,
} from '@/services/workbench/project';

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
class WBSTemplate extends React.Component {
  state = {};

  componentDidMount() {
    const { projectTemplateId } = fromQs();
    this.setState({
      projectTemplateId,
    });
  }

  fetchData = async params => {
    let obj = {};
    if (fromQs().projectTemplateId) {
      const { response } = await WBSTemplatePagingRq({
        ...params,
        projectTemplateId: fromQs().projectTemplateId,
      });
      this.setState({
        expandedRowKeys: response.data.rows.map(v => v.id),
      });
      obj = {
        rows: response.data.rows.map(v => ({
          ...v,
          planNo: v.phaseNo,
          planName: v.phaseName,
        })),
        total: 0,
      };
    }
    return obj;
  };

  deleteData = async parmars => {
    const { planType, ...resParams } = parmars;
    if (planType) {
      // 计划删除
      const { response } = await templatePlanDeleteRq(resParams);
      return response.data;
    }
    // 阶段删除
    const { response } = await templatePhaseDeleteRq(resParams);
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

    const fields = [
      {
        title: '编号',
        key: 'phasePlanNo',
        dataIndex: 'phasePlanNo',
        align: 'center',
      },
      {
        title: '名称',
        key: 'phasePlanName',
        dataIndex: 'phasePlanName',
        align: 'center',
      },
      {
        title: '类型',
        key: 'planTypeDesc',
        dataIndex: 'planTypeDesc',
        align: 'center',
      },
      {
        title: '备注',
        key: 'phasePlanRemark',
        dataIndex: 'phasePlanRemark',
        align: 'center',
      },
    ];

    return fields;
  };

  renderSearchForm = () => {
    const { pageConfig } = this.props;

    const fields = [
      <SearchFormItem
        key="phasePlanNo"
        fieldKey="phasePlanNo"
        label="阶段编号"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        key="phasePlanName"
        fieldKey="phasePlanName"
        label="阶段名称"
        fieldType="BaseInput"
        defaultShow
      />,
      // <SearchFormItem
      //   label="计划类型"
      //   fieldKey="planType"
      //   key="planType"
      //   fieldType="BaseCustomSelect"
      //   parentKey="CUS:PLAN_TYPE"
      // />,
    ];

    return fields;
  };

  onExpand = (expanded, record) => {
    const { expandedRowKeys } = this.state;
    if (expanded) {
      this.setState({
        expandedRowKeys: [...expandedRowKeys, record.uniqueId],
      });
    } else {
      this.setState({
        expandedRowKeys: expandedRowKeys.filter(v => v !== record.uniqueId),
      });
    }
  };

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
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          defaultSortBy="uniqueId"
          defaultSortDirection="DESC"
          showSearchCardTitle={false}
          rowKey="uniqueId"
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{ projectTemplateId }}
          tableExtraProps={{
            pagination: false,
            expandedRowKeys,
            onExpand: this.onExpand,
          }}
          fetchData={this.fetchData}
          columns={this.renderColumns()}
          extraButtons={[
            {
              key: 'increasedPhase',
              title: '新增阶段',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                router.push(
                  `/workTable/projectMgmt/WBSTemplate/phaseEdit?projectTemplateId=${projectTemplateId}`
                );
              },
              // disabled: internalState => !projectId,
            },
            {
              key: 'updatePhase',
              title: '修改阶段',
              type: 'primary',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRows = [] } = internalState;

                // 阶段没有planType
                return selectedRows.length !== 1 || selectedRows.filter(v => v.planType).length > 0;
              },
              cb: internalState => {
                const { selectedRows } = internalState;
                router.push(
                  `/workTable/projectMgmt/WBSTemplate/phaseEdit?id=${
                    selectedRows[0].id
                  }&projectTemplateId=${projectTemplateId}&mode=EDIT`
                );
              },
            },
            {
              key: 'deletePhase',
              title: '删除阶段',
              type: 'danger',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRows = [] } = internalState;
                return selectedRows.length <= 0 || selectedRows.filter(v => v.planType).length > 0;
              },
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const list = selectedRowKeys.map(item => item.replace('ph', ''));
                const { planType: pt } = selectedRows[0];
                createConfirm({
                  content: '确定删除吗？',
                  onOk: () => {
                    this.deleteData({
                      ids: list.join(','),
                      planType: pt,
                    }).then(res => {
                      const { refreshData } = internalState;
                      refreshData();
                    });
                  },
                });
              },
            },
            {
              key: 'increasedPlan',
              title: '新增计划',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                router.push(
                  `/workTable/projectMgmt/WBSTemplate/planEdit?projectTemplateId=${projectTemplateId}`
                );
              },
            },
            {
              key: 'updatePlan',
              title: '修改计划',
              type: 'primary',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRows = [] } = internalState;

                // 计划有planType
                return (
                  selectedRows.length !== 1 || selectedRows.filter(v => !v.planType).length > 0
                );
              },
              cb: internalState => {
                const { selectedRows } = internalState;
                const { id, planTypeVal1, planType: pt } = selectedRows[0];

                router.push(
                  `/workTable/projectMgmt/WBSTemplate/planEdit?id=${id}&projectTemplateId=${projectTemplateId}&mode=EDIT`
                );
              },
            },
            {
              key: 'deletePlan',
              title: '删除计划',
              type: 'danger',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRows } = internalState;
                return selectedRows.length <= 0 || selectedRows.filter(v => !v.planType).length > 0;
              },
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const list = selectedRowKeys.map(item => item.replace('pl', ''));
                console.log(list);
                const { planType: pt } = selectedRows[0];
                createConfirm({
                  content: '确定删除吗？',
                  onOk: () => {
                    this.deleteData({
                      ids: list.join(','),
                      planType: pt,
                    }).then(res => {
                      const { refreshData } = internalState;
                      refreshData();
                    });
                  },
                });
              },
            },
          ]}
        />
      </PageWrapper>
    );
  }
}
export default WBSTemplate;
