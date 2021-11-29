import React from 'react';

import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect } from '@/pages/gen/field';
// import Loading from '@/components/core/DataLoading';

import { AddrEditContext } from './index';
// import { Input } from 'antd';

const { Field } = FieldList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrEditT8 = props => (
  <AddrEditContext.Consumer>
    {({ form: { getFieldDecorator }, formData }) => (
      <FieldList layout="horizontal" legend="类别码" getFieldDecorator={getFieldDecorator} col={2}>
        <Field
          name="abCat1"
          label="类型1"
          decorator={{
            initialValue: formData.abCat1,
          }}
        >
          <UdcSelect code="TSK:AB_CAT1" placeholder="请选择类型1" />
        </Field>
        <Field
          name="abCat2"
          label="类型2"
          decorator={{
            initialValue: formData.abCat2,
          }}
        >
          <UdcSelect code="TSK:AB_CAT2" placeholder="请选择类型2" />
        </Field>
        <Field
          name="abCat3"
          label="类型3"
          decorator={{
            initialValue: formData.abCat3,
          }}
        >
          <UdcSelect code="TSK:AB_CAT3" placeholder="请选择类型3" />
        </Field>
        <Field
          name="abCat4"
          label="类型4"
          decorator={{
            initialValue: formData.abCat4,
          }}
        >
          <UdcSelect code="TSK:AB_CAT4" placeholder="请选择类型4" />
        </Field>
        <Field
          name="abCat5"
          label="类型5"
          decorator={{
            initialValue: formData.abCat5,
          }}
        >
          <UdcSelect code="TSK:AB_CAT5" placeholder="请选择类型5" />
        </Field>
        <Field
          name="abCat6"
          label="类型6"
          decorator={{
            initialValue: formData.abCat6,
          }}
        >
          <UdcSelect code="TSK:AB_CAT6" placeholder="请选择类型6" />
        </Field>
        <Field
          name="abCat7"
          label="类型7"
          decorator={{
            initialValue: formData.abCat7,
          }}
        >
          <UdcSelect code="TSK:AB_CAT7" placeholder="请选择类型7" />
        </Field>
        <Field
          name="abCat8"
          label="类型8"
          decorator={{
            initialValue: formData.abCat8,
          }}
        >
          <UdcSelect code="TSK:AB_CAT8" placeholder="请选择类型8" />
        </Field>
        <Field
          name="abCat9"
          label="类型9"
          decorator={{
            initialValue: formData.abCat9,
          }}
        >
          <UdcSelect code="TSK:AB_CAT9" placeholder="请选择类型9" />
        </Field>
        <Field
          name="abCat10"
          label="类型10"
          decorator={{
            initialValue: formData.abCat10,
          }}
        >
          <UdcSelect code="TSK:AB_CAT10" placeholder="请选择类型10" />
        </Field>
        <Field
          name="abCat11"
          label="类型11"
          decorator={{
            initialValue: formData.abCat11,
          }}
        >
          <UdcSelect code="TSK:AB_CAT11" placeholder="请选择类型11" />
        </Field>
        <Field
          name="abCat12"
          label="类型12"
          decorator={{
            initialValue: formData.abCat12,
          }}
        >
          <UdcSelect code="TSK:AB_CAT12" placeholder="请选择类型12" />
        </Field>
        <Field
          name="abCat13"
          label="类型13"
          decorator={{
            initialValue: formData.abCat13,
          }}
        >
          <UdcSelect code="TSK:AB_CAT13" placeholder="请选择类型13" />
        </Field>
        <Field
          name="abCat14"
          label="类型14"
          decorator={{
            initialValue: formData.abCat14,
          }}
        >
          <UdcSelect code="TSK:AB_CAT14" placeholder="请选择类型14" />
        </Field>
        <Field
          name="abCat15"
          label="类型15"
          decorator={{
            initialValue: formData.abCat15,
          }}
        >
          <UdcSelect code="TSK:AB_CAT15" placeholder="请选择类型15" />
        </Field>
      </FieldList>
    )}
  </AddrEditContext.Consumer>
);

AddrEditT8.Title = props => (
  <AddrEditContext.Consumer>
    {({ tabModified, formData }) => (
      <span className={!formData.abNo ? 'tw-card-multiTab-disabled' : void 0}>
        <Title dir="right" icon={tabModified[7] ? 'warning' : null} text="类别码" />
      </span>
    )}
  </AddrEditContext.Consumer>
);

export default AddrEditT8;
