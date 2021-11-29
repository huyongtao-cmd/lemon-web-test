import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Table } from 'antd';
import { TreeSelect } from '@/pages/gen/modal';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import { ProductFormItemBlockConfig } from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';
import { outputHandle } from '@/utils/production/outputUtil';
import { templatePlanPagingRq } from '@/services/workbench/project';

const DOMAIN = 'planEdit';
@connect(({ user, loading, planEdit, dispatch }) => ({
  loading,
  ...planEdit,
  dispatch,
  user,
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
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class WBSPlanEdit extends React.Component {
  state = {
    planList: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id, projectTemplateId } = fromQs();
    this.setState({ projectTemplateId });
    // 阶段列表 - 根据项目ID拉取阶段
    dispatch({
      type: `${DOMAIN}/projectPhaseList`,
      payload: { limit: 0, projectTemplateId },
    });
    if (id) {
      dispatch({
        type: `${DOMAIN}/queryDetails`,
        payload: { id, projectTemplateId },
      });
    }
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  fetchTree = async phaseId => {
    const { projectTemplateId } = fromQs();
    const { data } = await outputHandle(templatePlanPagingRq, {
      limit: 0,
      projectTemplateId,
      phaseId,
    });
    const list = data.rows.map(item => ({ ...item, title: item.planName }));
    this.setState({ planList: list });
  };

  handleSave = flag => {
    const {
      formData: { ...newFormData },
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { projectTemplateId } = this.state;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/edit`,
          payload: {
            ...newFormData,
            ...values,
            projectTemplateId,
            flag,
          },
        });
      }
    });
  };

  // 配置所需要的内容
  renderPage = () => {
    const {
      formData,
      formMode,
      pageConfig,
      form,
      user: {
        user: { extInfo = {} },
      },
      phaseList,
    } = this.props;
    const { planList } = this.state;
    const { userId } = extInfo;

    const fields = [
      <BusinessFormTitle title="基本信息" />,
      <FormItem
        label="编号"
        key="planNo"
        fieldKey="planNo"
        fieldType="BaseInput"
        initialValue={formData.planNo}
        required
      />,
      <FormItem
        label="计划名称"
        key="planName"
        fieldKey="planName"
        fieldType="BaseInput"
        initialValue={formData.planName}
        required
      />,
      <FormItem
        label="计划类型"
        fieldKey="planType"
        key="planType"
        fieldType="BaseCustomSelect"
        parentKey="CUS:PLAN_TYPE"
        required
        initialValue={formData.phasePlanName}
      />,
      <FormItem
        label="所属阶段"
        key="phaseId"
        fieldKey="phaseId"
        fieldType="BaseSelect"
        initialValue={formData.phaseId}
        descList={phaseList}
        onChange={e => {
          this.fetchTree(e);
        }}
        required
      />,
      <FormItem
        label="父级计划"
        key="parentId"
        fieldKey="parentId"
        fieldType="BaseTreeSelect"
        initialValue={formData.parentId}
        // fetchData={this.fetchTree}
        options={planList}
      />,
      <FormItem
        label="备注"
        key="remark"
        fieldKey="remark"
        fieldType="BaseInputTextArea"
        initialValue={formData.phasePlanRemark}
      />,
    ];

    return (
      <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
        {fields}
      </BusinessForm>
    );
  };

  render() {
    const { loading } = this.props;

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryDetails`] || loading.effects[`${DOMAIN}/projectRiskEdit`];

    return (
      <PageWrapper>
        <ButtonCard>
          <Button
            icon="save"
            size="large"
            type="primary"
            onClick={() => this.handleSave(false)}
            disabled={disabledBtn}
          >
            保存
          </Button>
          <Button
            icon="save"
            size="large"
            type="primary"
            onClick={() => this.handleSave(true)}
            disabled={disabledBtn}
          >
            保存并创建下一条
          </Button>
        </ButtonCard>
        {this.renderPage()}
      </PageWrapper>
    );
  }
}

export default WBSPlanEdit;
