import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, DatePicker } from 'antd';
import moment from 'moment';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { fromQs, getGuid } from '@/utils/stringUtils';
import { toIsoDate } from '@/utils/timeUtils';
import style from '../style.less';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'salePurchaseEdit';
const FieldListLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
@connect(({ salePurchaseEdit, loading }) => ({
  loading,
  salePurchaseEdit,
}))
@mountToTab()
class DocumentEdit extends PureComponent {
  componentDidMount() {}

  render() {
    const {
      loading,
      salePurchaseEdit: { formData, pageConfig },
      form: { getFieldDecorator },
      dispatch,
      salePurchaseEdit,
    } = this.props;
    const readOnly = true;
    const { id } = fromQs();

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryPurchase`] || loading.effects[`${DOMAIN}/saveEdit`];

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
    const fields = [
      <Field
        name="createUserName"
        key="createUserId"
        sortNo={pageFieldJson.createUserId.sortNo}
        label={pageFieldJson.createUserId.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.createUserName,
          rules: [
            {
              required: !!pageFieldJson.createUserId.requiredFlag,
              message: `请输入${pageFieldJson.createUserId.displayName}`,
            },
          ],
        }}
      >
        <Input disabled={pageFieldJson.createUserId.fieldMode !== 'EDITABLE'} />
      </Field>,

      <Field
        name="createTime"
        key="createTime"
        sortNo={pageFieldJson.createTime.sortNo}
        label={pageFieldJson.createTime.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.createTime ? moment(formData.createTime) : null,
          rules: [
            {
              required: !!pageFieldJson.createTime.requiredFlag,
              message: `请选择${pageFieldJson.createTime.displayName}`,
            },
          ],
        }}
      >
        <DatePicker
          disabled={pageFieldJson.createTime.fieldMode !== 'EDITABLE'}
          format="YYYY-MM-DD"
          className="x-fill-100"
          placeholder=""
        />
      </Field>,

      <Field
        name="contractStatus"
        key="contractStatus"
        sortNo={pageFieldJson.contractStatus.sortNo}
        label={pageFieldJson.contractStatus.displayName}
        decorator={{
          initialValue: formData.contractStatus,
          rules: [
            {
              required: !!pageFieldJson.contractStatus.requiredFlag,
              message: `请选择${pageFieldJson.contractStatus.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.UDC
          disabled={pageFieldJson.contractStatus.fieldMode !== 'EDITABLE'}
          code="TSK.CONTRACT_STATUS"
        />
      </Field>,

      <Field
        name="contractSource"
        key="contractSource"
        sortNo={pageFieldJson.contractSource.sortNo}
        label={pageFieldJson.contractSource.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.contractSource,
          rules: [
            {
              required: !!pageFieldJson.contractSource.requiredFlag,
              message: `请输入${pageFieldJson.contractSource.displayName}`,
            },
          ],
        }}
      >
        <Input disabled={pageFieldJson.contractSource.fieldMode !== 'EDITABLE'} />
      </Field>,

      <Field
        name="contractSourceNo"
        key="contractSourceNo"
        sortNo={pageFieldJson.contractSourceNo.sortNo}
        label={pageFieldJson.contractSourceNo.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.contractSourceNo,
          rules: [
            {
              required: !!pageFieldJson.contractSourceNo.requiredFlag,
              message: `请输入${pageFieldJson.contractSourceNo.displayName}`,
            },
          ],
        }}
      >
        <Input disabled={pageFieldJson.contractSourceNo.fieldMode !== 'EDITABLE'} />
      </Field>,

      <Field
        name="activateDate"
        key="activateDate"
        sortNo={pageFieldJson.activateDate.sortNo}
        label={pageFieldJson.activateDate.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.activateDate ? moment(formData.activateDate) : null,
          rules: [
            {
              required: !!pageFieldJson.activateDate.requiredFlag,
              message: `请选择${pageFieldJson.activateDate.displayName}`,
            },
          ],
        }}
      >
        <DatePicker
          disabled={pageFieldJson.activateDate.fieldMode !== 'EDITABLE'}
          format="YYYY-MM-DD"
          className="x-fill-100"
          placeholder=""
        />
      </Field>,

      <Field
        name="overWhy"
        key="overWhy"
        sortNo={pageFieldJson.overWhy.sortNo}
        label={pageFieldJson.overWhy.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.overWhy,
          rules: [
            {
              required: !!pageFieldJson.overWhy.requiredFlag,
              message: `请输入${pageFieldJson.overWhy.displayName}`,
            },
          ],
        }}
      >
        <Input disabled={pageFieldJson.overWhy.fieldMode !== 'EDITABLE'} />
      </Field>,

      <Field
        name="overTime"
        key="overTime"
        sortNo={pageFieldJson.overTime.sortNo}
        label={pageFieldJson.overTime.displayName}
        decorator={{
          initialValue: formData.overTime ? moment(formData.overTime) : null,
          rules: [
            {
              required: !!pageFieldJson.overTime.requiredFlag,
              message: `请选择${pageFieldJson.overTime.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
      >
        <DatePicker
          disabled={pageFieldJson.overTime.fieldMode !== 'EDITABLE'}
          format="YYYY-MM-DD"
          className="x-fill-100"
          placeholder=""
        />
      </Field>,

      <Field
        name="preDocResId"
        key="preDocResId"
        sortNo={pageFieldJson.preDocResId.sortNo}
        label={pageFieldJson.preDocResId.displayName}
        decorator={{
          initialValue: formData.preDocResId,
          rules: [
            {
              required: !!pageFieldJson.preDocResId.requiredFlag,
              message: `请输入${pageFieldJson.preDocResId.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Input disabled={pageFieldJson.preDocResId.fieldMode !== 'EDITABLE'} />
      </Field>,
    ];
    const filterList = fields
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
            legend="单据信息"
            getFieldDecorator={getFieldDecorator}
            col={3}
            className={style.fill}
          >
            {filterList}
          </FieldList>
        </Card>
      </>
    );
  }
}

export default DocumentEdit;
