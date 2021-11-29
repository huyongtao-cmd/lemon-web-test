import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto } from '@/layouts/routerControl';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask, submitOrApprRq } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import View from './View';

const DOMAIN = 'useSealApplyApproval';

@connect(({ loading, useSealApplyApproval, dispatch, user: { user } }) => ({
  loading,
  ...useSealApplyApproval,
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
class index extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId, mode } = fromQs();
    dispatch({
      type: `${DOMAIN}/fetchSealList`,
      payload: {},
    });

    if (mode === 'edit') {
      taskId &&
        dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: taskId,
        }).then(res => {
          const { taskKey } = res;
          if (taskKey === 'ADM_M01_01_SUBMIT_i') {
            dispatch({
              type: `${DOMAIN}/getPageConfig`,
              payload: { pageNo: 'SEAL_APPLY:ADM_M01_01_SUBMIT_i' },
            });
          } else if (taskKey === 'ADM_M01_06_SEAL_RETURN_CONFIRMATION') {
            dispatch({
              type: `${DOMAIN}/getPageConfig`,
              payload: { pageNo: 'SEAL_APPLY:ADM_M01_06_SEAL_RETURN_CONFIRMATION' },
            });
          } else {
            dispatch({
              type: `${DOMAIN}/getPageConfig`,
              payload: { pageNo: 'SEAL_APPLY:ADM_M01_OTHERS' },
            });
          }
        });
    } else {
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'SEAL_APPLY:ADM_M01_DETAILS' },
      });
    }

    id &&
      dispatch({
        type: `${DOMAIN}/flowDetail`,
        payload: { id },
      });
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/cleanState`,
      payload: {},
    });
  }

  renderPage = () => {
    const {
      dispatch,
      formMode,
      form,
      formData,
      sealPurposeList,
      sealList,
      currentSealPurpose,
      pageConfig: { pageBlockViews = [] },
      attachments,
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockKey === 'SEAL_APPLY_MAIN');
    // 修改之前的可配置化
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    let wrappedSealList = sealList;
    if (
      currentSealPurpose &&
      currentSealPurpose[0]?.extVarchar6 &&
      currentSealPurpose[0]?.extVarchar6?.trim().length > 0
    ) {
      const { extVarchar6 } = currentSealPurpose[0];
      const extVarchar6List = extVarchar6.trim().split(',');
      wrappedSealList = sealList.filter(item => extVarchar6List.indexOf(item.value) > -1);
    } else if (currentSealPurpose && !isEmpty(currentSealPurpose)) {
      wrappedSealList = sealList;
    } else {
      wrappedSealList = [];
    }
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const {
        applyResId = {},
        applyDate = {},
        baseBuId = {},
        ouId = {},
        contactNo = {},
        email = {},
        seal = {},
        sealPurpose = {},
        lendFlag = {},
        returnDate = {},
        remark = {},
        enclosureSealApply = {},
        sealReturnDesc = {},
      } = pageFieldJson;

      const fields1 = [
        <FormItem
          fieldType="ResSimpleSelect"
          // label='申请人'
          label={applyResId.displayName}
          key="applyResId"
          fieldKey="applyResId"
          required={applyResId.requiredFlag}
          sortNo={applyResId.sortNo}
          form={form}
          initialValue={formData.applyResId}
          onChange={value => {
            dispatch({
              type: `${DOMAIN}/queryResDetail`,
              payload: value,
            });
          }}
          descList={[{ id: formData.applyResId, title: formData.applyResName }]}
          disabled={applyResId.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseDatePicker"
          // label='申请日期'
          label={applyDate.displayName}
          key="applyDate"
          fieldKey="applyDate"
          required={applyDate.requiredFlag}
          sortNo={applyDate.sortNo}
          form={form}
          disabled={applyDate.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseInput"
          label={baseBuId.displayName}
          // label='BaseBu'
          key="baseBuId"
          fieldKey="baseBuName"
          required={baseBuId.requiredFlag}
          sortNo={baseBuId.sortNo}
          form={form}
          disabled={baseBuId.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseInput"
          label={ouId.displayName}
          // label='所属公司'
          key="ouId"
          fieldKey="ouName"
          required={ouId.requiredFlag}
          sortNo={ouId.sortNo}
          form={form}
          disabled={baseBuId.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseInput"
          label={contactNo.displayName}
          // label='联系电话'
          key="contactNo"
          fieldKey="contactNo"
          required={contactNo.requiredFlag}
          sortNo={contactNo.sortNo}
          form={form}
          disabled={contactNo.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseInput"
          label={email.displayName}
          // label='邮箱'
          key="email"
          fieldKey="email"
          required={email.requiredFlag}
          sortNo={email.sortNo}
          form={form}
          disabled={email.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseSelect"
          label={seal.displayName}
          // label='印章'
          key="seal"
          fieldKey="seal"
          mode="multiple"
          descList={wrappedSealList}
          required={seal.requiredFlag}
          sortNo={seal.sortNo}
          form={form}
          disabled={seal.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseSelect"
          label={sealPurpose.displayName}
          // label='印章用途'
          key="sealPurpose"
          descList={sealPurposeList}
          fieldKey="sealPurpose"
          required={sealPurpose.requiredFlag}
          sortNo={sealPurpose.sortNo}
          form={form}
          disabled={sealPurpose.fieldMode === 'UNEDITABLE'}
          onChange={(value, option) => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                currentSealPurpose: option,
              },
            });
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                seal: [],
              },
            });
          }}
        />,
        <FormItem
          fieldType="BaseRadioSelect"
          label={lendFlag.displayName}
          key="lendFlag"
          fieldKey="lendFlag"
          options={[{ label: '是', value: 'YES' }, { label: '否', value: 'NO' }]}
          required={lendFlag.requiredFlag}
          sortNo={lendFlag.sortNo}
          form={form}
          disabled={returnDate.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseDatePicker"
          // label='归还时间'
          label={returnDate.displayName}
          key="returnDate"
          fieldKey="returnDate"
          required={returnDate.requiredFlag && formData.lendFlag === 'YES'}
          sortNo={returnDate.sortNo}
          form={form}
          disabled={returnDate.fieldMode === 'UNEDITABLE'}
        />,
        // <FormItem
        //   fieldType="BaseFileManagerEnhance"
        //   // label='附件'
        //   label={enclosureSealApply.displayName}
        //   key="enclosureSealApply"
        //   fieldKey="enclosureSealApply"
        //   required={enclosureSealApply.requiredFlag && formData.lendFlag === 'YES'}
        //   sortNo={enclosureSealApply.sortNo}
        //   form={form}
        //   preview={enclosureSealApply.fieldMode === 'UNEDITABLE'}
        //   dataKey={formData.id}
        //   api="/api/production/adm/sealApply/sfs/token"
        //   listType="text"
        // />,
        <FormItem
          fieldType="FileUpload"
          fieldKey="enclosureSealApply"
          key="enclosureSealApply"
          label={enclosureSealApply.displayName}
          fileList={attachments}
          required={enclosureSealApply.requiredFlag && formData.lendFlag === 'YES'}
          sortNo={enclosureSealApply.sortNo}
          multiple
          preview={enclosureSealApply.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseInputTextArea"
          label={remark.displayName}
          key="remark"
          fieldKey="remark"
          required={remark.requiredFlag}
          sortNo={remark.sortNo}
          form={form}
          disabled={remark.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseInputTextArea"
          label={sealReturnDesc.displayName}
          key="sealReturnDesc"
          fieldKey="sealReturnDesc"
          required={sealReturnDesc.requiredFlag}
          sortNo={sealReturnDesc.sortNo}
          form={form}
          disabled={sealReturnDesc.fieldMode === 'UNEDITABLE'}
        />,
      ];

      const filterList1 = fields1
        .filter(field => !field.key || pageFieldJson[field.key]?.visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);

      return (
        <>
          <BusinessForm formData={formData} formMode={formMode}>
            {filterList1}
          </BusinessForm>
        </>
      );
    }
    return '';
  };

  render() {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      formData,
      flowForm,
      fieldsConfig,
    } = this.props;
    const { seal, ...newFormData } = formData;

    const { taskId } = fromQs();
    const { taskKey } = fieldsConfig;

    return (
      <PageWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
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
                  submitOrApprRq({
                    //
                    id: formData.id,
                    procIden: 'ADM_M01',
                    procTaskId: taskId,
                    result: 'REJECTED',
                    branch,
                    submit: true,
                    procRemark: remark,
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
                  dispatch({
                    type: `${DOMAIN}/submit`,
                    payload: {
                      ...newFormData,
                      seal: Array.isArray(seal) ? seal.join(',') : '',
                      result: 'APPROVED',
                      taskId,
                      procTaskId: taskId,
                      procRemark: remark,
                      branch,
                      submit: true,
                      taskKey,
                    },
                  }).then(response => {
                    if (response.ok) {
                      createMessage({ type: 'success', description: '操作成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    }
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
