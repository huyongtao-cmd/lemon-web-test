import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, Select, Radio, InputNumber, Divider, Col, Row } from 'antd';
import AsyncSelect from '@/components/common/AsyncSelect';
import Title from '@/components/layout/Title';
import CityTrigger from '@/pages/gen/field/CityTrigger';
import { Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const InputGroup = Input.Group;
const { Field } = FieldList;
const { Option } = Select;

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
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      const { category } = changedValues;
      if (category) {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            custRegIon: category[0],
            provInce: category[1],
            city: category[2],
          },
        });
      }
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class CustomerCreate extends PureComponent {
  componentDidMount() {
    const {
      form,
      dispatch,
      customerCreate: {
        formData: { city },
        cityList,
      },
    } = this.props;
    form.resetFields();

    const { id } = fromQs();
    id &&
      dispatch({
        type: `${DOMAIN}/customerDetails`,
        payload: id,
      });

    // 初始得到主合同id给formData赋值
    dispatch({ type: `${DOMAIN}/res` }); // 拉取资源下拉表
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
  }

  // 省 -> 市
  handleChangeCity = (value, index) => {
    if (index === 1) {
      const {
        dispatch,
        form,
        customerCreate: { formData },
      } = this.props;
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

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll, setFields },
      customerCreate: {
        formData: {
          category,
          custRegIon,
          provInce,
          city,
          custStatus,
          switchBoard,
          companyEmail,
          headOfficeAddr,
          dataFrom,
          mark,
        },
      },
      dispatch,
    } = this.props;
    if (custStatus === 'INACTIVE') {
      !mark &&
        setFields({
          mark: {
            value: undefined,
            errors: [new Error('必填')],
          },
        });
    }
    if (custStatus === 'ACTIVE') {
      (!custRegIon || !provInce || !city) &&
        setFields({
          category: {
            value: undefined,
            errors: [new Error('必填')],
          },
        });
      !switchBoard &&
        setFields({
          switchBoard: {
            value: undefined,
            errors: [new Error('必填')],
          },
        });
      !companyEmail &&
        setFields({
          companyEmail: {
            value: undefined,
            errors: [new Error('必填')],
          },
        });
      !headOfficeAddr &&
        setFields({
          headOfficeAddr: {
            value: undefined,
            errors: [new Error('必填')],
          },
        });
      !dataFrom &&
        setFields({
          dataFrom: {
            value: undefined,
            errors: [new Error('必填')],
          },
        });
    }
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { id } = fromQs();
        if (id) {
          dispatch({
            type: `${DOMAIN}/save`,
            payload: {
              id,
            },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/save`,
          });
        }
      }
    });
  };

  handleCancel = () => {
    const { from } = fromQs();
    closeThenGoto(from);
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
      form,
      customerCreate: { formData, cityList, resDataSource },
      loading,
      dispatch,
    } = this.props;
    const { getFieldDecorator } = form;

    const submitting = loading.effects[`${DOMAIN}/save`];
    const { custRegIon, provInce, cityName, city } = formData;
    const cityArr = [custRegIon, provInce, city];
    const { id } = fromQs();

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={submitting}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            <Title
              icon="profile"
              id="ui.menu.user.management.customerEdit"
              defaultMessage="客户编辑"
            />
          }
        >
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
                rules: [{ required: formData.custStatus === 'ACTIVE', message: '必填' }],
              }}
            >
              <CityTrigger cityList={cityList} onChange={this.handleChangeCity} />
            </Field>
            <Field
              name="switchBoard"
              label="总机固话"
              decorator={{
                initialValue: formData.switchBoard || '',
                rules: [{ required: formData.custStatus === 'ACTIVE', message: '必填' }],
              }}
            >
              <Input placeholder="请输入总机固话" />
            </Field>
            <Field
              name="companyEmail"
              label="公司邮箱"
              decorator={{
                initialValue: formData.companyEmail || '',
                rules: [{ required: formData.custStatus === 'ACTIVE', message: '必填' }],
              }}
            >
              <Input placeholder="请输入公司邮箱" />
            </Field>
            <Field
              name="headOfficeAddr"
              label="总部地址"
              decorator={{
                initialValue: formData.headOfficeAddr || '',
                rules: [{ required: formData.custStatus === 'ACTIVE', message: '必填' }],
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
                rules: [{ required: formData.custStatus === 'ACTIVE', message: '必填' }],
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
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Selection.UDC
                className="tw-field-group-field"
                code="TSK:CUST_STATUS"
                placeholder="请选择状态"
                showSearch
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
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CustomerCreate;
