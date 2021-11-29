import React from 'react';
import { Input } from 'antd';

import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect } from '@/pages/gen/field';

import { AddrEditContext } from './index';

const { Field } = FieldList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrEditT9 = props => (
  <AddrEditContext.Consumer>
    {({ form: { getFieldDecorator }, custData }) => (
      <FieldList
        layout="horizontal"
        legend="基本信息"
        getFieldDecorator={getFieldDecorator}
        col={2}
      >
        <Field
          name="abNo"
          label="客户编号"
          decorator={{
            initialValue: custData.abNo,
          }}
        >
          <Input disabled placeholder="[系统自动生成]" />
        </Field>
        <Field
          name="supplierNo"
          label="客户ID"
          decorator={{
            initialValue: custData.id,
          }}
        >
          <Input disabled placeholder="[系统自动生成]" />
        </Field>
        <Field
          name="custCat1"
          label="客户类别"
          decorator={{
            initialValue: custData.custCat1,
            rules: [
              {
                required: true,
                message: '请选择客户类别',
              },
            ],
          }}
        >
          <UdcSelect code="TSK:CUST_CAT1" placeholder="请选择客户类别" />
        </Field>
        <Field
          name="custCat2"
          label="客户小类"
          decorator={{
            initialValue: custData.custCat2,
            rules: [
              {
                required: true,
                message: '请选择客户小类',
              },
            ],
          }}
        >
          <UdcSelect code="TSK:CUST_CAT2" placeholder="请选择客户小类" />
        </Field>
      </FieldList>
    )}
  </AddrEditContext.Consumer>
);

AddrEditT9.Title = props => (
  <AddrEditContext.Consumer>
    {({ tabModified, formData, custData }) => (
      <span
        className={
          !formData.abNo || !custData || !custData.abNo ? 'tw-card-multiTab-disabled' : void 0
        }
      >
        <Title dir="right" icon={tabModified[8] ? 'warning' : null} text="客户" />
      </span>
    )}
  </AddrEditContext.Consumer>
);

export default AddrEditT9;
