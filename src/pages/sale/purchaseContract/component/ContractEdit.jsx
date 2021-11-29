import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, DatePicker, InputNumber, Button, Divider, Radio } from 'antd';
import moment from 'moment';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import EditableDataTable from '@/components/common/EditableDataTable';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { fromQs, getGuid } from '@/utils/stringUtils';
import { paymentTableProps, purchaseTableProps } from '../config';
import style from '../style.less';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'salePurchaseEdit';
const FieldListLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];
@connect(({ salePurchaseEdit, loading }) => ({
  loading,
  salePurchaseEdit,
}))
@mountToTab()
class ContractEdit extends PureComponent {
  componentDidMount() {}

  handlePurchaseLegal = (key, data) => {
    const { form, dispatch } = this.props;
    form.setFieldsValue({
      purchaseLegalNo: key,
      purchaseLegalName: data ? data.props.title : null,
    });
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        purchaseLegalNo: key,
        purchaseLegalName: data ? data.props.title : null,
      },
    });
  };

  handleSupplier = (key, data) => {
    const {
      form,
      dispatch,
      salePurchaseEdit: { allAbOusArr },
    } = this.props;
    // key &&
    //   dispatch({
    //     type: `${DOMAIN}/selectOus`,
    //     payload: {
    //       abNo: key,
    //     },
    //   });
    const invoice = allAbOusArr.find(item => item.code === key);
    form.setFieldsValue({
      supplierLegalNo: key,
      supplierLegalName: data ? data.props.title : null,
      invoice: invoice ? invoice.id : null,
    });
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        supplierLegalNo: key,
        supplierLegalName: data ? data.props.title : null,
        invoice: invoice ? invoice.id : null,
        invoiceName: invoice ? invoice.name : null,
      },
    });
  };

  invoiceChange = value => {
    const {
      dispatch,
      salePurchaseEdit: { allAbOusArr },
    } = this.props;
    const invoice = allAbOusArr.find(item => item.id + '' === value);
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        invoice: invoice ? invoice.id : null,
        invoiceName: invoice ? invoice.name : null,
      },
    });
  };

  purchaseInchargeResChange = value => {
    const {
      dispatch,
      salePurchaseEdit: { purchaseInchargeResArr },
    } = this.props;
    const purchaseInchargeRes = purchaseInchargeResArr.find(item => item.id + '' === value);
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        purchaseInchargeResId: purchaseInchargeRes ? purchaseInchargeRes.id : null,
        purchaseInchargeResName: purchaseInchargeRes ? purchaseInchargeRes.name : null,
      },
    });
  };

  linkageBu = value => {
    const {
      dispatch,
      form,
      salePurchaseEdit: { purchaseBuArr },
    } = this.props;
    const purchaseBu = purchaseBuArr.find(item => item.id + '' === value);
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        purchaseBuId: purchaseBu ? purchaseBu.id : null,
        purchaseBuName: purchaseBu ? purchaseBu.name : null,
      },
    });
    if (value) {
      dispatch({
        type: `${DOMAIN}/linkageBu`,
        payload: value,
      }).then(res => {
        form.setFieldsValue({
          purchaseLegalNo: res.purchaseLegalNo,
          purchaseLegalName: res.purchaseLegalName,
        });
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            purchaseLegalNo: res.purchaseLegalNo,
            purchaseLegalName: res.purchaseLegalName,
          },
        });
      });
    } else {
      form.setFieldsValue({
        purchaseLegalNo: null,
        purchaseLegalName: null,
      });
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          purchaseLegalNo: null,
          purchaseLegalName: null,
        },
      });
    }
  };

  linkageSupplier = value => {
    const { dispatch, form } = this.props;
    if (value) {
      dispatch({
        type: `${DOMAIN}/linkageSupplier`,
        payload: value,
      }).then(res => {
        if (res.buId) {
          form.setFieldsValue({
            supplierLegalNo: res.supplierLegalNo,
            supplierLegalName: res.supplierLegalName,
          });
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              supplierLegalNo: res.supplierLegalNo,
              supplierLegalName: res.supplierLegalName,
            },
          });
        }
      });
    }
  };

  handleAcceptanceType = value => {
    const {
      dispatch,
      salePurchaseEdit: { formData, paymentList },
    } = this.props;
    if (value && formData.relatedProjectId) {
      dispatch({
        type: `${DOMAIN}/selectMileStone`,
        payload: {
          // projId: formData.relatedProjectId,
          taskId: formData.relatedTask,
          acceptanceType: value,
        },
      });
    }
    paymentList.forEach((item, index) => {
      paymentList[index].milestone = null;
      paymentList[index].milestoneName = null;
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        paymentList,
        milestoneArr: [],
      },
    });
  };

  // handleProject = value => {
  //   const {
  //     dispatch,
  //     form,
  //     salePurchaseEdit: { formData, paymentList, projectArr },
  //   } = this.props;
  //   const project = projectArr.find(item => item.id + '' === value);
  //   form.setFieldsValue({
  //     relatedTask: null,
  //   });
  //   dispatch({
  //     type: `${DOMAIN}/updateForm`,
  //     payload: {
  //       relatedProjectId: project ? project.id : null,
  //       relatedProjectName: project ? project.name : null,
  //       relatedTask: null,
  //       relatedTaskName: null,
  //     },
  //   });
  //   value &&
  //     dispatch({
  //       type: `${DOMAIN}/selectTask`,
  //       payload: {
  //         projId: value,
  //       },
  //     });
  //   dispatch({
  //     type: `${DOMAIN}/updateState`,
  //     payload: {
  //       taskArr: [],
  //     },
  //   });
  //   if (formData.acceptanceType && value) {
  //     dispatch({
  //       type: `${DOMAIN}/selectMileStone`,
  //       payload: {
  //         projId: value,
  //         acceptanceType: formData.acceptanceType,
  //       },
  //     });
  //   }
  //   paymentList.forEach((item, index) => {
  //     paymentList[index].milestone = null;
  //     paymentList[index].milestoneName = null;
  //   });
  //   dispatch({
  //     type: `${DOMAIN}/updateState`,
  //     payload: {
  //       paymentList,
  //       milestoneArr: [],
  //     },
  //   });
  // };

  taskChange = value => {
    const {
      dispatch,
      form,
      salePurchaseEdit: { taskArr, formData, paymentList },
    } = this.props;
    const task = taskArr.find(item => item.id + '' === value);
    form.setFieldsValue({
      relatedProjectName: null,
      relatedSalesContractName: null,
    });
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        relatedTask: task ? task.id : null,
        relatedTaskName: task ? task.name : null,
        relatedProjectId: null,
        relatedProjectName: null,
        relatedSalesContract: null,
        relatedSalesContractName: null,
      },
    });
    value &&
      dispatch({
        type: `${DOMAIN}/selectProjectByTaskId`,
        payload: value,
      }).then(res => {
        form.setFieldsValue({
          relatedProjectName: res.name,
          relatedSalesContractName: res.valSphd2,
        });
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            relatedProjectId: res.id,
            relatedProjectName: res.name,
            relatedSalesContract: res.valSphd1,
            relatedSalesContractName: res.valSphd2,
          },
        });
        res.valSphd1 &&
          dispatch({
            type: `${DOMAIN}/selectContractNode`,
            payload: {
              contractId: res.valSphd1,
            },
          });
      });
    if (formData.acceptanceType && value) {
      dispatch({
        type: `${DOMAIN}/selectMileStone`,
        payload: {
          // projId: value,
          taskId: value,
          acceptanceType: formData.acceptanceType,
        },
      });
    }
    paymentList.forEach((item, index) => {
      paymentList[index].milestone = null;
      paymentList[index].milestoneName = null;
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        paymentList,
        milestoneArr: [],
      },
    });
  };

  render() {
    const {
      loading,
      salePurchaseEdit: {
        formData,
        invoiceArr,
        taskArr,
        pageConfig,
        abOusArr,
        allAbOusArr,
        purchaseBuArr,
        purchaseInchargeResArr,
        projectArr,
      },
      form: { getFieldDecorator },
      dispatch,
      salePurchaseEdit,
      form,
    } = this.props;
    const param = fromQs();

    // 页面配置数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews.filter(
      item => item.blockKey === 'PURCHASE_CONTRACT_MANAGEMENT'
    )[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const mainFields = [
      <Field
        name="contractNo"
        key="contractNo"
        sortNo={pageFieldJson.contractNo.sortNo}
        label={pageFieldJson.contractNo.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.contractNo,
          rules: [
            {
              required: !!pageFieldJson.contractNo.requiredFlag,
              message: `请输入${pageFieldJson.contractNo.displayName}`,
            },
          ],
        }}
      >
        <Input
          disabled={pageFieldJson.contractNo.fieldMode !== 'EDITABLE'}
          placeholder="系统自动生成"
        />
      </Field>,

      <Field
        name="contractName"
        key="contractName"
        sortNo={pageFieldJson.contractName.sortNo}
        label={pageFieldJson.contractName.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.contractName,
          rules: [
            {
              required: !!pageFieldJson.contractName.requiredFlag,
              message: `请输入${pageFieldJson.contractName.displayName}`,
            },
          ],
        }}
      >
        <Input
          disabled={pageFieldJson.contractName.fieldMode !== 'EDITABLE'}
          placeholder={`请输入${pageFieldJson.contractName.displayName}`}
        />
      </Field>,

      <Field
        name="platType"
        key="platType"
        sortNo={pageFieldJson.platType.sortNo}
        label={pageFieldJson.platType.displayName}
        decorator={{
          initialValue: formData.platType,
          rules: [
            {
              required: !!pageFieldJson.platType.requiredFlag,
              message: `请选择${pageFieldJson.platType.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.UDC
          code="TSK.PLAT_TYPE"
          placeholder={`请选择${pageFieldJson.platType.displayName}`}
          disabled={pageFieldJson.platType.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        name="purchaseType"
        key="purchaseType"
        sortNo={pageFieldJson.purchaseType.sortNo}
        label={pageFieldJson.purchaseType.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.purchaseType,
          rules: [
            {
              required: !!pageFieldJson.purchaseType.requiredFlag,
              message: `请选择${pageFieldJson.purchaseType.displayName}`,
            },
          ],
        }}
      >
        <Selection.UDC
          code="TSK:PURCHASE_TYPE3"
          placeholder={`请选择${pageFieldJson.purchaseType.displayName}`}
          disabled={pageFieldJson.purchaseType.fieldMode !== 'EDITABLE'}
        />
      </Field>,

      <Field
        name="businessType"
        key="businessType"
        sortNo={pageFieldJson.businessType.sortNo}
        label={pageFieldJson.businessType.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.businessType,
          rules: [
            {
              required: !!pageFieldJson.businessType.requiredFlag,
              message: `请选择${pageFieldJson.businessType.displayName}`,
            },
          ],
        }}
      >
        <Selection.UDC
          code="TSK:BUSINESS_TYPE"
          placeholder={`请选择${pageFieldJson.businessType.displayName}`}
          disabled={pageFieldJson.businessType.fieldMode !== 'EDITABLE'}
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
          onChange={this.handleAcceptanceType}
        />
      </Field>,

      <FieldLine
        key="purchaseLegalNo"
        sortNo={pageFieldJson.purchaseLegalNo.sortNo}
        label={pageFieldJson.purchaseLegalNo.displayName}
        {...FieldListLayout}
        required={!!pageFieldJson.purchaseLegalNo.requiredFlag}
      >
        <Field
          name="purchaseLegalName"
          decorator={{
            initialValue: formData.purchaseLegalName,
            rules: [
              {
                required: !!pageFieldJson.purchaseLegalNo.requiredFlag,
                message: `请选择${pageFieldJson.purchaseLegalNo.displayName}`,
              },
            ],
          }}
          wrapperCol={{ span: 23, xxl: 23 }}
        >
          <AsyncSelect
            source={abOusArr}
            showSearch
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={this.handlePurchaseLegal}
            placeholder={`请选择${pageFieldJson.purchaseLegalNo.displayName}`}
            disabled={pageFieldJson.purchaseLegalNo.fieldMode !== 'EDITABLE'}
          />
        </Field>
        <Field
          name="purchaseLegalNo"
          decorator={{
            initialValue: formData.purchaseLegalNo,
          }}
          wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
        >
          <Input disabled />
        </Field>
      </FieldLine>,

      <Field
        name="purchaseBuId"
        key="purchaseBuId"
        sortNo={pageFieldJson.purchaseBuId.sortNo}
        label={pageFieldJson.purchaseBuId.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.purchaseBuId,
          rules: [
            {
              required: !!pageFieldJson.purchaseBuId.requiredFlag,
              message: `请选择${pageFieldJson.purchaseBuId.displayName}`,
            },
          ],
        }}
      >
        <Selection
          source={purchaseBuArr}
          onChange={this.linkageBu}
          placeholder={`请选择${pageFieldJson.purchaseBuId.displayName}`}
          disabled={pageFieldJson.purchaseBuId.fieldMode !== 'EDITABLE'}
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
          source={purchaseInchargeResArr}
          placeholder={`请选择${pageFieldJson.purchaseInchargeResId.displayName}`}
          showSearch
          disabled={pageFieldJson.purchaseInchargeResId.fieldMode !== 'EDITABLE'}
          // onChange={this.linkageSupplier}
          onChange={this.purchaseInchargeResChange}
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
          name="supplierLegalName"
          decorator={{
            initialValue: formData.supplierLegalName,
            rules: [
              {
                required: !!pageFieldJson.supplierLegalNo.requiredFlag,
                message: `请选择${pageFieldJson.supplierLegalNo.displayName}`,
              },
            ],
          }}
          wrapperCol={{ span: 23, xxl: 23 }}
        >
          <AsyncSelect
            source={allAbOusArr}
            showSearch
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
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
        name="applicationDate"
        key="applicationDate"
        sortNo={pageFieldJson.applicationDate.sortNo}
        label={pageFieldJson.applicationDate.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.applicationDate ? moment(formData.applicationDate) : null,
          rules: [
            {
              required: !!pageFieldJson.applicationDate.requiredFlag,
              message: `请选择${pageFieldJson.applicationDate.displayName}`,
            },
          ],
        }}
      >
        <DatePicker
          placeholder={`请选择${pageFieldJson.applicationDate.displayName}`}
          format="YYYY-MM-DD"
          className="x-fill-100"
          disabled={pageFieldJson.applicationDate.fieldMode !== 'EDITABLE'}
        />
      </Field>,

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
        name="remark"
        key="remark"
        sortNo={pageFieldJson.remark.sortNo}
        label={pageFieldJson.remark.displayName}
        decorator={{
          initialValue: formData.remark,
          rules: [
            {
              required: !!pageFieldJson.remark.requiredFlag,
              message: `请输入${pageFieldJson.remark.displayName}`,
            },
          ],
        }}
        fieldCol={1}
        // className={style.remark}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
      >
        <Input.TextArea
          placeholder={`请输入${pageFieldJson.remark.displayName}`}
          rows={3}
          disabled={pageFieldJson.remark.fieldMode !== 'EDITABLE'}
        />
      </Field>,
    ];
    const mainFilterList = mainFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);

    const relatedFields = [
      <Field label="比价资料" name="attache" {...FieldListLayout}>
        <FileManagerEnhance
          api="/api/op/v1/purchase_contract_management/parity/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled={false}
        />
      </Field>,

      <Field label="合同附件" name="attache" {...FieldListLayout}>
        <FileManagerEnhance
          api="/api/op/v1/purchase_contract_management/purchase/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled={false}
        />
      </Field>,

      <Field label="上传盖章附件" name="attache" {...FieldListLayout}>
        <FileManagerEnhance
          api="/api/op/v1/purchase_contract_management/seal/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled={false}
        />
      </Field>,

      <Field
        name="relatedSalesContractName"
        key="relatedSalesContract"
        sortNo={pageFieldJson.relatedSalesContract.sortNo}
        label={pageFieldJson.relatedSalesContract.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.relatedSalesContractName,
          rules: [
            {
              required: !!pageFieldJson.relatedSalesContract.requiredFlag,
              message: `请输入${pageFieldJson.relatedSalesContract.displayName}`,
            },
          ],
        }}
      >
        <Input disabled={pageFieldJson.relatedSalesContract.fieldMode !== 'EDITABLE'} />
      </Field>,

      <Field
        name="relatedAgreement"
        key="relatedAgreement"
        sortNo={pageFieldJson.relatedAgreement.sortNo}
        label={pageFieldJson.relatedAgreement.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.relatedAgreement,
          rules: [
            {
              required: !!pageFieldJson.relatedAgreement.requiredFlag,
              message: `请输入${pageFieldJson.relatedAgreement.displayName}`,
            },
          ],
        }}
      >
        <Input disabled={pageFieldJson.relatedAgreement.fieldMode !== 'EDITABLE'} />
      </Field>,

      <Field
        name="demandNo"
        key="demandNo"
        sortNo={pageFieldJson.demandNo.sortNo}
        label={pageFieldJson.demandNo.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.demandNo,
          rules: [
            {
              required: !!pageFieldJson.demandNo.requiredFlag,
              message: `请输入${pageFieldJson.demandNo.displayName}`,
            },
          ],
        }}
      >
        <Input disabled={pageFieldJson.demandNo.fieldMode !== 'EDITABLE'} />
      </Field>,

      <Field
        name="relatedProjectName"
        key="relatedProjectId"
        sortNo={pageFieldJson.relatedProjectId.sortNo}
        label={pageFieldJson.relatedProjectId.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.relatedProjectName,
          rules: [
            {
              required: !!pageFieldJson.relatedProjectId.requiredFlag,
              message: `请选择${pageFieldJson.relatedProjectId.displayName}`,
            },
          ],
        }}
      >
        <Input disabled={pageFieldJson.relatedProjectId.fieldMode !== 'EDITABLE'} />
      </Field>,

      <Field
        name="relatedTask"
        key="relatedTask"
        sortNo={pageFieldJson.relatedTask.sortNo}
        label={pageFieldJson.relatedTask.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.relatedTask,
          rules: [
            {
              required: !!pageFieldJson.relatedTask.requiredFlag,
              message: `请选择${pageFieldJson.relatedTask.displayName}`,
            },
          ],
        }}
      >
        <Selection.Columns
          columns={applyColumns}
          source={taskArr}
          showSearch
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          placeholder={`请选择${pageFieldJson.relatedTask.displayName}`}
          disabled={pageFieldJson.relatedTask.fieldMode !== 'EDITABLE'}
          onChange={this.taskChange}
        />
      </Field>,
    ];
    const relatedFilterList = relatedFields
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
          onChange={this.invoiceChange}
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
            legend="采购合同信息"
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
            {relatedFilterList}
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
            {...purchaseTableProps(DOMAIN, dispatch, loading, salePurchaseEdit, form)}
          />
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
          <div className="tw-card-title">付款计划</div>
          <EditableDataTable {...paymentTableProps(DOMAIN, dispatch, loading, salePurchaseEdit)} />
        </Card>
      </>
    );
  }
}

export default ContractEdit;
