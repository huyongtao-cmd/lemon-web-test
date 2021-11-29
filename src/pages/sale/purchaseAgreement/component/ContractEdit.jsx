import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, DatePicker, InputNumber, Button, Divider, Radio } from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { isEmpty, takeLast, add, isNil, gte, lte } from 'ramda';
import update from 'immutability-helper';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import EditableDataTable from '@/components/common/EditableDataTable';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { fromQs, getGuid } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { toIsoDate } from '@/utils/timeUtils';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';
import router from 'umi/router';

import { selectBu, selectSupplier } from '@/services/user/Contract/sales';
import { selectBus } from '@/services/org/bu/bu';
import { selectUsers } from '@/services/sys/user';
import {
  selectAbOus,
  selectUsersWithBu,
  selectTaskByProjIds,
  selectOus,
  selectCusts,
  selectProject,
} from '@/services/gen/list';
import { purchaseTableProps } from '../config';
import style from '../style.less';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'salePurchaseAgreementsEdit';
const FieldListLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];
@connect(({ salePurchaseAgreementsEdit, loading }) => ({
  loading,
  salePurchaseAgreementsEdit,
}))
@mountToTab()
class ContractEdit extends PureComponent {
  componentDidMount() {}

  handlePurchaseLegal = value => {
    const {
      form,
      dispatch,
      salePurchaseAgreementsEdit: { abOusArr },
    } = this.props;
    const signingLegal = abOusArr.find(item => item.code === value);
    form.setFieldsValue({
      signingLegalNo: value,
      signingLegalDesc: signingLegal ? signingLegal.name : null,
    });
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        signingLegalNo: value,
        signingLegalDesc: signingLegal ? signingLegal.name : null,
      },
    });
  };

  handleSupplier = value => {
    const {
      form,
      dispatch,
      salePurchaseAgreementsEdit: { allAbOusArr },
    } = this.props;
    const invoice = allAbOusArr.find(item => item.code === value);
    form.setFieldsValue({
      supplierLegalNo: value,
      supplierLegalDesc: invoice ? invoice.name : null,
      invoice: invoice ? invoice.id : null,
    });
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        supplierLegalNo: value,
        supplierLegalDesc: invoice ? invoice.name : null,
        invoice: invoice ? invoice.id : null,
      },
    });
  };

  linkageBu = value => {
    const { dispatch, form } = this.props;
    if (value) {
      dispatch({
        type: `${DOMAIN}/linkageBu`,
        payload: value,
      }).then(res => {
        form.setFieldsValue({
          signingLegalNo: res.purchaseLegalNo,
          signingLegalDesc: res.purchaseLegalName,
        });
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            signingLegalNo: res.purchaseLegalNo,
            signingLegalDesc: res.purchaseLegalName,
          },
        });
      });
    } else {
      form.setFieldsValue({
        signingLegalNo: null,
        signingLegalDesc: null,
      });
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          signingLegalNo: null,
          signingLegalDesc: null,
        },
      });
    }
  };

  render() {
    const {
      loading,
      salePurchaseAgreementsEdit: { formData, pageConfig, abOusArr, allAbOusArr },
      form: { getFieldDecorator },
      dispatch,
      salePurchaseAgreementsEdit,
      form,
    } = this.props;
    const param = fromQs();

    // 页面配置数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews.find(
      item => item.blockKey === 'PUR_AGREEMENT_MASTER_SCOPE'
    );
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });

    const mainFields = [
      <Field
        name="purchaseAgreementNo"
        key="purchaseAgreementNo"
        sortNo={pageFieldJson.purchaseAgreementNo.sortNo}
        label={pageFieldJson.purchaseAgreementNo.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.purchaseAgreementNo,
          rules: [
            {
              required: !!pageFieldJson.purchaseAgreementNo.requiredFlag,
              message: `请输入${pageFieldJson.purchaseAgreementNo.displayName}`,
            },
          ],
        }}
      >
        <Input
          disabled={pageFieldJson.purchaseAgreementNo.fieldMode !== 'EDITABLE'}
          placeholder="系统自动生成"
        />
      </Field>,
      <Field
        name="purchaseAgreementName"
        key="purchaseAgreementName"
        sortNo={pageFieldJson.purchaseAgreementName.sortNo}
        label={pageFieldJson.purchaseAgreementName.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.purchaseAgreementName,
          rules: [
            {
              required: !!pageFieldJson.purchaseAgreementName.requiredFlag,
              message: `请输入${pageFieldJson.purchaseAgreementName.displayName}`,
            },
          ],
        }}
      >
        <Input
          disabled={pageFieldJson.purchaseAgreementName.fieldMode !== 'EDITABLE'}
          placeholder={`请输入${pageFieldJson.purchaseAgreementName.displayName}`}
        />
      </Field>,
      <Field
        name="agreementType"
        key="agreementType"
        sortNo={pageFieldJson.agreementType.sortNo}
        label={pageFieldJson.agreementType.displayName}
        decorator={{
          initialValue: formData.agreementType,
          rules: [
            {
              required: !!pageFieldJson.agreementType.requiredFlag,
              message: `请选择${pageFieldJson.agreementType.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.UDC
          code="TSK:AGREEMENT_TYPE"
          placeholder={`请选择${pageFieldJson.agreementType.displayName}`}
          disabled={pageFieldJson.agreementType.fieldMode !== 'EDITABLE'}
        />
      </Field>,
      <Field
        name="acceptanceType"
        key="acceptanceType"
        sortNo={pageFieldJson.acceptanceType.sortNo}
        label={pageFieldJson.acceptanceType.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.acceptanceType,
          rules: [
            {
              required: !!pageFieldJson.acceptanceType.requiredFlag,
              message: `请选择${pageFieldJson.acceptanceType.displayName}`,
            },
          ],
        }}
      >
        <Selection.UDC
          code="TSK:ACCEPTANCE_TYPE"
          placeholder={`请选择${pageFieldJson.acceptanceType.displayName}`}
          disabled={pageFieldJson.acceptanceType.fieldMode !== 'EDITABLE'}
        />
      </Field>,
      <Field
        name="signDate"
        key="signDate"
        sortNo={pageFieldJson.signDate.sortNo}
        label={pageFieldJson.signDate.displayName}
        decorator={{
          initialValue: formData.signDate ? moment(formData.signDate) : null,
          rules: [
            {
              required: !!pageFieldJson.signDate.requiredFlag,
              message: `请选择${pageFieldJson.signDate.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
      >
        <DatePicker
          placeholder={`请选择${pageFieldJson.signDate.displayName}`}
          format="YYYY-MM-DD"
          className="x-fill-100"
          disabled={pageFieldJson.signDate.fieldMode !== 'EDITABLE'}
        />
      </Field>,
      <Field
        name="effectiveDate"
        key="effectiveStartDate"
        sortNo={pageFieldJson.effectiveStartDate.sortNo}
        label={pageFieldJson.effectiveStartDate.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue:
            formData.effectiveStartDate && formData.effectiveEndDate
              ? [moment(formData.effectiveStartDate), moment(formData.effectiveEndDate)]
              : null,
          rules: [
            {
              required: !!pageFieldJson.effectiveStartDate.requiredFlag,
              message: `请选择${pageFieldJson.effectiveStartDate.displayName}`,
            },
          ],
        }}
      >
        <DatePicker.RangePicker
          placeholder={['开始日期', '结束日期']}
          format="YYYY-MM-DD"
          className="x-fill-100"
          disabled={pageFieldJson.effectiveStartDate.fieldMode !== 'EDITABLE'}
        />
      </Field>,
      <FieldLine
        key="signingLegalNo"
        sortNo={pageFieldJson.signingLegalNo.sortNo}
        label={pageFieldJson.signingLegalNo.displayName}
        {...FieldListLayout}
        required={!!pageFieldJson.signingLegalNo.requiredFlag}
      >
        <Field
          name="signingLegalDesc"
          decorator={{
            initialValue: formData.signingLegalDesc,
            rules: [
              {
                required: !!pageFieldJson.signingLegalNo.requiredFlag,
                message: `请选择${pageFieldJson.signingLegalNo.displayName}`,
              },
            ],
          }}
          wrapperCol={{ span: 23, xxl: 23 }}
        >
          <Selection
            source={abOusArr}
            showSearch
            onChange={this.handlePurchaseLegal}
            placeholder={`请选择${pageFieldJson.signingLegalNo.displayName}`}
            disabled={pageFieldJson.signingLegalNo.fieldMode !== 'EDITABLE'}
          />
        </Field>
        <Field
          name="signingLegalNo"
          decorator={{
            initialValue: formData.signingLegalNo,
          }}
          wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
        >
          <Input disabled />
        </Field>
      </FieldLine>,
      <Field
        name="signingBuId"
        key="signingBuId"
        sortNo={pageFieldJson.signingBuId.sortNo}
        label={pageFieldJson.signingBuId.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.signingBuId,
          rules: [
            {
              required: !!pageFieldJson.signingBuId.requiredFlag,
              message: `请选择${pageFieldJson.signingBuId.displayName}`,
            },
          ],
        }}
      >
        <Selection.ColumnsForBu
          onChange={this.linkageBu}
          placeholder={`请选择${pageFieldJson.signingBuId.displayName}`}
          disabled={pageFieldJson.signingBuId.fieldMode !== 'EDITABLE'}
        />
      </Field>,
      <Field
        name="purchaseInchargeResId"
        key="purchaseInchargeResId"
        sortNo={pageFieldJson.purchaseInchargeResId.sortNo}
        label={pageFieldJson.purchaseInchargeResId.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.purchaseInchargeResId,
          rules: [
            {
              required: !!pageFieldJson.purchaseInchargeResId.requiredFlag,
              message: `请选择${pageFieldJson.purchaseInchargeResId.displayName}`,
            },
          ],
        }}
      >
        <Selection.Columns
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          columns={applyColumns}
          source={() => selectUsersWithBu()}
          placeholder={`请选择${pageFieldJson.purchaseInchargeResId.displayName}`}
          showSearch
          disabled={pageFieldJson.purchaseInchargeResId.fieldMode !== 'EDITABLE'}
        />
      </Field>,
      <FieldLine
        key="supplierLegalNo"
        sortNo={pageFieldJson.supplierLegalNo.sortNo}
        label={pageFieldJson.supplierLegalNo.displayName}
        {...FieldListLayout}
        required={!!pageFieldJson.supplierLegalNo.requiredFlag}
      >
        <Field
          name="supplierLegalDesc"
          decorator={{
            initialValue: formData.supplierLegalDesc,
            rules: [
              {
                required: !!pageFieldJson.supplierLegalNo.requiredFlag,
                message: `请选择${pageFieldJson.supplierLegalNo.displayName}`,
              },
            ],
          }}
          wrapperCol={{ span: 23, xxl: 23 }}
        >
          <Selection
            source={allAbOusArr}
            showSearch
            onChange={this.handleSupplier}
            placeholder={`请选择${pageFieldJson.supplierLegalNo.displayName}`}
            disabled={pageFieldJson.supplierLegalNo.fieldMode !== 'EDITABLE'}
          />
        </Field>
        <Field
          name="supplierLegalNo"
          decorator={{
            initialValue: formData.supplierLegalNo,
          }}
          wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
        >
          <Input disabled />
        </Field>
      </FieldLine>,
      <Field
        name="currCode"
        key="currCode"
        sortNo={pageFieldJson.currCode.sortNo}
        label={pageFieldJson.currCode.displayName}
        decorator={{
          initialValue: formData.currCode,
          rules: [
            {
              required: !!pageFieldJson.currCode.requiredFlag,
              message: `请选择${pageFieldJson.currCode.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
      >
        <UdcSelect
          code="COM.CURRENCY_KIND"
          placeholder={`请选择${pageFieldJson.currCode.displayName}`}
          disabled={pageFieldJson.currCode.fieldMode !== 'EDITABLE'}
        />
      </Field>,
      <Field
        name="amt"
        key="amt"
        sortNo={pageFieldJson.amt.sortNo}
        label={pageFieldJson.amt.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.amt,
          rules: [
            {
              required: !!pageFieldJson.amt.requiredFlag,
              message: `请选择${pageFieldJson.amt.displayName}`,
            },
          ],
        }}
      >
        <Input disabled={pageFieldJson.amt.fieldMode !== 'EDITABLE'} />
      </Field>,
      <FieldLine
        key="taxRate"
        sortNo={pageFieldJson.taxRate.sortNo}
        label={`${pageFieldJson.taxRate.displayName}/${pageFieldJson.taxAmt.displayName}`}
        required={!!pageFieldJson.taxRate.requiredFlag}
        {...FieldListLayout}
      >
        <Field
          name="taxRate"
          decorator={{
            initialValue: formData.taxRate,
            rules: [
              {
                required: !!pageFieldJson.taxRate.requiredFlag,
                message: `请输入${pageFieldJson.taxRate.displayName}`,
              },
            ],
          }}
          wrapperCol={{ span: 23, xxl: 23 }}
        >
          <Input disabled={pageFieldJson.taxRate.fieldMode !== 'EDITABLE'} className="x-fill-100" />
        </Field>
        <Field
          name="taxAmt"
          decorator={{
            initialValue: formData.taxAmt,
            rules: [
              {
                required: !!pageFieldJson.taxAmt.requiredFlag,
                message: `请输入${pageFieldJson.taxAmt.displayName}`,
              },
            ],
          }}
          wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
        >
          <InputNumber
            disabled={pageFieldJson.taxAmt.fieldMode !== 'EDITABLE'}
            className="x-fill-100"
          />
        </Field>
      </FieldLine>,
      <Field
        name="agreementContent"
        key="agreementContent"
        sortNo={pageFieldJson.agreementContent.sortNo}
        label={pageFieldJson.agreementContent.displayName}
        decorator={{
          initialValue: formData.agreementContent,
          rules: [
            {
              required: !!pageFieldJson.agreementContent.requiredFlag,
              message: `请输入${pageFieldJson.agreementContent.displayName}`,
            },
          ],
        }}
        fieldCol={1}
        // className={style.remark}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
      >
        <Input.TextArea
          placeholder={`请输入${pageFieldJson.agreementContent.displayName}`}
          rows={3}
          disabled={pageFieldJson.agreementContent.fieldMode !== 'EDITABLE'}
        />
      </Field>,
    ];
    const mainFilterList = mainFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);

    const financeFields = [
      <Field
        name="invoice"
        key="invoice"
        sortNo={pageFieldJson.invoice.sortNo}
        label={pageFieldJson.invoice.displayName}
        decorator={{
          initialValue: formData.invoice,
          rules: [
            {
              required: !!pageFieldJson.invoice.requiredFlag,
              message: `请选择${pageFieldJson.invoice.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.Columns
          showSearch
          columns={applyColumns}
          placeholder={`请选择${pageFieldJson.invoice.displayName}`}
          source={allAbOusArr}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          disabled={pageFieldJson.invoice.fieldMode !== 'EDITABLE'}
        />
      </Field>,
      <Field
        name="payMethod"
        key="payMethod"
        sortNo={pageFieldJson.payMethod.sortNo}
        label={pageFieldJson.payMethod.displayName}
        decorator={{
          initialValue: formData.payMethod,
          rules: [
            {
              required: !!pageFieldJson.payMethod.requiredFlag,
              message: `请选择${pageFieldJson.payMethod.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
      >
        <UdcSelect
          placeholder={`请选择${pageFieldJson.payMethod.displayName}`}
          code="ACC.PAY_METHOD"
          disabled={pageFieldJson.payMethod.fieldMode !== 'EDITABLE'}
        />
      </Field>,
    ];
    const financeFilterList = financeFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);

    return (
      <>
        <Card
          className="tw-card-adjust"
          bordered={false}
          // title="采购合同"
        >
          <FieldList
            layout="horizontal"
            legend="采购协议信息"
            getFieldDecorator={getFieldDecorator}
            col={3}
            className={style.fill}
          >
            {mainFilterList}
          </FieldList>
        </Card>
        <Divider dashed />
        <Card
          className="tw-card-adjust"
          bordered={false}
          // title="采购合同"
        >
          <FieldList
            layout="horizontal"
            legend="相关单据"
            getFieldDecorator={getFieldDecorator}
            col={3}
            className={style.fill}
          >
            <Field label="比价资料" name="attache" {...FieldListLayout}>
              <FileManagerEnhance
                api="/api/op/v1/purchase_agreement/parity/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>
            <Field label="协议附件" name="attache" {...FieldListLayout}>
              <FileManagerEnhance
                api="/api/op/v1/purchase_agreement/agreement/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>
            <Field label="上传盖章附件" name="attache" {...FieldListLayout}>
              <FileManagerEnhance
                api="/api/op/v1/purchase_agreement/seal/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>
          </FieldList>
        </Card>
        <Divider dashed />
        <Card
          className="tw-card-adjust"
          bordered={false}
          // title="采购合同"
        >
          <FieldList
            layout="horizontal"
            legend="财务信息"
            getFieldDecorator={getFieldDecorator}
            col={3}
            className={style.fill}
          >
            {financeFilterList}
          </FieldList>
        </Card>
        <Divider dashed />
        <Card
          className="tw-card-adjust"
          bordered={false}
          // title="采购合同"
        >
          <div className="tw-card-title">采购明细</div>
          <EditableDataTable
            {...purchaseTableProps(DOMAIN, dispatch, salePurchaseAgreementsEdit, form)}
          />
        </Card>
      </>
    );
  }
}

export default ContractEdit;
