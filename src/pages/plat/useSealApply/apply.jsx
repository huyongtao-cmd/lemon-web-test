import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form } from 'antd';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';

const DOMAIN = 'useSealApplyApply';

@connect(({ user: { user }, loading, useSealApplyApply, dispatch }) => ({
  loading,
  ...useSealApplyApply,
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
// @mountToTab()
class index extends Component {
  componentDidMount() {
    const { dispatch, user } = this.props;
    dispatch({
      type: `${DOMAIN}/fetchSealPurposeList`,
      payload: {},
    });
    dispatch({
      type: `${DOMAIN}/fetchSealList`,
      payload: {},
    });

    dispatch({
      type: `${DOMAIN}/queryUserPrincipal`,
    });
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'SEAL_APPLY' },
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

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const {
      formData: { seal, ...newFormData },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/createSubmit`,
          payload: {
            ...newFormData,
            seal: Array.isArray(seal) ? seal.join(',') : '',
          },
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/user/flow/process?type=procs`);
          }
        });
      }
    });
  };

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
        attachments,
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
          descList={wrappedSealList}
          key="seal"
          fieldKey="seal"
          mode="multiple"
          required={seal.requiredFlag}
          sortNo={seal.sortNo}
          form={form}
          disabled={seal.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="BaseSelect"
          label={sealPurpose.displayName}
          // label='印章用途'
          descList={sealPurposeList}
          key="sealPurpose"
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
          form={form}
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
    const { loading } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/queryResDetail`];

    return (
      <PageWrapper>
        <ButtonCard>
          <Button
            icon="save"
            size="large"
            type="primary"
            onClick={this.handleSubmit}
            disabled={disabledBtn}
          >
            提交
          </Button>
        </ButtonCard>

        {this.renderPage()}
      </PageWrapper>
    );
  }
}

export default index;
