import React from 'react';
import { DatePicker, Input } from 'antd';
import moment from 'moment';

import { UdcCheck, UdcSelect } from '@/pages/gen/field';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import { formatDT } from '@/utils/tempUtils/DateTime';

import { AddrEditContext } from '../customerInfoEdit';

const { Field } = FieldList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrEditT2 = props => (
  <AddrEditContext.Consumer>
    {({ form: { getFieldDecorator }, personData }) => (
      <FieldList
        layout="horizontal"
        legend="基本信息"
        getFieldDecorator={getFieldDecorator}
        col={2}
      >
        <Field
          name="personName"
          label="姓名（中文）"
          decorator={{
            initialValue: personData.personName,
            rules: [
              {
                required: true,
                message: '请输入姓名',
              },
            ],
          }}
        >
          <Input placeholder="请输入姓名" />
        </Field>
        <Field
          name="foreignName"
          label="姓名（外文）"
          decorator={{
            initialValue: personData.foreignName,
            rules: [
              {
                required: true,
                message: '请输入姓名',
              },
            ],
          }}
        >
          <Input placeholder="请输入姓名" />
        </Field>
        <Field
          name="idType"
          label="证件类型"
          decorator={{
            initialValue: personData.idType,
            rules: [
              {
                required: true,
                message: '请选择证件类型',
              },
            ],
          }}
        >
          <UdcSelect code="COM:ID_TYPE" placeholder="请选择证件类型" />
        </Field>
        <Field
          name="idNo"
          label="证件号"
          decorator={{
            initialValue: personData.idNo,
            rules: [
              {
                required: true,
                message: '请输入证件号',
              },
            ],
          }}
        >
          <Input placeholder="请输入证件号" />
        </Field>
        <Field
          name="gender"
          label="性别"
          decorator={{
            initialValue: personData.gender,
            rules: [
              {
                required: true,
                message: '请选择性别',
              },
            ],
          }}
        >
          <UdcCheck multiple={false} code="COM.GENDER" placeholder="性别" />
        </Field>
        <Field
          name="birthday"
          label="生日"
          decorator={{
            initialValue: personData.birthday ? moment(personData.birthday) : null,
            rules: [{ required: true, message: '请选择生日' }],
          }}
        >
          <DatePicker
            className="x-fill-100"
            format="YYYY-MM-DD"
            disabledDate={
              current => !(current && current < moment().endOf('day')) //出生日期不能选今天之后的日期
            }
          />
        </Field>

        <Field
          name="nationality"
          label="国籍"
          decorator={{
            initialValue: personData.nationality,
          }}
        >
          <UdcSelect code="COM:COUNTRY" placeholder="国籍" />
        </Field>
        <Field
          name="birthplace"
          label="籍贯"
          decorator={{
            initialValue: personData.birthplace,
          }}
        >
          <Input placeholder="请输入籍贯" />
        </Field>
        <Field
          name="nation"
          label="民族"
          decorator={{
            initialValue: personData.nation,
          }}
        >
          <Input placeholder="请输入民族" />
        </Field>
        <Field
          name="marital"
          label="婚姻状况"
          decorator={{
            initialValue: personData.marital,
          }}
        >
          <UdcCheck code="COM:MARRIAGE" placeholder="婚姻状况" />
        </Field>
        <Field
          name="idValidFrom"
          label="证件有效期从"
          decorator={{
            initialValue: personData.idValidFrom && moment(personData.idValidFrom),
          }}
        >
          <DatePicker placeholder="证件有效期从" format="YYYY-MM-DD" className="x-fill-100" />
        </Field>
        <Field
          name="idValidTo"
          label="证件有效期至"
          decorator={{
            initialValue: personData.idValidTo && moment(personData.idValidTo),
          }}
        >
          <DatePicker placeholder="证件有效期至" format="YYYY-MM-DD" className="x-fill-100" />
        </Field>
      </FieldList>
    )}
  </AddrEditContext.Consumer>
);

AddrEditT2.Title = props => (
  <AddrEditContext.Consumer>
    {({ tabModified, formData }) => (
      <span
        className={
          !formData.abNo || formData.abType !== '01' ? 'tw-card-multiTab-disabled' : void 0
        }
      >
        <Title dir="right" icon={tabModified[2] ? 'warning' : null} text="个人信息" />
      </span>
    )}
  </AddrEditContext.Consumer>
);

export default AddrEditT2;
