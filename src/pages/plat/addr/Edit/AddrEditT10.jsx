import React from 'react';
import { Input } from 'antd';

import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect } from '@/pages/gen/field';

import { AddrEditContext } from './index';

const { Field } = FieldList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrEditT10 = props => (
  <AddrEditContext.Consumer>
    {({ form: { getFieldDecorator }, supplierData }) => (
      <FieldList
        layout="horizontal"
        legend="供应商信息"
        getFieldDecorator={getFieldDecorator}
        col={2}
      >
        <Field
          name="supplierNo"
          label="供应商编号"
          decorator={{
            initialValue: supplierData.abNo,
          }}
        >
          <Input disabled placeholder="[系统自动生成]" />
        </Field>
        <Field
          name="id"
          label="供应商ID"
          decorator={{
            initialValue: supplierData.id,
          }}
        >
          <Input disabled placeholder="[系统自动生成]" />
        </Field>
      </FieldList>
    )}
  </AddrEditContext.Consumer>
);

AddrEditT10.Title = props => (
  <AddrEditContext.Consumer>
    {({ tabModified, formData, supplierData }) => (
      <span
        className={
          !formData.abNo || !supplierData || !supplierData.abNo
            ? 'tw-card-multiTab-disabled'
            : void 0
        }
      >
        <Title dir="right" icon={tabModified[9] ? 'warning' : null} text="供应商" />
      </span>
    )}
  </AddrEditContext.Consumer>
);

export default AddrEditT10;
