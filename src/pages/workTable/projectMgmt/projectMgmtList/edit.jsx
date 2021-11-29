import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Table } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import { createConfirm } from '@/components/core/Confirm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import { ProductFormItemBlockConfig } from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import { remindString } from '@/components/production/basic/Remind';

const DOMAIN = 'projectMgmtListEdit';

// dispatch是触犯标志，我要开始调用方法了

// 连接数据（redux）
@connect(({ user: { user }, loading, projectMgmtListEdit, dispatch }) => ({
  loading,
  ...projectMgmtListEdit,
  dispatch,
  user,
}))
// 托管表单的变化（所有表单的onChange事件，统一托管在这）
// dispatch是调用方法的标志
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

// react基本页面结构
class index extends Component {
  // 状态、数据
  state = {};

  // 页面准备完成->该发请求了
  componentDidMount() {
    const { dispatch } = this.props;
    // 项目模板下拉
    dispatch({
      type: `${DOMAIN}/projectTemplate`,
    });

    const { id, scene } = fromQs();
    this.setState({
      scene,
    });

    if (id) {
      dispatch({
        type: `${DOMAIN}/queryDetails`,
        payload: { id },
      });
    }

    if (scene === 'adjust') {
      // 获取页面配置、做可配置化
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'PROJECT_EDIT:ADJUST' },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'PROJECT_EDIT' },
      });
    }
  }

  // 页面即将卸载
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

  handleSubmit = () => {
    const {
      // 看anta的Form表单
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const {
      formData: { ...newFormData },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      const { projectStartDate, projectEndDate } = newFormData;
      if (moment(projectStartDate).isAfter(moment(projectEndDate))) {
        createMessage({
          type: 'warn',
          description: `项目结束日期不能早于项目开始日期！`,
        });
        return;
      }
      if (!error) {
        dispatch({
          type: `${DOMAIN}/projectManagementEdit`,
          payload: {
            ...newFormData,
            ...values,
            submit: true,
          },
        });
      }
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
      const { projectStartDate, projectEndDate } = newFormData;
      if (moment(projectStartDate).isAfter(moment(projectEndDate))) {
        createMessage({
          type: 'warn',
          description: `项目结束日期不能早于项目开始日期！`,
        });
        return;
      }
      if (!error) {
        dispatch({
          type: `${DOMAIN}/projectManagementEdit`,
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
        extInfo: { resId, userId, baseBuId },
      },
      projectTemplateList,
      attachments,
    } = this.props;

    const fields = [
      <BusinessFormTitle title="基本信息" />,
      <FormItem
        label="项目编号"
        key="projectNo"
        fieldKey="projectNo"
        fieldType="BaseInput"
        initialValue={formData.projectNo}
        placeholder="系统自定生成"
      />,
      <FormItem
        label="项目名称"
        key="projectName"
        fieldKey="projectName"
        fieldType="BaseInput"
        initialValue={formData.projectName}
      />,
      <FormItem
        label="关联产品"
        key="relatedProductId"
        fieldKey="relatedProductId"
        fieldType="ProductSimpleSelect"
        initialValue={formData.relatedProductId}
      />,
      <FormItem
        label="项目模板"
        key="projectTemplateId"
        fieldKey="projectTemplateId"
        fieldType="BaseSelect"
        value={formData.projectTemplateId}
        descList={projectTemplateList}
        form={null}
        onChange={value => {
          createConfirm({
            content: remindString({
              remindCode: 'PRO:W:PROJECT_SUBTABLE_CLEAR_WARN',
              defaultMessage: '修改项目模板将清空项目成员等子表数据并重新生成，请确认是否继续？',
            }),
            width: '700px',
            onOk: () => {
              // 赋值
              this.callModelEffects('updateForm', {
                projectTemplateId: value,
              });
            },
          });
        }}
      />,
      <FormItem
        label="所属公司"
        key="inchargeCompany"
        fieldKey="inchargeCompany"
        fieldType="BaseCustomSelect"
        parentKey="CUS:INTERNAL_COMPANY"
        initialValue={formData.inchargeCompany}
      />,
      <FormItem
        label="项目负责部门"
        key="inchargeBuId"
        fieldKey="inchargeBuId"
        fieldType="BuSimpleSelect"
        initialValue={baseBuId}
      />,
      <FormItem
        label="项目负责人"
        key="pmResId"
        fieldKey="pmResId"
        fieldType="ResSimpleSelect"
        initialValue={resId}
      />,
      <FormItem
        label="项目相关资源1"
        key="relatedRes1Id"
        fieldKey="relatedRes1Id"
        fieldType="ResSimpleSelect"
        initialValue={formData.relatedRes1Id}
        extraRequired={
          !(
            formData.projectClass1 === 'SPECIAL' ||
            (formData.projectClass1 === 'PROJECT' &&
              formData.projectClass2 === 'NOT_PRODUCTION_DEPT')
          )
        }
      />,
      <FormItem
        label="项目相关资源2"
        key="relatedRes2Id"
        fieldKey="relatedRes2Id"
        fieldType="ResSimpleSelect"
        initialValue={formData.relatedRes2Id}
        extraRequired={
          !(
            formData.projectClass1 === 'SPECIAL' ||
            (formData.projectClass1 === 'PROJECT' &&
              formData.projectClass2 === 'NOT_PRODUCTION_DEPT')
          )
        }
      />,
      <FormItem
        label="项目相关资源3"
        key="relatedRes3Id"
        fieldKey="relatedRes3Id"
        fieldType="ResSimpleSelect"
        initialValue={formData.relatedRes3Id}
      />,
      <FormItem
        label="项目开始日期"
        key="projectStartDate"
        fieldKey="projectStartDate"
        fieldType="BaseDatePicker"
        initialValue={formData.projectStartDate}
      />,
      <FormItem
        label="项目结束日期"
        key="projectEndDate"
        fieldKey="projectEndDate"
        fieldType="BaseDatePicker"
        initialValue={formData.projectEndDate}
      />,
      <FormItem
        fieldType="BaseSelect"
        label="状态"
        key="projectStatus"
        fieldKey="projectStatus"
        parentKey="PRO:PROJECT_STATUS"
        initialValue={formData.projectStatus}
      />,

      <FormItem
        fieldType="Group"
        label="项目类型"
        key="projectClass"
        extraRequired={!(formData.projectClass1 === 'SPECIAL')}
      >
        <FormItem
          fieldType="BaseCustomSelect"
          key="projectClass1"
          fieldKey="projectClass1"
          parentKey="CUS:PROJECT_CLASS1"
          initialValue={formData.projectClass1}
        />
        <FormItem
          fieldType="BaseCustomSelect"
          key="projectClass2"
          fieldKey="projectClass2"
          parentKey="CUS:PROJECT_CLASS2"
          initialValue={formData.projectClass2}
        />
      </FormItem>,
      // <FormItem
      //   fieldType="BaseFileManagerEnhance"
      //   label="附件"
      //   key="enclosure"
      //   fieldKey="enclosure"
      //   dataKey={fromQs().id}
      //   api="/api/production/pro/projectManagement/sfs/token"
      //   listType="text"
      //   attach
      // />,
      <FormItem
        fieldType="FileUpload"
        fieldKey="enclosure"
        key="enclosure"
        label="附件"
        fileList={attachments}
        multiple
        attach
      />,
      <FormItem
        label="创建人"
        key="createUserId"
        fieldKey="createUserId"
        fieldType="UserSimpleSelect"
        initialValue={userId}
      />,
      <FormItem
        label="创建日期"
        key="createTime"
        fieldKey="createTime"
        fieldType="BaseDatePicker"
        initialValue={formData.createTime}
      />,
      <FormItem
        label="备注"
        key="remark"
        fieldKey="remark"
        fieldType="BaseInputTextArea"
        initialValue={formData.remark}
      />,

      <BusinessFormTitle title="扩展信息" />,
      // <FormItem
      //   label="可配置字段1"
      //   key="configurableField1"
      //   fieldKey="configurableField1"
      //   fieldType="BaseInput"
      //   initialValue={formData.configurableField1}
      // />
    ];

    for (let i = 1; i <= 10; i += 1) {
      fields.push(
        <FormItem
          label={`可配置字段${i}`}
          key={`configurableField${i}`}
          fieldKey={`configurableField${i}`}
          fieldType="BaseInput"
          initialValue={formData[`configurableField${i}`]}
        />
      );
    }

    // console.warn(fields);

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey', // 根据那个字段去筛选（比如页面区域key、或者排序号）
      'PROJECT_EDIT_FORM',
      fields
    );

    return (
      <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
        {fieldsConfig}
      </BusinessForm>
    );
  };

  render() {
    const { loading } = this.props;
    const { scene } = this.state;

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryDetails`] ||
      loading.effects[`${DOMAIN}/projectManagementEdit`];

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
          {scene !== 'adjust' ? (
            <Button
              icon="save"
              size="large"
              type="primary"
              onClick={this.handleSubmit}
              disabled={disabledBtn}
            >
              提交
            </Button>
          ) : (
            ''
          )}
        </ButtonCard>
        {this.renderPage()}
      </PageWrapper>
    );
  }
}

export default index;
