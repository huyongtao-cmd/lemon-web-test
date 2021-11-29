import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect } from '@/pages/gen/field';

const { Field } = FieldList;

@connect(({ loading, dispatch }) => ({
  loading,
  dispatch,
}))
class CategoryEdit extends PureComponent {
  componentDidMount() {}

  renderPage = () => {
    const {
      form: { getFieldDecorator },
      userOppsDetail: { formData, catCodePageConfig },
    } = this.props;
    // console.log(catCodePageConfig, 'catCodePageConfig');
    if (!catCodePageConfig.pageBlockViews || catCodePageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = catCodePageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    // console.log(pageFieldJson, 'pageFieldJson');
    const fields = [
      <Field
        name="oppoCat1"
        key="oppoCat1"
        label={pageFieldJson.oppoCat1.displayName}
        sortNo={pageFieldJson.oppoCat1.sortNo}
        decorator={{
          initialValue: formData.oppoCat1,
          rules: [
            {
              required: !!pageFieldJson.oppoCat1.requiredFlag,
              message: `请输入${pageFieldJson.oppoCat1.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder="产品厂商渠道负责人" />
      </Field>,
      <Field
        name="oppoCat2"
        key="oppoCat2"
        label={pageFieldJson.oppoCat2.displayName}
        sortNo={pageFieldJson.oppoCat2.sortNo}
        decorator={{
          initialValue: formData.oppoCat2,
          rules: [
            {
              required: !!pageFieldJson.oppoCat2.requiredFlag,
              message: `请输入${pageFieldJson.oppoCat2.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder="产品厂商区域负责人" />
      </Field>,
      <Field
        name="oppoCat3"
        key="oppoCat3"
        label={pageFieldJson.oppoCat3.displayName}
        sortNo={pageFieldJson.oppoCat3.sortNo}
        decorator={{
          initialValue: formData.oppoCat3,
          rules: [
            {
              required: !!pageFieldJson.oppoCat3.requiredFlag,
              message: `请输入${pageFieldJson.oppoCat3.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder="产品厂商销售负责人" />
      </Field>,
      <Field
        name="oppoCat4"
        key="oppoCat4"
        label={pageFieldJson.oppoCat4.displayName}
        sortNo={pageFieldJson.oppoCat4.sortNo}
        decorator={{
          initialValue: formData.oppoCat4,
          rules: [
            {
              required: !!pageFieldJson.oppoCat4.requiredFlag,
              message: `请输入${pageFieldJson.oppoCat4.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="TSK:OPPO_CAT4" />
      </Field>,
      <Field
        name="oppoCat5"
        key="oppoCat5"
        label={pageFieldJson.oppoCat5.displayName}
        sortNo={pageFieldJson.oppoCat5.sortNo}
        decorator={{
          initialValue: formData.oppoCat5,
          rules: [
            {
              required: !!pageFieldJson.oppoCat5.requiredFlag,
              message: `请输入${pageFieldJson.oppoCat5.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="TSK:OPPO_CAT5" />
      </Field>,
      <Field
        name="oppoCat6"
        key="oppoCat6"
        label={pageFieldJson.oppoCat6.displayName}
        sortNo={pageFieldJson.oppoCat6.sortNo}
        decorator={{
          initialValue: formData.oppoCat6,
          rules: [
            {
              required: !!pageFieldJson.oppoCat6.requiredFlag,
              message: `请输入${pageFieldJson.oppoCat6.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="TSK:OPPO_CAT6" />
      </Field>,
      <Field
        name="oppoCat7"
        key="oppoCat7"
        label={pageFieldJson.oppoCat7.displayName}
        sortNo={pageFieldJson.oppoCat7.sortNo}
        decorator={{
          initialValue: formData.oppoCat7,
          rules: [
            {
              required: !!pageFieldJson.oppoCat7.requiredFlag,
              message: `请输入${pageFieldJson.oppoCat7.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="TSK:OPPO_CAT7" />
      </Field>,
      <Field
        name="oppoCat8"
        key="oppoCat8"
        label={pageFieldJson.oppoCat8.displayName}
        sortNo={pageFieldJson.oppoCat8.sortNo}
        decorator={{
          initialValue: formData.oppoCat8,
          rules: [
            {
              required: !!pageFieldJson.oppoCat8.requiredFlag,
              message: `请输入${pageFieldJson.oppoCat8.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="TSK:OPPO_CAT8" />
      </Field>,
      <Field
        name="oppoCat9"
        key="oppoCat9"
        label={pageFieldJson.oppoCat9.displayName}
        sortNo={pageFieldJson.oppoCat9.sortNo}
        decorator={{
          initialValue: formData.oppoCat9,
          rules: [
            {
              required: !!pageFieldJson.oppoCat9.requiredFlag,
              message: `请输入${pageFieldJson.oppoCat9.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="TSK:OPPO_CAT9" />
      </Field>,
      <Field
        name="oppoCat10"
        key="oppoCat10"
        label={pageFieldJson.oppoCat10.displayName}
        sortNo={pageFieldJson.oppoCat10.sortNo}
        decorator={{
          initialValue: formData.oppoCat10,
          rules: [
            {
              required: !!pageFieldJson.oppoCat10.requiredFlag,
              message: `请输入${pageFieldJson.oppoCat10.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="TSK:OPPO_CAT10" />
      </Field>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    return (
      <FieldList layout="horizontal" legend="类别码" getFieldDecorator={getFieldDecorator} col={2}>
        {filterList}
      </FieldList>
    );
  };

  render() {
    const {
      form: { getFieldDecorator },
      userOppsDetail: { formData, catCodePageConfig },
    } = this.props;
    // console.log(catCodePageConfig, 'catCodePageConfig');
    return this.renderPage();
  }
}

export default CategoryEdit;
