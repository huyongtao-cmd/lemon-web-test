import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import { Form } from 'antd';
import router from 'umi/router';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import { ProductFormItemBlockConfig } from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';
import { remindString } from '@/components/production/basic/Remind';
import { createConfirm } from '@/components/core/Confirm';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'projectMgmtListDetail';

@connect(({ loading, projectMgmtListDetail, dispatch }) => ({
  loading,
  ...projectMgmtListDetail,
  dispatch,
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
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;

    const { id } = fromQs();
    this.setState({
      id,
    });
    if (id) {
      dispatch({
        type: `${DOMAIN}/queryDetails`,
        payload: { id },
      });
    }

    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PROJECT_EDIT:DETAILS' },
    });
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

  // 配置所需要的内容
  renderPage = () => {
    const { formData, formMode, pageConfig, form, projectTemplateList, attachments } = this.props;

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
        initialValue={formData.inchargeBuId}
      />,
      <FormItem
        label="项目负责人"
        key="pmResId"
        fieldKey="pmResId"
        fieldType="ResSimpleSelect"
        initialValue={formData.pmResId}
      />,
      <FormItem
        label="项目相关资源1"
        key="relatedRes1Id"
        fieldKey="relatedRes1Id"
        fieldType="ResSimpleSelect"
        initialValue={formData.relatedRes1Id}
      />,
      <FormItem
        label="项目相关资源2"
        key="relatedRes2Id"
        fieldKey="relatedRes2Id"
        fieldType="ResSimpleSelect"
        initialValue={formData.relatedRes2Id}
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

      <FormItem fieldType="Group" label="项目类型" key="projectClass">
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
      //   dataKey={formData.id}
      //   initialValue={formData.id}
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
        initialValue={formData.createUserId}
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

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey',
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
    const { formData } = this.props;
    const { mode } = fromQs();
    const { id } = this.state;
    const relatedProductId = !isNil(formData.relatedProductId) ? formData.relatedProductId : '';

    const allBpm = [{ docId: id, procDefKey: 'PRO_P13', title: '项目审批流程' }];

    return (
      <PageWrapper>
        <ButtonCard style={{ display: mode === 'DISABLED' ? 'block' : 'none' }}>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              // createMessage({
              //   type: 'warn',
              //   description: '功能开发中......',
              // });
              router.push(`/workTable/projectMgmt/projectMgmtList/projectMember?projectId=${id}`);
            }}
            // disabled={disabledBtn}
          >
            成员管理
          </Button>
        </ButtonCard>
        <ButtonCard style={{ display: mode === 'DESCRIPTION' ? 'block' : 'none' }}>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              // createMessage({
              //   type: 'warn',
              //   description: '功能开发中......',
              // });
              router.push(`/workTable/projectMgmt/projectMgmtList/projectMember?projectId=${id}`);
            }}
            // disabled={disabledBtn}
          >
            成员管理
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              router.push(
                `/workTable/bud/budgetList?chargeProjectId=${formData.id}&chargeBuId=${
                  formData.inchargeBuId
                }`
              );
            }}
            // disabled={disabledBtn}
          >
            项目预算
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              router.push(
                `/workTable/reimburseMgmt/expenseClaimList?chargeProjectId=${
                  formData.id
                }&chargeBuId=${formData.inchargeBuId}&chargeCompany=${formData.inchargeCompany}`
              );
            }}
            // disabled={disabledBtn}
          >
            报销列表
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              router.push(
                `/workTable/pur/purchaseList?chargeProjectId=${formData.id}&chargeBuId=${
                  formData.inchargeBuId
                }&chargeCompany=${formData.inchargeCompany}&relatedProductId=${relatedProductId}`
              );
            }}
            // disabled={disabledBtn}
          >
            采购单
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              router.push(
                `/workTable/sale/saleOrder?chargeProjectId=${formData.id}&chargeBuId=${
                  formData.inchargeBuId
                }&chargeCompany=${formData.inchargeCompany}&relatedProductId=${relatedProductId}`
              );
            }}
            // disabled={disabledBtn}
          >
            销售单
          </Button>
          {/* <Button
            size="large"
            type="primary"
            onClick={() => {
              createMessage({
                type: 'warn',
                description: '功能开发中......',
              });
            }}
            // disabled={disabledBtn}
          >
            阶段管理
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => {
              createMessage({
                type: 'warn',
                description: '功能开发中......',
              });
            }}
            // disabled={disabledBtn}
          >
            活动管理
          </Button> */}
        </ButtonCard>
        {this.renderPage()}
        <BpmConnection source={allBpm} />
      </PageWrapper>
    );
  }
}

export default index;
