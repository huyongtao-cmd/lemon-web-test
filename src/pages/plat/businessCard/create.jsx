import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import { Form } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';

const DOMAIN = 'bussinessCard';

@connect(({ user: { user }, loading, bussinessCard, dispatch }) => ({
  loading,
  bussinessCard,
  dispatch,
  user,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class index extends Component {
  componentDidMount() {
    const { dispatch, user } = this.props;
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({
      type: `${DOMAIN}/queryResDetail`,
      payload: user.extInfo.resId,
    });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'CARD_APPLY' },
    });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const {
      bussinessCard: { formData },
      user: {
        extInfo: { resId },
      },
    } = this.props;

    let { applyResId } = formData;

    if (!applyResId) {
      applyResId = resId;
    }
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/createSubmit`,
          payload: { applyResId },
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
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      bussinessCard: {
        formData,
        resData,
        pageConfig: { pageBlockViews = [] },
      },
      user,
      formMode,
      form,
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockKey === 'CARD_APPLY_MAIN');
    // 修改之前的可配置化
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};

    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const {
        applyResId = {},
        ename = {},
        baseBuName = {},
        ouId = {},
        mobile = {},
        email = {},
        ctitle = {},
        etitle = {},
        mailFlag = {},
        mailAddr = {},
        remark = {},
      } = pageFieldJson;

      const fields1 = [
        <FormItem
          fieldType="ResObjectSelect"
          label={applyResId.displayName}
          key="applyResId"
          fieldKey="applyResId"
          required={applyResId.requiredFlag}
          sortNo={applyResId.sortNo}
          form={form}
          initialValue={user.extInfo.resId}
          onChange={value => {
            dispatch({
              type: `${DOMAIN}/queryResDetail`,
              payload: value,
            });
          }}
          descList={[{ id: user.extInfo.resId, title: user.extInfo.resName }]}
        />,
        <FormItem
          fieldType="BaseInput"
          label={ename.displayName}
          key="ename"
          fieldKey="ename"
          required={ename.requiredFlag}
          sortNo={ename.sortNo}
          form={form}
        />,
        <FormItem
          fieldType="BaseInput"
          label={baseBuName.displayName}
          key="baseBuName"
          fieldKey="baseBuName"
          required={baseBuName.requiredFlag}
          sortNo={baseBuName.sortNo}
          form={form}
          disabled={baseBuName.fieldMode === 'UNEDITABLE'}
        />,
        <FormItem
          fieldType="InternalOuSimpleSelect"
          label={ouId.displayName}
          key="ouId"
          fieldKey="ouId"
          required={ouId.requiredFlag}
          sortNo={ouId.sortNo}
          form={form}
          //  descList={[{ id: formData.ouId,value: formData.ouId, title: formData.ouName }]}
        />,
        <FormItem
          fieldType="BaseInput"
          label={mobile.displayName}
          key="mobile"
          fieldKey="mobile"
          required={mobile.requiredFlag}
          sortNo={mobile.sortNo}
          form={form}
        />,
        <FormItem
          fieldType="BaseInput"
          label={email.displayName}
          key="email"
          fieldKey="email"
          required={email.requiredFlag}
          sortNo={email.sortNo}
          form={form}
        />,
        <FormItem
          fieldType="BaseInput"
          label={ctitle.displayName}
          key="ctitle"
          fieldKey="ctitle"
          required={ctitle.requiredFlag}
          sortNo={ctitle.sortNo}
          form={form}
        />,
        <FormItem
          fieldType="BaseInput"
          label={etitle.displayName}
          key="etitle"
          fieldKey="etitle"
          required={etitle.requiredFlag}
          sortNo={etitle.sortNo}
          form={form}
        />,
        <FormItem
          fieldType="BaseRadioSelect"
          label={mailFlag.displayName}
          key="mailFlag"
          fieldKey="mailFlag"
          options={[
            { label: '邮寄到公司', value: 'COMPANY' },
            { label: '邮寄到指定地点', value: 'SPECIFIED_ADDR' },
          ]}
          required={mailFlag.requiredFlag}
          sortNo={mailFlag.sortNo}
          form={form}
        />,
        <FormItem
          fieldType="BaseInput"
          label={mailAddr.displayName}
          key="mailAddr"
          fieldKey="mailAddr"
          required={mailAddr.requiredFlag || formData.mailFlag === 'SPECIFIED_ADDR'}
          sortNo={mailAddr.sortNo}
          disabled={formData.mailFlag === 'COMPANY'}
          form={form}
        />,
        <FormItem
          fieldType="BaseInputTextArea"
          label={remark.displayName}
          key="remark"
          fieldKey="remark1"
          required={remark.requiredFlag}
          sortNo={remark.sortNo}
          form={form}
        />,
      ];

      const filterList1 = fields1
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
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
