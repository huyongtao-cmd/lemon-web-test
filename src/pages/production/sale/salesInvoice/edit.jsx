import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, type } from 'ramda';
import { Form, Cascader } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import EditTable from '@/components/production/business/EditTable';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import {
  ProductFormItemBlockConfig,
  ProductTableColumnsBlockConfig,
} from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/mathUtils';

const DOMAIN = 'salesInvoiceEdit';
@connect(({ loading, salesInvoiceEdit, dispatch }) => ({
  loading,
  ...salesInvoiceEdit,
  dispatch,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      if (Array.isArray(tempValue) && key !== 'invItemId') {
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
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: newFieldData,
    });
  },
})
class SingleCaseDetailDemo extends Component {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;

    const { id, invId } = fromQs();
    // 获取商品信息下拉
    dispatch({
      type: `${DOMAIN}/getInvoiceItemList`,
    });

    // 可配置化信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'SALES_INVOICE_EDIT:INPUT_INVOICE_INFORMATION' },
    });

    if (id) {
      dispatch({
        type: `${DOMAIN}/salesInvoiceApplyDetail`,
        payload: { id },
      }).then(res => {
        const { custId } = res;
        // 开票信息下拉
        custId &&
          dispatch({
            type: `${DOMAIN}/fetchAsyncSelectList`,
            payload: { custId },
          });
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

  handleSave = isSubmit => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      formData: { invItemId, detialList, ...newFormData },
      detailDelViews,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/salesInvoiceApplySave`,
          payload: {
            ...newFormData,
            ...values,
            invItemId:
              Array.isArray(invItemId) && (invItemId[0] && invItemId[1]) ? invItemId[1] : null,
            submit: isSubmit,
            delList: detailDelViews.filter(v => v > 0),
            detialList,
          },
        });
      }
    });
  };

  // 配置所需要的内容
  renderPage = () => {
    const {
      dispatch,
      formData,
      formMode,
      pageConfig,
      form,
      invoiceItemList = [],
      selectList = [],
      attachments,
    } = this.props;

    const fields = [
      <BusinessFormTitle title="开票基本信息" />,
      <FormItem
        label="开票批次号"
        key="batchNo"
        fieldKey="batchNo"
        fieldType="BaseInput"
        initialValue={formData.batchNo}
        disabled
        placeholder="系统自动生成"
      />,
      <FormItem
        label="批次状态"
        fieldKey="batchStatus"
        key="batchStatus"
        fieldType="BaseCustomSelect"
        parentKey="FUNCTION:SALE:SALE_INV_BATCH_STATUS"
        initialValue={formData.batchStatus}
        disabled
      />,
      <FormItem
        label="付款方式"
        fieldKey="payMethod"
        key="payMethod"
        fieldType="BaseCustomSelect"
        parentKey="CUS:PAYMENT_METHOD"
        initialValue={formData.payMethod}
      />,
      <FormItem
        label="批次开票金额"
        key="invAmt"
        fieldKey="invAmt"
        fieldType="BaseInputAmt"
        initialValue={formData.invAmt}
        disabled
        plcaeholder="系统自动生成"
      />,
      <FormItem
        label="预计到账日期"
        key="antiRecvDate"
        fieldKey="antiRecvDate"
        fieldType="BaseDatePicker"
        required
        initialValue={formData.antiRecvDate}
      />,
      <FormItem
        label="开票日期"
        key="batchDate"
        fieldKey="batchDate"
        fieldType="BaseDatePicker"
        required
        initialValue={formData.batchDate}
      />,
      <BusinessFormTitle title="发票内容" />,
      <FormItem
        label="开票信息"
        key="invinfoId"
        fieldKey="invinfoId"
        fieldType="BaseSelect"
        initialValue={formData.invinfoId}
        descList={selectList}
        required
        allowClear={false}
        onChange={e => {
          this.invInfoChange(e);
        }}
      />,
      <FormItem
        label="税号"
        key="taxNo"
        fieldKey="taxNo"
        fieldType="BaseInput"
        initialValue={formData.taxNo}
        disabled
      />,
      <FormItem
        label="地址"
        key="invAddr"
        fieldKey="invAddr"
        fieldType="BaseInput"
        initialValue={formData.invAddr}
        disabled
      />,
      <FormItem
        label="开户行"
        key="bankName"
        fieldKey="bankName"
        fieldType="BaseInput"
        initialValue={formData.bankName}
        disabled
      />,
      <FormItem
        label="账户"
        key="accountNo"
        fieldKey="accountNo"
        fieldType="BaseInput"
        initialValue={formData.accountNo}
        disabled
      />,
      <FormItem
        label="电话"
        key="invTel"
        fieldKey="invTel"
        fieldType="BaseInput"
        initialValue={formData.invTel}
        disabled
      />,
      <FormItem fieldType="Group" label="发票类型/税率" key="invType" required>
        <FormItem
          key="invType"
          fieldKey="invType"
          fieldType="BaseCustomSelect"
          parentKey="COM:INV_TYPE"
          initialValue={formData.invType}
        />
        <FormItem
          key="taxRate"
          fieldKey="taxRate"
          fieldType="BaseCustomSelect"
          parentKey="CUS:DEDUCT_TAX_RATE"
          initialValue={formData.taxRate}
        />
      </FormItem>,
      <FormItem
        label="币种"
        fieldKey="currCode"
        key="currCode"
        fieldType="BaseSelect"
        parentKey="COMMON_CURRENCY"
        initialValue={formData.currCode}
        disabled
      />,
      <FormItem
        label="商品信息"
        key="invItemId"
        fieldKey="invItemId"
        fieldType="Custom"
        initialValue={formData.invItemId}
        descriptionField="invItemIdDesc"
      >
        <Cascader
          style={{ width: '100%' }}
          options={invoiceItemList}
          showSearch
          matchInputWidth
          placeholder="请选择商品信息"
        />
      </FormItem>,
      <BusinessFormTitle title="其他信息" />,
      <FormItem
        label="快递方式"
        fieldKey="deliMethod"
        key="deliMethod"
        fieldType="BaseCustomSelect"
        parentKey="COM:DELI_METHOD"
        initialValue={formData.deliMethod}
        required
      />,
      <FormItem
        label="收件人"
        key="recvPerson"
        fieldKey="recvPerson"
        fieldType="BaseInput"
        initialValue={formData.recvPerson}
      />,
      <FormItem
        label="收件人邮箱"
        key="recvEmail"
        fieldKey="recvEmail"
        fieldType="BaseInput"
        required
        initialValue={formData.recvEmail}
      />,
      <FormItem
        label="收件人地址"
        key="recvAddr"
        fieldKey="recvAddr"
        fieldType="BaseInput"
        initialValue={formData.recvAddr}
      />,
      <FormItem
        label="收件人联系电话"
        key="recvTel"
        fieldKey="recvTel"
        fieldType="BaseInput"
        initialValue={formData.recvTel}
      />,
      // <FormItem
      //   fieldType="BaseFileManagerEnhance"
      //   label="附件"
      //   key="attach"
      //   fieldKey="attach"
      //   dataKey={fromQs().id}
      //   api="/api/production/invBatchs/sfs/token"
      //   listType="text"
      //   attach
      // />,
      <FormItem
        fieldType="FileUpload"
        label="附件"
        key="attach"
        fieldKey="attach"
        fileList={attachments}
        attach
      />,
      <FormItem
        label="创建人"
        fieldKey="createUserId"
        key="createUserId"
        fieldType="UserSimpleSelect"
        initialValue={formData.createUserId}
        disabled
      />,
      <FormItem
        label="创建时间"
        fieldKey="createTime"
        key="createTime"
        fieldType="BaseDatePicker"
        initialValue={formData.createTime}
        disabled
      />,
      <FormItem
        label="开票说明"
        fieldKey="invDesc"
        key="invDesc"
        fieldType="BaseInputTextArea"
        initialValue={formData.invDesc}
      />,
    ];

    const fieldsConfig = ProductFormItemBlockConfig(pageConfig, 'blockKey', 'FORM', fields);

    return (
      <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
        {fieldsConfig}
      </BusinessForm>
    );
  };

  invInfoChange = value => {
    const { dispatch } = this.props;
    if (!isNil(value)) {
      dispatch({
        type: `${DOMAIN}/invInfoDetail`,
        payload: {
          id: value,
        },
      });
    }
  };

  renderColumns = () => {
    const { form, pageConfig, fieldsConfig } = this.props;

    const tableInputDisabled = false;

    const fields = [
      {
        title: '发票状态',
        dataIndex: 'invStatus',
        align: 'center',
        width: 120,
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseCustomSelect"
            parentKey="FUNCTION:SALE:INV_STATUS"
            fieldKey={`detialList[${index}].invStatus`}
            disabled={tableInputDisabled}
          />
        ),
      },
      {
        title: '发票号',
        align: 'center',
        dataIndex: 'invNo',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detialList[${index}].invNo`}
            disabled={tableInputDisabled}
          />
        ),
      },
      {
        title: '快递号',
        align: 'center',
        dataIndex: 'deliveryNo',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detialList[${index}].deliveryNo`}
            disabled={tableInputDisabled}
          />
        ),
      },
      {
        title: '快递时间',
        align: 'center',
        dataIndex: 'deliveryDate',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseDatePicker"
            fieldKey={`detialList[${index}].deliveryDate`}
            disabled={tableInputDisabled}
          />
        ),
      },
      {
        title: '开票金额',
        align: 'center',
        dataIndex: 'invAmt',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detialList[${index}].invAmt`}
            disabled={tableInputDisabled}
          />
        ),
      },
      {
        title: '净额',
        align: 'center',
        dataIndex: 'netAmt',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detialList[${index}].netAmt`}
            disabled={tableInputDisabled}
          />
        ),
      },
      {
        title: '税金',
        align: 'center',
        dataIndex: 'taxAmt',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detialList[${index}].taxAmt`}
            disabled={tableInputDisabled}
          />
        ),
      },
      {
        title: '下载链接',
        align: 'center',
        dataIndex: 'downloadUrl',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detialList[${index}].downloadUrl`}
            disabled={tableInputDisabled}
          />
        ),
      },
    ];
    // const fieldsConfig = ProductTableColumnsBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'EXPENSE_QUOTA_D_TABLT',
    //   fields
    // );

    return fields;
  };

  render() {
    const { dispatch, loading, form, formData, detailDelViews = [], formMode } = this.props;
    const { detialList = [] } = formData;
    const disabledBtn =
      loading.effects[`${DOMAIN}/salesInvoiceApplySave`] ||
      loading.effects[`${DOMAIN}/salesInvoiceApplyDetail`];

    return (
      <PageWrapper>
        <ButtonCard>
          <Button
            icon="save"
            size="large"
            type="primary"
            onClick={() => {
              this.handleSave();
            }}
            disabled={disabledBtn}
          >
            保存
          </Button>
        </ButtonCard>
        {this.renderPage()}
        <EditTable
          title="具体发票信息"
          form={form}
          columns={this.renderColumns()}
          dataSource={detialList}
          onAddClick={() => {
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                detialList: update(detialList, {
                  $push: [
                    {
                      id: genFakeId(-1),
                      saleId: fromQs().id,
                    },
                  ],
                }),
              },
            });
          }}
          onDeleteConfirm={keys => {
            const newDataSource = detialList.filter(row => keys.indexOf(row.id) < 0);
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                detialList: newDataSource,
              },
            });
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                detailDelViews: [...detailDelViews, ...keys],
              },
            });
          }}
        />
      </PageWrapper>
    );
  }
}

export default SingleCaseDetailDemo;
