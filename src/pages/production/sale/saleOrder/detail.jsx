import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, type } from 'ramda';
import { Form, Card } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import DataTable from '@/components/production/business/DataTable';
import {
  ProductFormItemBlockConfig,
  ProductTableColumnsBlockConfig,
} from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { fromQs } from '@/utils/production/stringUtil';
import { mul } from '@/utils/mathUtils';

const DOMAIN = 'saleOrderDetails';
@connect(({ loading, saleOrderDetails, dispatch, user }) => ({
  loading,
  ...saleOrderDetails,
  dispatch,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
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
class indexCom extends Component {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;

    const { id } = fromQs();

    // ??????????????????
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'SALE_ORDER_EDIT' },
    });

    if (id) {
      dispatch({
        type: `${DOMAIN}/queryDetails`,
        payload: { id },
      });
    }
  }

  componentWillUnmount() {
    // ?????????????????????model???state,?????????????????????????????????
    this.callModelEffects('cleanState');
  }

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  // ????????????????????????
  renderPage = () => {
    const {
      dispatch,
      formData,
      formMode,
      pageConfig,
      form,
      user: {
        user: { extInfo = {} },
      },
      customerList = [],
      attachments,
    } = this.props;
    const { userId } = extInfo;

    const fields = [
      <BusinessFormTitle title="????????????" />,
      <FormItem
        label="???????????????"
        key="soName"
        fieldKey="soName"
        fieldType="BaseInput"
        required
        initialValue={formData.soName}
      />,
      <FormItem
        label="???????????????"
        key="soNo"
        fieldKey="soNo"
        fieldType="BaseInput"
        initialValue={formData.soNo}
        disabled
        plcaeholder="??????????????????"
      />,
      <FormItem
        label="????????????"
        key="custId"
        fieldKey="custId"
        fieldType="BaseSelect"
        initialValue={formData.custId}
        descList={customerList}
      />,
      <FormItem
        label="????????????"
        key="relatedContractId"
        fieldKey="relatedContractId"
        fieldType="ContractSimpleSelect"
        initialValue={formData.relatedContractId}
      />,
      <FormItem
        label="????????????"
        key="relatedProductId"
        fieldKey="relatedProductId"
        fieldType="ProductSimpleSelect"
        initialValue={formData.relatedProductId}
      />,
      <FormItem
        label="????????????"
        key="collectionProjectId"
        fieldKey="collectionProjectId"
        fieldType="ProjectSimpleSelect"
        initialValue={formData.collectionProjectId}
      />,
      <FormItem
        label="????????????"
        key="collectionCompany"
        fieldKey="collectionCompany"
        fieldType="BaseCustomSelect"
        parentKey="CUS:INTERNAL_COMPANY"
        required
        initialValue={formData.collectionCompany}
      />,
      <FormItem
        label="????????????"
        key="collectionBuId"
        fieldKey="collectionBuId"
        fieldType="BuSimpleSelect"
        required
        initialValue={formData.collectionBuId}
      />,
      <FormItem
        label="???????????????"
        key="inchargeSaleId"
        fieldKey="inchargeSaleId"
        fieldType="ResSimpleSelect"
        required
        initialValue={formData.inchargeSaleId}
      />,
      <FormItem
        label="????????????"
        key="foreignCurrencyFlag"
        fieldKey="foreignCurrencyFlag"
        fieldType="BaseRadioSelect"
        options={[{ label: '???', value: true }, { label: '???', value: false }]}
        initialValue={formData.foreignCurrencyFlag}
        required
      />,
      <FormItem fieldType="Group" label="??????/??????" key="originalCurrency" required>
        <FormItem
          key="originalCurrency"
          fieldKey="originalCurrency"
          fieldType="BaseSelect"
          parentKey="COMMON_CURRENCY"
          initialValue={formData.originalCurrency}
        />
        <FormItem
          key="exchangeRate"
          fieldKey="exchangeRate"
          fieldType="BaseInputNumber"
          initialValue={formData.exchangeRate || undefined}
          onChange={e => {
            if (type(e) === 'Number') {
              const { originalCurrencyAmt } = formData;
              const tt =
                !isNil(originalCurrencyAmt) && !isNil(e) ? mul(originalCurrencyAmt, e) : '';
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  baseCurrencyAmt: tt,
                },
              });
            }
          }}
        />
      </FormItem>,
      <FormItem
        label="????????????"
        key="originalCurrencyAmt"
        fieldKey="originalCurrencyAmt"
        fieldType="BaseInputAmt"
        initialValue={formData.originalCurrencyAmt}
        disabled
        plcaeholder="??????????????????"
      />,
      <FormItem
        label="????????????"
        key="baseCurrencyAmt"
        fieldKey="baseCurrencyAmt"
        fieldType="BaseInputAmt"
        initialValue={formData.baseCurrencyAmt}
        disabled
        plcaeholder="??????????????????"
      />,
      // <FormItem
      //   label="??????"
      //   key="productsaleorder"
      //   fieldKey="productsaleorder"
      //   fieldType="BaseFileManagerEnhance"
      //   dataKey={formData.id}
      //   api="/api/production/sale/saleOrder/sfs/token"
      //   listType="text"
      //   attach
      // />,
      <FormItem
        fieldType="FileUpload"
        label="??????"
        key="productsaleorder"
        fieldKey="productsaleorder"
        fileList={attachments}
        multiple
        attach
      />,
      <FormItem
        label="???????????????"
        fieldKey="saleType"
        key="saleType"
        fieldType="BaseCustomSelect"
        parentKey="FUNCTION:SALE:SALE_TYPE"
        initialValue={formData.saleType}
      />,
      <FormItem
        label="??????"
        fieldKey="soStatus"
        key="soStatus"
        fieldType="BaseSelect"
        parentKey="COM:DOC_STATUS"
        initialValue={formData.soStatus}
        disabled
      />,
      <FormItem
        label="?????????"
        fieldKey="createUserId"
        key="createUserId"
        fieldType="UserSimpleSelect"
        initialValue={userId}
        disabled
      />,
      <FormItem
        label="????????????"
        fieldKey="createTime"
        key="createTime"
        fieldType="BaseInput"
        initialValue={formData.createTime}
        disabled
      />,
      <FormItem
        label="??????"
        fieldKey="remark"
        key="remark"
        fieldType="BaseInputTextArea"
        initialValue={formData.remark}
      />,
    ];

    const fieldsConfig = ProductFormItemBlockConfig(pageConfig, 'blockKey', 'FORM', fields);

    return (
      <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={8}>
        {fieldsConfig}
      </BusinessForm>
    );
  };

  renderColumnsView = () => {
    const { dispatch, form, pageConfig } = this.props;

    const fields = [
      {
        title: '????????????',
        dataIndex: 'itemName',
        align: 'center',
      },
      {
        title: '??????',
        align: 'center',
        dataIndex: 'qty',
      },
      {
        title: '??????',
        align: 'center',
        dataIndex: 'unitPrice',
        render: val => (val ? val.toFixed(2) : '0.00'),
      },
      {
        title: '??????',
        align: 'center',
        dataIndex: 'amt',
        render: (val, row, index) =>
          row.qty && row.unitPrice ? mul(row.qty || 0, row.unitPrice || 0).toFixed(2) : '0.00',
      },
      {
        title: '??????',
        align: 'center',
        dataIndex: 'taxRate',
        render: val => (val ? `${val}%` : ''),
      },
      {
        title: '????????????',
        align: 'center',
        dataIndex: 'deliveryDate',
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

  renderColumns1View = () => {
    const { dispatch, form, pageConfig } = this.props;

    const fields = [
      {
        title: '????????????',
        dataIndex: 'collectionStage',
        align: 'center',
      },
      {
        title: '??????????????????',
        align: 'center',
        dataIndex: 'collectionAmt',
        render: val => (val ? val.toFixed(2) : '0.00'),
      },
      {
        title: '??????????????????%',
        align: 'center',
        dataIndex: 'collectionRate',
        render: val => (val ? `${val}%` : ''),
      },
      {
        title: '??????????????????',
        align: 'center',
        dataIndex: 'expectedCollectionDate',
      },
      {
        title: '??????',
        align: 'center',
        dataIndex: 'taxRate',
        render: val => (val ? `${val}%` : ''),
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
    const {
      dispatch,
      loading,
      form,
      formData,
      formMode,
      detailDelViews,
      planDelViews,
      attachments,
    } = this.props;
    const { detailViews = [], planViews = [] } = formData;
    const allBpm = [
      { docId: formData.id, procDefKey: 'SAL01', title: '?????????????????????' },
      { docId: formData.id, procDefKey: 'SAL03', title: '?????????????????????' },
    ];

    return (
      <PageWrapper>
        {this.renderPage()}

        <DataTable
          title="???????????????"
          columns={this.renderColumnsView()}
          dataSource={detailViews}
          prodSelection={false}
        />

        <DataTable
          title="????????????"
          columns={this.renderColumns1View()}
          dataSource={planViews}
          prodSelection={false}
        />
        <BpmConnection source={allBpm} />
      </PageWrapper>
    );
  }
}

export default indexCom;
