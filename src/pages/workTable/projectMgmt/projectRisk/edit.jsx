import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Table } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import { ProductFormItemBlockConfig } from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';
import { closeThenGoto } from '@/layouts/routerControl';
import { genFakeId } from '@/utils/mathUtils';

const DOMAIN = 'projectRiskEdit';

@connect(({ user, loading, projectRiskEdit, dispatch }) => ({
  loading,
  ...projectRiskEdit,
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
class index extends Component {
  componentDidMount() {
    const { dispatch } = this.props;

    const { id } = fromQs();
    if (id) {
      dispatch({
        type: `${DOMAIN}/queryDetails`,
        payload: { id },
      });
    }

    // dispatch({
    //   type: `${DOMAIN}/getPageConfig`,
    //   payload: { pageNo: 'PRODUCT_EDIT' },
    // });
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

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const {
      formData: { ...newFormData },
    } = this.props;
    const projectId = fromQs().projectId ? fromQs().projectId : newFormData.projectId;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/edit`,
          payload: {
            ...newFormData,
            ...values,
            projectId: fromQs().projectId ? fromQs().projectId : newFormData.projectId,
          },
        }).then(res => {
          res &&
            closeThenGoto(
              `/workTable/projectMgmt/projectMgmtList/projectRisk?refresh=${genFakeId(
                -1
              )}&projectId=${projectId}`
            );
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
    } = this.props;

    const { userId } = extInfo;

    const fields = [
      <BusinessFormTitle title="新增项目风险" />,
      <FormItem
        label="风险等级"
        key="riskLevel"
        fieldKey="riskLevel"
        fieldType="BaseCustomSelect"
        parentKey="CUS:RISK_LEVEL"
        initialValue={formData.riskLevel}
        required
      />,
      <FormItem
        label="状态"
        key="enableFlag"
        fieldKey="enableFlag"
        fieldType="BaseRadioSelect"
        options={[{ label: '有效', value: true }, { label: '无效', value: false }]}
        initialValue={formData.enableFlag}
      />,
      <FormItem
        label="风险内容"
        key="riskContent"
        fieldKey="riskContent"
        fieldType="BaseInputTextArea"
        initialValue={formData.riskContent}
        required
      />,
      <FormItem
        label="应对策略"
        key="countermeasure"
        fieldKey="countermeasure"
        fieldType="BaseInputTextArea"
        initialValue={formData.countermeasure}
      />,
      <FormItem
        label="创建人"
        fieldKey="createUserId"
        key="createUserId"
        fieldType="UserSimpleSelect"
        initialValue={userId}
        disabled
      />,
      <FormItem
        label="创建时间"
        fieldKey="createTime"
        key="createTime"
        fieldType="BaseInput"
        initialValue={formData.createTime}
        disabled
      />,
    ];

    // const fieldsConfig = ProductFormItemBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PRODUCT_EDIT_FORM',
    //   fields
    // );

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
            onClick={this.handleSave}
            disabled={disabledBtn}
          >
            保存
          </Button>
        </ButtonCard>
        {this.renderPage()}
      </PageWrapper>
    );
  }
}

export default index;
