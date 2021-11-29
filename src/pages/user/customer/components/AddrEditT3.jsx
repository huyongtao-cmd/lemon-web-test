import React from 'react';
import { Input } from 'antd';

import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import { UdcSelect } from '@/pages/gen/field';
import { AddrEditContext } from '../customerInfoEdit';
// import Loading from '@/components/core/DataLoading';

const { Field } = FieldList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrEditT3 = props => (
  <AddrEditContext.Consumer>
    {({ form: { getFieldDecorator }, ouData, addrSel }) => (
      <FieldList
        layout="horizontal"
        legend="公司信息"
        getFieldDecorator={getFieldDecorator}
        col={2}
      >
        <Field
          name="ouName"
          label="公司名"
          decorator={{
            initialValue: ouData.ouName,
            rules: [
              {
                required: true,
                message: '请输入公司名',
              },
            ],
          }}
        >
          <Input placeholder="请输入公司名" />
        </Field>
        <Field
          name="ouType"
          label="公司类型"
          decorator={{
            initialValue: ouData.ouType,
            rules: [
              {
                required: true,
                message: '请选择公司类型',
              },
            ],
          }}
        >
          <UdcSelect code="TSK:OU_TYPE" placeholder="请选择公司类型" />
        </Field>
        <Field
          name="taxRegNo"
          label="税号"
          decorator={{
            initialValue: ouData.taxRegNo,
            rules: [
              {
                required: true,
                message: '请输入税号',
              },
            ],
          }}
        >
          <Input placeholder="请输入税号" />
        </Field>

        <Field
          name="taxRate"
          label="税率"
          decorator={{
            initialValue: ouData.taxRate,
            rules: [
              {
                required: false,
                message: '请选择税率',
              },
            ],
          }}
        >
          <UdcSelect code="COM:TAX_RATE" placeholder="请选择税率" />
        </Field>

        <Field
          name="innerType"
          label="内部/外部"
          decorator={{
            initialValue: ouData.innerType,
            rules: [
              {
                required: true,
                message: '请选择内部/外部',
              },
            ],
          }}
        >
          <UdcSelect code="TSK:INNER_TYPE" placeholder="请选择内部/外部" />
        </Field>
        <Field
          name="ouProp"
          label="公司性质"
          decorator={{
            initialValue: ouData.ouProp,
          }}
        >
          <UdcSelect code="TSK:OU_PROP" placeholder="请选择公司性质" />
        </Field>
        <Field
          name="regionCode"
          label="公司区域"
          decorator={{
            initialValue: ouData.regionCode,
          }}
        >
          <UdcSelect code="COM:COUNTRY" placeholder="请选择公司区域" />
        </Field>
        <Field
          name="pid"
          label="母公司"
          decorator={{
            initialValue: ouData.pid && ouData.pid + '',
          }}
        >
          {/* <Input placeholder="请输入公司名" /> */}
          <AsyncSelect
            source={addrSel}
            placeholder="请选择母公司"
            showSearch
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          />
        </Field>
        <Field
          name="website"
          label="企业主页"
          decorator={{
            initialValue: ouData.website,
          }}
        >
          <Input className="x-fill-100" addonBefore="http://" placeholder="请输入企业主页" />
        </Field>
        <Field
          name="industry"
          label="所属行业"
          decorator={{
            initialValue: ouData.industry,
          }}
        >
          <UdcSelect code="TSK:OU_IDST" placeholder="请选择所属行业" />
        </Field>
        <Field
          name="scaleType"
          label="单位规模"
          decorator={{
            initialValue: ouData.scaleType,
          }}
        >
          <UdcSelect code="TSK:OU_SCALE" placeholder="请选择单位规模" />
        </Field>
        <Field
          name="currCode"
          label="主交易货币"
          decorator={{
            initialValue: ouData.currCode,
          }}
        >
          <UdcSelect code="COM:CURRENCY_KIND" placeholder="请选择主交易货币" />
        </Field>
        <Field
          name="langCode"
          label="主要语言"
          decorator={{
            initialValue: ouData.langCode,
          }}
        >
          <UdcSelect code="COM:LANG_CODE" placeholder="请选择主要语言" />
        </Field>
        <Field
          name="ouStatus"
          label="公司状态"
          decorator={{
            initialValue: ouData.ouStatus,
          }}
        >
          <UdcSelect code="TSK:OU_STATUS" placeholder="请选择公司状态" />
        </Field>
      </FieldList>
    )}
  </AddrEditContext.Consumer>
);

AddrEditT3.Title = props => (
  <AddrEditContext.Consumer>
    {({ tabModified, formData }) => (
      <span
        className={
          !formData.abNo || formData.abType !== '02' ? 'tw-card-multiTab-disabled' : void 0
        }
      >
        <Title dir="right" icon={tabModified[3] ? 'warning' : null} text="公司信息" />
      </span>
    )}
  </AddrEditContext.Consumer>
);

export default AddrEditT3;
