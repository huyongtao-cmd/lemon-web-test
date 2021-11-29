import React from 'react';
import { Input, DatePicker } from 'antd';
import moment from 'moment';

import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import { UdcCheck, UdcSelect, Selection } from '@/pages/gen/field';
import { AddrEditContext } from './index';
import { fromQs } from '@/utils/stringUtils';

const { Field } = FieldList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
class AddrEditT1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectAbType: '',
    };
  }

  // 页面加载完成之后，判断是新增还是编辑
  componentDidMount() {
    const { dispatch } = this.props;
    const { no } = fromQs();
    this.setState({
      selectAbType: no ? '' : '02',
    });
  }

  // 选择公司或者个人
  handelChange = value => {
    this.setState({
      selectAbType: value,
    });
  };

  getTaxRate = v => {
    if (v === 0) {
      return '0';
    }
    return v;
  };

  render() {
    const { selectAbType } = this.state;
    let fieldList = '';
    return (
      <AddrEditContext.Consumer>
        {({ form: { getFieldDecorator }, formData, abOuSel, personData, ouData, addrSel }) => {
          if (selectAbType === '02' || formData.abType === '02') {
            fieldList = (
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
                    initialValue: this.getTaxRate(ouData.taxRate),
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
                  <Input
                    className="x-fill-100"
                    addonBefore="http://"
                    placeholder="请输入企业主页"
                  />
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
            );
          } else if (selectAbType === '01' || formData.abType === '01') {
            fieldList = (
              <FieldList
                layout="horizontal"
                legend="个人信息"
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
                    disabledDate={current => !(current && current < moment().endOf('day'))}
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
                  <DatePicker
                    placeholder="证件有效期从"
                    format="YYYY-MM-DD"
                    className="x-fill-100"
                  />
                </Field>
                <Field
                  name="idValidTo"
                  label="证件有效期至"
                  decorator={{
                    initialValue: personData.idValidTo && moment(personData.idValidTo),
                  }}
                >
                  <DatePicker
                    placeholder="证件有效期至"
                    format="YYYY-MM-DD"
                    className="x-fill-100"
                  />
                </Field>
              </FieldList>
            );
          }
          return (
            <>
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
                    initialValue: formData.abType || '02', // 默认公司
                  }}
                  popover={{
                    placement: 'topLeft',
                    trigger: 'hover',
                    content: '个人填写个人信息，公司填写公司信息，BU不用填写详细信息。',
                  }}
                >
                  <Selection.UDC
                    code="COM:AB_TYPE"
                    placeholder="请选择地址簿类型"
                    disabled={!!formData.abNo}
                    onChange={this.handelChange}
                    allowedOptions={['01', '02']}
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
                    initialValue: (Array.isArray(formData.relateType)
                      ? formData.relateType
                      : formData.relateType && formData.relateType.split(',')) || ['02'], // 默认供应商
                    rules: [
                      {
                        required: true,
                        message: '请选择相关主档',
                      },
                    ],
                  }}
                >
                  <UdcSelect
                    mode="multiple"
                    code="TSK:AB_RELATE_TYPE"
                    placeholder="请选择相关主档"
                  />
                </Field>
                <Field
                  name="legalAbNo"
                  label="法人地址薄"
                  decorator={{
                    initialValue: formData.legalAbNo,
                    rules: [
                      {
                        required: formData.abType === '03',
                        message: '请输入法人地址薄',
                      },
                    ],
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
              {fieldList}
            </>
          );
        }}
      </AddrEditContext.Consumer>
    );
  }
}

AddrEditT1.Title = props => (
  <AddrEditContext.Consumer>
    {({ tabModified, formData }) => (
      <span>
        <Title dir="right" icon={tabModified[0] ? 'warning' : null} text="基本信息" />
      </span>
    )}
  </AddrEditContext.Consumer>
);

export default AddrEditT1;
