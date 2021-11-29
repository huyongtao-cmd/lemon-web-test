import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Table } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import { createConfirm } from '@/components/core/Confirm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import { ProductFormItemBlockConfig } from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';
import createMessage from '@/components/core/AlertMessage';
import { pushFlowTask } from '@/services/gen/flow';
import { getUrl } from '@/utils/flowToRouter';
import { closeThenGoto } from '@/layouts/routerControl';
import { remindString } from '@/components/production/basic/Remind';

const DOMAIN = 'projectMgmtListFlow';

@connect(({ user: { user }, loading, projectMgmtListFlow, dispatch }) => ({
  loading,
  ...projectMgmtListFlow,
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
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;

    // 项目模板下拉
    dispatch({
      type: `${DOMAIN}/projectTemplate`,
    });

    const { id: ids, taskId: taskIds, mode: modes } = fromQs();
    this.setState(
      {
        id: ids,
        taskId: taskIds,
        mode: modes,
        formMode: modes === 'view' ? 'DESCRIPTION' : 'EDIT',
      },
      () => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            formMode: modes === 'edit' ? 'EDIT' : 'DESCRIPTION',
          },
        });

        const { id, taskId, mode } = this.state;
        id &&
          dispatch({
            type: `${DOMAIN}/queryDetails`,
            payload: { id },
          });

        if (mode === 'edit') {
          taskId &&
            dispatch({
              type: `${DOMAIN}/fetchConfig`,
              payload: taskId,
            }).then(res => {
              const { taskKey } = res;
              if (taskKey === 'PRO_P13_01_SUBMIT_i') {
                // 第一节点审批场景
                dispatch({
                  type: `${DOMAIN}/getPageConfig`,
                  payload: { pageNo: 'PROJECT_EDIT' },
                });
              } else if (taskKey === 'PRO_P13_02_PM_COMPLETE_INFORMATION') {
                // 项目负责人完善信息
                dispatch({
                  type: `${DOMAIN}/getPageConfig`,
                  payload: { pageNo: 'PROJECT_EDIT' },
                });
              } else if (taskKey === 'ADM_M02_07_UPLOAD_SCANNED_COPY') {
                // 项目负责部门审批
                dispatch({
                  type: `${DOMAIN}/getPageConfig`,
                  payload: { pageNo: 'PROJECT_EDIT:INCHARGE_BU_ID_APPROVE' },
                });
              } else {
                // 常规审批场景
                dispatch({
                  type: `${DOMAIN}/getPageConfig`,
                  payload: { pageNo: 'PROJECT_EDIT:DETAILS' },
                });
              }
            });
        } else {
          dispatch({
            type: `${DOMAIN}/getPageConfig`,
            payload: { pageNo: 'PROJECT_EDIT:DETAILS' },
          });
        }
      }
    );

    // if (scene === 'adjust') {
    //   dispatch({
    //     type: `${DOMAIN}/getPageConfig`,
    //     payload: { pageNo: 'PROJECT_EDIT:ADJUST' },
    //   });
    // } else {
    //   dispatch({
    //     type: `${DOMAIN}/getPageConfig`,
    //     payload: { pageNo: 'PROJECT_EDIT' },
    //   });
    // }
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
    const { formData, pageConfig, form, projectTemplateList, attachments } = this.props;

    const { formMode } = this.state;

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
    const {
      dispatch,
      loading,
      form,
      form: { validateFieldsAndScroll },
      formData,
      formMode,
      flowForm,
      fieldsConfig,
    } = this.props;
    const { scene } = this.state;
    const { taskId } = this.state;
    const { taskKey } = fieldsConfig;

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryDetails`] ||
      loading.effects[`${DOMAIN}/projectManagementEdit`];

    return (
      <PageWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={disabledBtn}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;

            if (key === 'FLOW_COUNTERSIGN') {
              return Promise.resolve(true);
            }

            if (key === 'FLOW_RETURN') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () =>
                  pushFlowTask(taskId, {
                    remark,
                    result: 'REJECTED',
                    branch,
                    taskKey,
                  }).then(({ status, response }) => {
                    if (status === 200) {
                      createMessage({ type: 'success', description: '操作成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    }
                    return Promise.resolve(false);
                  }),
              });
            }

            if (key === 'FLOW_PASS' || key === 'FLOW_COMMIT') {
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  const { ...newFormData } = formData;

                  dispatch({
                    type: `${DOMAIN}/submit`,
                    payload: {
                      ...newFormData,
                      result: 'APPROVED',
                      procTaskId: taskId,
                      taskId,
                      procRemark: remark,
                      branch,
                      submit: true,
                      procTaskKey: taskKey,
                      taskKey,
                    },
                  });
                }
              });
            }
            return Promise.resolve(false);
          }}
        >
          {this.renderPage()}
        </BpmWrapper>
      </PageWrapper>
    );
  }
}

export default index;
