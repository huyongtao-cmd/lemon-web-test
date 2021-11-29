import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Table } from 'antd';
import router from 'umi/router';
import { fromQs } from '@/utils/production/stringUtil';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';

const DOMAIN = 'projectTemplateEdit';
@connect(({ user, loading, projectTemplateEdit, dispatch }) => ({
  loading,
  ...projectTemplateEdit,
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
class projectTemplateDetail extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    if (id) {
      dispatch({
        type: `${DOMAIN}/queryDetails`,
        payload: { id },
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

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const {
      formData: { ...newFormData },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/edit`,
          payload: {
            ...newFormData,
            ...values,
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
    } = this.props;

    const { userId } = extInfo;

    const fields = [
      <BusinessFormTitle title="基本信息" />,
      <FormItem
        label="模板名称"
        key="projectTemplateName"
        fieldKey="projectTemplateName"
        fieldType="BaseInput"
        initialValue={formData.projectTemplateName}
        required
        disabled
      />,
      <FormItem
        label="是否有效"
        key="enableFlag"
        fieldKey="enableFlag"
        fieldType="BaseRadioSelect"
        options={[{ label: '有效', value: true }, { label: '无效', value: false }]}
        initialValue={formData.enableFlag}
        disabled
      />,
      <FormItem
        label="备注"
        key="remark"
        fieldKey="remark"
        fieldType="BaseInputTextArea"
        initialValue={formData.remark}
        disabled
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
    const { id } = fromQs();

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryDetails`] || loading.effects[`${DOMAIN}/projectRiskEdit`];

    return (
      <PageWrapper>
        <ButtonCard>
          <Button
            size="large"
            type="primary"
            onClick={() =>
              router.push(`/workTable/projectMgmt/peopTemplate?projectTemplateId=${id}`)
            }
            disabled={disabledBtn}
          >
            成员模板
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() =>
              router.push(`/workTable/projectMgmt/WBSTemplate?projectTemplateId=${id}`)
            }
            disabled={disabledBtn}
          >
            WBS模板
          </Button>
        </ButtonCard>
        {this.renderPage()}
      </PageWrapper>
    );
  }
}

export default projectTemplateDetail;
