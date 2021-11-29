import React from 'react';
import { Input } from 'antd';

import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import { UdcSelect } from '@/pages/gen/field';

import { AddrEditContext } from '../customerInfoEdit';

const { Field } = FieldList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrEditT1 = props => (
  <AddrEditContext.Consumer>
    {({ form: { getFieldDecorator }, formData, abOuSel }) => {
      console.warn(formData);
      return (
        <FieldList
          layout="horizontal"
          legend="基本信息"
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          <Field
            name="abName"
            label="地址簿名称"
            decorator={{
              initialValue: formData.abName,
              rules: [
                {
                  required: true,
                  message: '请输入地址簿名称',
                },
              ],
            }}
          >
            <Input placeholder="地址簿名称" />
          </Field>
          <Field
            name="abNo"
            label="地址簿编号"
            decorator={{
              initialValue: formData.abNo,
            }}
          >
            <Input disabled placeholder="[系统自动生成]" />
          </Field>
          <Field
            name="abType"
            label="地址簿类型"
            decorator={{
              initialValue: formData.abType,
            }}
            popover={{
              placement: 'topLeft',
              trigger: 'hover',
              content: '个人填写个人信息，公司填写公司信息，BU不用填写详细信息。',
            }}
          >
            <UdcSelect
              code="COM:AB_TYPE"
              placeholder="请选择地址簿类型"
              disabled={!!formData.abNo}
            />
          </Field>
          <Field
            name="idenNo"
            label="唯一识别号"
            decorator={{
              initialValue: formData.idenNo,
              rules: [
                {
                  required: true,
                  message: '请输入编号',
                },
              ],
            }}
            popover={{
              placement: 'topLeft',
              trigger: 'hover',
              content: '不可与当前已存在记录重复',
            }}
          >
            <Input placeholder="唯一识别号" />
          </Field>
          <Field
            name="relateType"
            label="相关主档"
            decorator={{
              initialValue: Array.isArray(formData.relateType)
                ? formData.relateType
                : formData.relateType && formData.relateType.split(','),
            }}
          >
            <UdcSelect
              mode="multiple"
              code="TSK:AB_RELATE_TYPE"
              placeholder="请选择相关主档"
              disabled
            />
          </Field>

          <Field
            name="legalAbNo"
            label="法人地址薄"
            decorator={{
              initialValue: formData.legalAbNo,
            }}
          >
            <AsyncSelect
              source={abOuSel}
              placeholder="法人地址薄"
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            />
          </Field>
        </FieldList>
      );
    }}
  </AddrEditContext.Consumer>
);

AddrEditT1.Title = props => (
  <AddrEditContext.Consumer>
    {({ tabModified, formData }) => (
      <span>
        <Title dir="right" icon={tabModified[1] ? 'warning' : null} text="基本信息" />
      </span>
    )}
  </AddrEditContext.Consumer>
);

export default AddrEditT1;
