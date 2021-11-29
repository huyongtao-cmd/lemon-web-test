import React from 'react';
import { Form } from 'antd';

import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import { UdcSelect } from '@/pages/gen/field';

import { SysProdContext, DOMAIN } from './sysProductDetail';

const { Field } = FieldList;
const { Description } = DescriptionList;

const ProdDetT3 = ({ getFieldDecorator, formData, treeData, canEdit }) => (
  <>
    {canEdit ? (
      <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
        <Field
          name="prodCat1"
          label="类别码1"
          decorator={{
            initialValue: formData.prodCat1,
          }}
        >
          <UdcSelect code="COM.PROD_CAT1" />
        </Field>
        <Field
          name="prodCat2"
          label="类别码2"
          decorator={{
            initialValue: formData.prodCat2,
          }}
        >
          <UdcSelect code="COM.PROD_CAT2" />
        </Field>
        <Field
          name="prodCat3"
          label="类别码3"
          decorator={{
            initialValue: formData.prodCat3,
          }}
        >
          <UdcSelect code="COM.PROD_CAT3" />
        </Field>
        <Field
          name="prodCat4"
          label="类别码4"
          decorator={{
            initialValue: formData.prodCat4,
          }}
        >
          <UdcSelect code="COM.PROD_CAT4" />
        </Field>
        <Field
          name="prodCat5"
          label="类别码5"
          decorator={{
            initialValue: formData.prodCat5,
          }}
        >
          <UdcSelect code="COM.PROD_CAT5" />
        </Field>
        <Field
          name="prodCat6"
          label="类别码6"
          decorator={{
            initialValue: formData.prodCat6,
          }}
        >
          <UdcSelect code="COM.PROD_CAT6" />
        </Field>
        <Field
          name="prodCat7"
          label="类别码7"
          decorator={{
            initialValue: formData.prodCat7,
          }}
        >
          <UdcSelect code="COM.PROD_CAT7" />
        </Field>
        <Field
          name="prodCat8"
          label="类别码8"
          decorator={{
            initialValue: formData.prodCat8,
          }}
        >
          <UdcSelect code="COM.PROD_CAT8" />
        </Field>
        <Field
          name="prodCat9"
          label="类别码9"
          decorator={{
            initialValue: formData.prodCat9,
          }}
        >
          <UdcSelect code="COM.PROD_CAT9" />
        </Field>
        <Field
          name="prodCat10"
          label="类别码10"
          decorator={{
            initialValue: formData.prodCat10,
          }}
        >
          <UdcSelect code="COM.PROD_CAT10" />
        </Field>
      </FieldList>
    ) : (
      <DescriptionList size="large" col={2} hasSeparator>
        <Description term="类别码1">{formData.prodCat1Name}</Description>
        <Description term="类别码2">{formData.prodCat2Name}</Description>
        <Description term="类别码3">{formData.prodCat3Name}</Description>
        <Description term="类别码4">{formData.prodCat4Name}</Description>
        <Description term="类别码5">{formData.prodCat5Name}</Description>
        <Description term="类别码6">{formData.prodCat6Name}</Description>
        <Description term="类别码7">{formData.prodCat7Name}</Description>
        <Description term="类别码8">{formData.prodCat8Name}</Description>
        <Description term="类别码9">{formData.prodCat9Name}</Description>
        <Description term="类别码10">{formData.prodCat10Name}</Description>
      </DescriptionList>
    )}
  </>
);

export default () => (
  <SysProdContext.Consumer>{allProps => <ProdDetT3 {...allProps} />}</SysProdContext.Consumer>
);
