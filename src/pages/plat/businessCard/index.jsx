import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, hasIn, clone } from 'ramda';
import { Card, Form, Input, Divider, Switch, Radio, Checkbox } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import BussinessCardDetail from './detail';
import { selectInternalOus } from '@/services/gen/list';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';

const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'bussinessCard';

@connect(({ loading, bussinessCard, dispatch, user: { user } }) => ({
  loading,
  bussinessCard,
  dispatch,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.bussinessCard;
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
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class BussinessCard extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId, mode } = fromQs();

    dispatch({ type: `${DOMAIN}/clean` }).then(() => {
      dispatch({ type: `${DOMAIN}/res` });
      dispatch({ type: `${DOMAIN}/bu` });
      dispatch({ type: `${DOMAIN}/queryProjList` });
      // 获取页面配置信息
      // dispatch({
      //   type: `${DOMAIN}/getPageConfig`,
      //   payload: { pageNo: 'CARD_APPLY' },
      // });
      // 有id，修改
      id &&
        dispatch({
          type: `${DOMAIN}/flowDetail`,
          payload: { id },
        });

      taskId
        ? dispatch({
            type: `${DOMAIN}/fetchConfig`,
            payload: taskId,
          })
        : dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              fieldsConfig: {
                buttons: [],
                panels: {
                  disabledOrHidden: {},
                },
              },
            },
          });
    });
  }

  renderPage = () => {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, validateFieldsAndScroll, setFieldsValue, getFieldValue },
      bussinessCard: {
        formData,
        resData,
        flowForm,
        fieldsConfig,
        pageConfig: { pageBlockViews = [] },
      },
      user,
      formMode,
      form,
    } = this.props;

    const {
      panels: { disabledOrHidden },
      taskKey,
    } = fieldsConfig;

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
        applyResult = {},
        cancelReason = {},
      } = pageFieldJson;

      const fields1 = [
        hasIn('applyResId', disabledOrHidden) && (
          <FormItem
            fieldType="ResObjectSelect"
            label={applyResId.displayName}
            key="applyResId"
            fieldKey="applyResId"
            required={applyResId.requiredFlag}
            sortNo={applyResId.sortNo}
            form={form}
            descList={[{ id: formData.applyResId, title: formData.name }]}
            disabled={!!disabledOrHidden.applyResId}
            //  initialValue={formData.applyResId || undefined}
          />
        ),

        hasIn('ename', disabledOrHidden) && (
          <FormItem
            fieldType="BaseInput"
            label={ename.displayName}
            key="ename"
            fieldKey="ename"
            required={ename.requiredFlag}
            sortNo={ename.sortNo}
            form={form}
            disabled={!!disabledOrHidden.ename}
          />
        ),

        hasIn('baseBuName', disabledOrHidden) && (
          <FormItem
            fieldType="BaseInput"
            label={baseBuName.displayName}
            key="baseBuName"
            fieldKey="baseBuName"
            required={baseBuName.requiredFlag}
            sortNo={baseBuName.sortNo}
            form={form}
            disabled={!!disabledOrHidden.baseBuName}
          />
        ),

        hasIn('ouId', disabledOrHidden) && (
          <FormItem
            fieldType="InternalOuSimpleSelect"
            label={ouId.displayName}
            key="ouId"
            fieldKey="ouId"
            required={ouId.requiredFlag}
            sortNo={ouId.sortNo}
            form={form}
            // descList={[{ id: formData.ouId,value: formData.ouId, title: formData.ouName }]}
            disabled={!!disabledOrHidden.ouId}
          />
        ),

        hasIn('mobile', disabledOrHidden) && (
          <FormItem
            fieldType="BaseInput"
            label={mobile.displayName}
            key="mobile"
            fieldKey="mobile"
            required={mobile.requiredFlag}
            sortNo={mobile.sortNo}
            form={form}
            disabled={!!disabledOrHidden.mobile}
          />
        ),

        hasIn('email', disabledOrHidden) && (
          <FormItem
            fieldType="BaseInput"
            label={email.displayName}
            key="email"
            fieldKey="email"
            required={email.requiredFlag}
            sortNo={email.sortNo}
            form={form}
            disabled={!!disabledOrHidden.email}
          />
        ),

        hasIn('ctitle', disabledOrHidden) && (
          <FormItem
            fieldType="BaseInput"
            label={ctitle.displayName}
            key="ctitle"
            fieldKey="ctitle"
            required={ctitle.requiredFlag}
            sortNo={ctitle.sortNo}
            form={form}
            disabled={!!disabledOrHidden.ctitle}
          />
        ),

        hasIn('etitle', disabledOrHidden) && (
          <FormItem
            fieldType="BaseInput"
            label={etitle.displayName}
            key="etitle"
            fieldKey="etitle"
            required={etitle.requiredFlag}
            sortNo={etitle.sortNo}
            form={form}
            disabled={!!disabledOrHidden.etitle}
          />
        ),

        hasIn('mailFlag', disabledOrHidden) && (
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
            disabled={!!disabledOrHidden.mailFlag}
          />
        ),

        hasIn('mailAddr', disabledOrHidden) && (
          <FormItem
            fieldType="BaseInput"
            label={mailAddr.displayName}
            key="mailAddr"
            fieldKey="mailAddr"
            required={mailAddr.requiredFlag}
            sortNo={mailAddr.sortNo}
            disabled={!!disabledOrHidden.mailAddr || formData.mailFlag === 'COMPANY'}
            form={form}
          />
        ),

        hasIn('remark', disabledOrHidden) && (
          <FormItem
            fieldType="BaseInputTextArea"
            label={remark.displayName}
            key="remark"
            fieldKey="remark1"
            required={remark.requiredFlag}
            sortNo={remark.sortNo}
            form={form}
            disabled={!!disabledOrHidden.remark}
          />
        ),

        hasIn('applyResult', disabledOrHidden) && (
          <FormItem
            fieldType="BaseRadioSelect"
            label={applyResult.displayName}
            key="applyResult"
            fieldKey="applyResult"
            options={[
              { label: '已发货', value: 'SHIPPED' },
              { label: '已取消', value: 'CANCELLED' },
            ]}
            required={applyResult.requiredFlag}
            sortNo={applyResult.sortNo}
            form={form}
            disabled={!!disabledOrHidden.applyResult}
          />
        ),

        hasIn('cancelReason', disabledOrHidden) && (
          <FormItem
            fieldType="BaseInputTextArea"
            label={cancelReason.displayName}
            key="cancelReason"
            fieldKey="cancelReason"
            required={cancelReason.requiredFlag || formData.applyResult === 'CANCELLED'}
            sortNo={cancelReason.sortNo}
            form={form}
            disabled={!!disabledOrHidden.cancelReason || formData.applyResult === 'SHIPPED'}
          />
        ),
      ];

      const filterList1 = fields1
        .filter(field => field && (!field.key || pageFieldJson[field.key].visibleFlag === 1))
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
      loading,
      dispatch,
      form: { getFieldDecorator, validateFieldsAndScroll, setFieldsValue },
      bussinessCard: {
        formData,
        resData,
        baseBuData,
        flowForm,
        fieldsConfig,
        pageConfig: { pageBlockViews = [] },
      },
      form,
      formMode,
    } = this.props;
    console.warn('fieldsConfig:', fieldsConfig);
    const {
      panels: { disabledOrHidden },
      taskKey,
    } = fieldsConfig;
    const { id, taskId, prcId, from, mode } = fromQs();
    console.log('taskKey', taskKey);

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
                  pushFlowTask(taskId, {
                    procRemark: remark,
                    result: 'REJECTED',
                    branch,
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
                      result: 'APPROVED',
                      taskId,
                      procRemark: remark,
                      branch,
                      submit: true,
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
          {mode === 'edit' && <>{this.renderPage()}</>}
          {mode === 'view' && <BussinessCardDetail />}
        </BpmWrapper>
      </PageWrapper>
    );
  }
}

export default BussinessCard;
