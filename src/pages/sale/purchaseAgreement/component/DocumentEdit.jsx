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

const DOMAIN = 'salePurchaseAgreementsEdit';
const FieldListLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
@connect(({ salePurchaseAgreementsEdit, loading }) => ({
  loading,
  salePurchaseAgreementsEdit,
}))
@mountToTab()
class DocumentEdit extends PureComponent {
  componentDidMount() {}

  render() {
    const {
      loading,
      salePurchaseAgreementsEdit: { formData, pageConfig },
      form: { getFieldDecorator },
      dispatch,
    } = this.props;
    const readOnly = true;
    const { id } = fromQs();

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
        name="agreementStatus"
        key="agreementStatus"
        sortNo={pageFieldJson.agreementStatus.sortNo}
        label={pageFieldJson.agreementStatus.displayName}
        decorator={{
          initialValue: formData.agreementStatus,
          rules: [
            {
              required: !!pageFieldJson.agreementStatus.requiredFlag,
              message: `请选择${pageFieldJson.agreementStatus.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.UDC
          disabled={pageFieldJson.agreementStatus.fieldMode !== 'EDITABLE'}
          code="TSK.CONTRACT_STATUS"
        />
      </Field>,
      <Field
        name="attAgreementNo"
        key="attAgreementNo"
        sortNo={pageFieldJson.attAgreementNo.sortNo}
        label={pageFieldJson.attAgreementNo.displayName}
        {...FieldListLayout}
        decorator={{
          initialValue: formData.attAgreementNo,
          rules: [
            {
              required: !!pageFieldJson.attAgreementNo.requiredFlag,
              message: `请输入${pageFieldJson.attAgreementNo.displayName}`,
            },
          ],
        }}
      >
        <Input disabled={pageFieldJson.attAgreementNo.fieldMode !== 'EDITABLE'} />
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
        name="overDate"
        key="overDate"
        sortNo={pageFieldJson.overDate.sortNo}
        label={pageFieldJson.overDate.displayName}
        decorator={{
          initialValue: formData.overDate ? moment(formData.overDate) : null,
          rules: [
            {
              required: !!pageFieldJson.overDate.requiredFlag,
              message: `请选择${pageFieldJson.overDate.displayName}`,
            },
          ],
        }}
        {...FieldListLayout}
      >
        <DatePicker
          disabled={pageFieldJson.overDate.fieldMode !== 'EDITABLE'}
          format="YYYY-MM-DD"
          className="x-fill-100"
          placeholder=""
        />
      </Field>,
    ];
    const mainFilterList = mainFields
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
            {mainFilterList}
          </FieldList>
        </Card>
      </>
    );
  }
}

export default DocumentEdit;
