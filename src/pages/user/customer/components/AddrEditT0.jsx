import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Divider, Col, Row } from 'antd';
import Title from '@/components/layout/Title';
import CityTrigger from '@/pages/gen/field/CityTrigger';
import { Selection } from '@/pages/gen/field';

import { mountToTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import { AddrEditContext } from '../customerInfoEdit';

const InputGroup = Input.Group;
const { Field } = FieldList;

const DOMAIN = 'customerCreate';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, dispatch, customerCreate }) => ({
  loading,
  dispatch,
  customerCreate,
}))
@mountToTab()
class AddrEditT0 extends PureComponent {
  // 省 -> 市
  handleChangeCity = (value, index) => {
    if (index === 1) {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { cityList: [] },
      });
      dispatch({
        type: `${DOMAIN}/handleChangeCity`,
        payload: value[1],
      });
    }
  };

  handleChange = e => {
    const { dispatch } = this.props;
    const {
      target: { value, name },
    } = e;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        [name]: value,
      },
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      customerCreate: { formData, cityList, resDataSource },
      dispatch,
    } = this.props;
    const { custRegIon, provInce, city } = formData;
    const cityArr = [custRegIon, provInce, city];

    return (
      <>
        <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="企业基本信息">
          <Field
            name="custName"
            label="公司名称"
            decorator={{
              initialValue: formData.custName || '',
              rules: [{ required: true, message: '必填' }],
            }}
          >
            <Input placeholder="请输入公司名称" />
          </Field>
          <Field
            name="category"
            label="区域/省份/城市"
            decorator={{
              initialValue: cityArr || '',
              // rules: [{ required: formData.custStatus === 'ACTIVE', message: '必填' }],
            }}
          >
            <CityTrigger cityList={cityList} onChange={this.handleChangeCity} />
          </Field>
          <Field
            name="switchBoard"
            label="总机固话"
            decorator={{
              initialValue: formData.switchBoard || '',
              // rules: [{ required: formData.custStatus === 'ACTIVE', message: '必填' }],
            }}
          >
            <Input placeholder="请输入总机固话" />
          </Field>
          <Field
            name="companyEmail"
            label="公司邮箱"
            decorator={{
              initialValue: formData.companyEmail || '',
              // rules: [{ required: formData.custStatus === 'ACTIVE', message: '必填' }],
            }}
          >
            <Input placeholder="请输入公司邮箱" />
          </Field>
          <Field
            name="headOfficeAddr"
            label="总部地址"
            decorator={{
              initialValue: formData.headOfficeAddr || '',
              // rules: [{ required: formData.custStatus === 'ACTIVE', message: '必填' }],
            }}
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
          >
            <Input.TextArea rows={3} placeholder="请输入总部地址" />
          </Field>
          <Field
            name="custLabel1"
            label="客户标签1"
            decorator={{
              initialValue: formData.custLabel1 || '',
            }}
          >
            <Input placeholder="请输入行业" />
          </Field>
          <Field
            name="custLabel2"
            label="客户标签2"
            decorator={{
              initialValue: formData.custLabel2 || '',
            }}
          >
            <Input placeholder="请输入ERP系统" />
          </Field>
          <Field
            name="custLabel3"
            label="客户标签3"
            decorator={{
              initialValue: formData.custLabel3 || '',
            }}
          >
            <Input placeholder="请输入近期可能的IT项目" />
          </Field>
          <Field
            name="custLabel4"
            label="客户标签4"
            decorator={{
              initialValue: formData.custLabel4 || '',
            }}
          >
            <Input placeholder="请输入企业年销售额" />
          </Field>
          <Field
            name="custLabel5"
            label="客户标签5"
            decorator={{
              initialValue: formData.custLabel5 || '',
            }}
          >
            <Input placeholder="请输入年度IT预算(万)" />
          </Field>
          <Field
            name="custLabel6"
            label="客户标签6"
            decorator={{
              initialValue: formData.custLabel6 || '',
            }}
          >
            <Input placeholder="请输入客户标签6" />
          </Field>
          <Field
            name="custLabel7"
            label="客户标签7"
            decorator={{
              initialValue: formData.custLabel7 || '',
            }}
          >
            <Input placeholder="请输入客户标签7" />
          </Field>
          <Field
            name="custLabel8"
            label="客户标签8"
            decorator={{
              initialValue: formData.custLabel8 || '',
            }}
          >
            <Input placeholder="请输入客户标签8" />
          </Field>
          <Field
            name="custLabel9"
            label="客户标签9"
            decorator={{
              initialValue: formData.custLabel9 || '',
            }}
          >
            <Input placeholder="请输入客户标签9" />
          </Field>

          <Field
            name="custLabel10"
            label="客户标签10"
            decorator={{
              initialValue: formData.custLabel10 || '',
            }}
          >
            <Input placeholder="请输入客户标签10" />
          </Field>
          <Field
            name="dataFrom"
            label="数据来源"
            decorator={{
              initialValue: formData.dataFrom || '',
              // rules: [{ required: formData.custStatus === 'ACTIVE', message: '必填' }],
            }}
          >
            <Input placeholder="请输入数据来源" />
          </Field>
          <Field
            name="remark"
            label="备注"
            decorator={{
              initialValue: formData.remark || '',
            }}
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
          >
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Field>
        </FieldList>
        <Divider dashed />
        <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="企业主要联系人">
          <Field
            name="artTitle"
            label="董事长(总经理)-姓名-电话-邮箱"
            fieldCol={1}
            labelCol={{ span: 6, xxl: 6 }}
            wrapperCol={{ span: 18, xxl: 18 }}
          >
            <InputGroup>
              <Row gutter={8}>
                <Col span={7}>
                  <Input
                    name="chairManName"
                    value={formData.chairManName}
                    placeholder="请输入姓名"
                    onChange={e => {
                      this.handleChange(e);
                    }}
                  />
                </Col>
                <Col span={7}>
                  <Input
                    name="chairManTel"
                    value={formData.chairManTel}
                    placeholder="请输入电话"
                    onChange={e => {
                      this.handleChange(e);
                    }}
                  />
                </Col>
                <Col span={7}>
                  <Input
                    name="chairManEmail"
                    value={formData.chairManEmail}
                    placeholder="请输入邮箱"
                    onChange={e => {
                      this.handleChange(e);
                    }}
                  />
                </Col>
              </Row>
            </InputGroup>
          </Field>
          <Field
            name="artTitle"
            label="IT负责人-姓名-电话-邮箱"
            fieldCol={1}
            labelCol={{ span: 6, xxl: 6 }}
            wrapperCol={{ span: 18, xxl: 18 }}
          >
            <InputGroup>
              <Row gutter={8}>
                <Col span={7}>
                  <Input
                    name="itAdminName"
                    value={formData.itAdminName}
                    placeholder="请输入姓名"
                    onChange={e => {
                      this.handleChange(e);
                    }}
                  />
                </Col>
                <Col span={7}>
                  <Input
                    name="itAdminTel"
                    value={formData.itAdminTel}
                    placeholder="请输入电话"
                    onChange={e => {
                      this.handleChange(e);
                    }}
                  />
                </Col>
                <Col span={7}>
                  <Input
                    name="itAdminEmail"
                    value={formData.itAdminEmail}
                    placeholder="请输入邮箱"
                    onChange={e => {
                      this.handleChange(e);
                    }}
                  />
                </Col>
              </Row>
            </InputGroup>
          </Field>
          <Field
            name="artTitle"
            label="其他负责人-姓名-电话-邮箱"
            fieldCol={1}
            labelCol={{ span: 6, xxl: 6 }}
            wrapperCol={{ span: 18, xxl: 18 }}
          >
            <InputGroup>
              <Row gutter={8}>
                <Col span={7}>
                  <Input
                    name="otherPicName"
                    value={formData.otherPicName}
                    placeholder="请输入姓名"
                    onChange={e => {
                      this.handleChange(e);
                    }}
                  />
                </Col>
                <Col span={7}>
                  <Input
                    name="otherPicTel"
                    value={formData.otherPicTel}
                    placeholder="请输入电话"
                    onChange={e => {
                      this.handleChange(e);
                    }}
                  />
                </Col>
                <Col span={7}>
                  <Input
                    name="otherPicEmail"
                    value={formData.otherPicEmail}
                    placeholder="请输入邮箱"
                    onChange={e => {
                      this.handleChange(e);
                    }}
                  />
                </Col>
              </Row>
            </InputGroup>
          </Field>
        </FieldList>
        <Divider dashed />
        <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="管理信息">
          <Field
            name="custStatus"
            label="状态"
            decorator={{
              initialValue: formData.custStatus || '',
              // rules: [{ required: true, message: '必填' }],
            }}
          >
            <Selection.UDC
              className="tw-field-group-field"
              code="TSK:CUST_STATUS"
              placeholder="请选择状态"
              showSearch
              disabled={formData.custType === 'COOPERATION_CUST'}
            />
          </Field>
          <Field
            name="dataInteGrity"
            label="数据完善度(%)"
            decorator={{
              initialValue: formData.dataInteGrity || '',
            }}
          >
            <Input disabled placeholder="系统自动生成" />
          </Field>
          <Field
            name="dataChecker"
            decorator={{
              initialValue: Number(formData.dataChecker) || '',
            }}
            label="数据校验人"
          >
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
            />
          </Field>
          <Field
            name="salePic"
            decorator={{
              initialValue: Number(formData.salePic) || '',
            }}
            label="销售负责人"
          >
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {
                dispatch({
                  type: `${DOMAIN}/seletePicById`,
                  payload: value.id,
                });
              }}
            />
          </Field>
          <Field
            name="saleVp"
            decorator={{
              initialValue: Number(formData.saleVp) || '',
            }}
            label="销售VP"
          >
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
            />
          </Field>
          <Field
            name="adjunct"
            label="数据派发日期"
            decorator={{
              initialValue: formData.assingDate || '',
            }}
          >
            <Input disabled placeholder="系统自动生成" />
          </Field>
          <Field
            name="mark"
            label="本次更新说明"
            decorator={{
              initialValue: formData.mark || '',
              rules: [{ required: formData.custStatus === 'INACTIVE', message: '必填' }],
            }}
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
          >
            <Input.TextArea rows={3} placeholder="请输入本次更新说明" />
          </Field>
          <Field
            name="modifyRecord"
            label="更新履历"
            decorator={{
              initialValue: formData.modifyRecord || '',
            }}
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
          >
            <Input.TextArea disabled rows={3} placeholder="系统自动生成" />
          </Field>
          <Field
            name="lastCheckDate"
            label="数据最后校验日期"
            decorator={{
              initialValue: formData.lastCheckDate || '',
            }}
          >
            <Input disabled placeholder="系统自动生成" />
          </Field>
          <Field
            name="lastModifyDate"
            label="数据最后更新日期"
            decorator={{
              initialValue: formData.lastModifyDate || '',
            }}
          >
            <Input disabled placeholder="系统自动生成" />
          </Field>
        </FieldList>
      </>
    );
  }
}

AddrEditT0.Title = props => (
  <AddrEditContext.Consumer>
    {({ tabModified, formData }) => (
      <span>
        <Title dir="right" icon={tabModified[0] ? 'warning' : null} text="客户详情" />
      </span>
    )}
  </AddrEditContext.Consumer>
);

export default AddrEditT0;
