import React from 'react';
import { Input } from 'antd';
import { indexOf, isEmpty, isNil } from 'ramda';

import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import { Selection, FileManagerEnhance, DatePicker } from '@/pages/gen/field';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectUsersWithBu } from '@/services/gen/list';
import { AddrEditContext, DOMAIN } from './index';
import { queryAbList } from '@/services/plat/addr/addr';
import FormItem from '@/components/production/business/FormItem.tsx';

const { Field } = FieldList;

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrEditT11 = props => (
  <AddrEditContext.Consumer>
    {({
      form: { getFieldDecorator },
      coopData,
      dispatch,
      attachments,
      attachments1,
      attachments2,
    }) => (
      <FieldList
        layout="horizontal"
        legend="合作伙伴"
        getFieldDecorator={getFieldDecorator}
        col={2}
      >
        <Field
          name="coopInfo"
          label="企业简介"
          decorator={{
            initialValue: coopData.coopInfo,
            rules: [{ required: false }, { max: 400, message: '不超过400个字' }],
          }}
          fieldCol={1}
          labelCol={{ span: 4, xxl: 3 }}
          wrapperCol={{ span: 19, xxl: 20 }}
        >
          <Input.TextArea
            placeholder="请输入合作伙伴企业简介"
            autosize={{ minRows: 3, maxRows: 6 }}
          />
        </Field>

        <Field
          name="coopLegalPresonName"
          label="法人名称"
          decorator={{
            initialValue: coopData.coopLegalPresonName,
          }}
        >
          <Input placeholder="请输入法人名称" />
        </Field>

        <Field
          name="coopAddress"
          label="合作伙伴地址"
          decorator={{
            initialValue: coopData.coopAddress,
          }}
        >
          <Input placeholder="请输入合作伙伴地址" />
        </Field>

        <Field
          name="coopSale"
          label="企业规模"
          decorator={{
            initialValue: coopData.coopSaleName,
          }}
        >
          <Selection.UDC code="TSK:OU_SCALE" placeholder="请选择合作伙伴企业规模" />
        </Field>

        <Field
          name="coopLevel"
          label="合作等级"
          decorator={{
            initialValue: coopData.coopLevel,
          }}
        >
          <Input placeholder="请输入埃林哲在对方的合作等级" />
        </Field>

        <Field
          name="coopTypicalCustomer"
          label="典型客户"
          decorator={{
            initialValue: coopData.coopTypicalCustomer,
          }}
        >
          <Input placeholder="请输入典型客户" />
        </Field>

        <Field
          name="coopServiceType"
          label="合作类别"
          decorator={{
            initialValue: coopData.coopServiceTypeName || [],
          }}
        >
          <Selection.UDC code="TSK:COOP_CATEGORY" placeholder="请选择合作类别" />
        </Field>

        <Field
          name="coopServiceName"
          label="产品/服务名称"
          decorator={{
            initialValue: coopData.coopServiceName,
          }}
        >
          <Input placeholder="请输入产品/服务名称" />
        </Field>

        <Field
          name="coopChargePersonRole"
          label="合作伙伴联系人角色"
          decorator={{
            initialValue: Array.isArray(coopData.coopChargePersonRole)
              ? coopData.coopChargePersonRole
              : coopData.coopChargePersonRole && coopData.coopChargePersonRole.split(','),
          }}
        >
          <Selection.UDC
            mode="multiple"
            code="TSK:COOP_CONTACT_ROLE"
            placeholder="请选择合作伙伴角色"
          />
        </Field>

        <Field
          name="coopChargePersonName"
          label="合作伙伴联系人姓名"
          decorator={{
            initialValue: coopData.coopChargePersonName,
          }}
        >
          <Input placeholder="请输入合作伙伴联系人姓名" />
        </Field>

        <Field
          name="coopChargePersonPosition"
          label="合作伙伴联系人职位"
          decorator={{
            initialValue: coopData.coopChargePersonPosition,
          }}
        >
          <Input placeholder="请输入合作伙伴联系人职位" />
        </Field>

        <Field
          name="coopChargePersonPhone"
          label="合作伙伴联系人电话"
          decorator={{
            initialValue: coopData.coopChargePersonPhone,
          }}
        >
          <Input placeholder="请输入合作伙伴联系人电话" />
        </Field>

        <Field
          name="coopChargePersonEmail"
          label="合作伙伴联系人邮箱"
          decorator={{
            initialValue: coopData.coopChargePersonEmail,
          }}
        >
          <Input placeholder="请输入合作伙伴邮箱" />
        </Field>

        <Field
          name="coopPartnerLevel"
          label="合作伙伴等级"
          decorator={{
            initialValue: coopData.coopPartnerLevel,
          }}
        >
          <Input placeholder="请输入合作伙伴等级" />
        </Field>

        <Field
          name="coopCategory"
          label="埃林哲合作类别"
          decorator={{
            initialValue: coopData.coopCategory,
          }}
        >
          <Input placeholder="请输入埃林哲合作类别" />
        </Field>

        {/* <Field
          name="coopType"
          label="合作伙伴类型"
          decorator={{
            initialValue: coopData.coopType,
          }}
        >
          <Selection.UDC code="TSK:COOP_TYPE" placeholder="请选择合作伙伴类型" />
        </Field> */}

        <Field
          name="coopStatus"
          label="合作状态"
          decorator={{
            initialValue: coopData.coopStatus,
          }}
        >
          <Selection.UDC code="TSK:COOP_STATUS" placeholder="请选择合作状态" />
        </Field>

        <Field
          name="coopArea"
          label="合作区域"
          decorator={{
            initialValue: coopData.coopArea,
          }}
        >
          <Input placeholder="请输入合作区域" />
        </Field>

        {/* <Field
          name="coopEvaluation"
          label="合作评估"
          decorator={{
            initialValue: coopData.coopEvaluation,
          }}
        >
          <Selection.UDC code="TSK:COOP_EVALUATE" placeholder="请选择合作评估" />
        </Field> /}

        {/* <Field
          name="coopPicContact"
          label="对接人联系方式"
          decorator={{
            initialValue: coopData.coopPicContact,
          }}
        >
          <Input placeholder="请输入对接人联系方式" />
        </Field> */}

        <Field
          name="counterpart"
          label="对接人类型"
          decorator={{
            initialValue: coopData.counterpart,
          }}
        >
          <Selection.UDC code="TSK:COOP_COUNTERPART" placeholder="请选择对接人类型" />
        </Field>

        <Field
          name="pdmResId"
          label="合作伙伴发展经理"
          decorator={{
            initialValue: coopData.pdmResId,
          }}
        >
          <Selection.Columns
            className="x-fill-100"
            source={() => selectUsersWithBu()}
            columns={[
              { dataIndex: 'code', title: '编号', span: 8 },
              { dataIndex: 'name', title: '名称', span: 16 },
            ]}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {
              if (value) {
                const { id, pdmEmail, pdmTel, receiverBuName } = value;
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    coopData: {
                      ...coopData,
                      pdmResId: id,
                      pdmBuId: receiverBuName,
                      pdmEmail,
                      pdmTel,
                    },
                  },
                });
              } else {
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    coopData: {
                      ...coopData,
                      pdmResId: null,
                      pdmBuId: null,
                      pdmEmail: null,
                      pdmTel: null,
                    },
                  },
                });
              }
            }}
          />
        </Field>

        <Field
          name="pdmBuId"
          label="我司负责人BU"
          decorator={{
            initialValue: coopData.pdmBuId,
          }}
        >
          <Input placeholder="自动带出" disabled />
        </Field>

        <Field
          name="pdmTel"
          label="我司负责人电话"
          decorator={{
            initialValue: coopData.pdmTel,
          }}
        >
          <Input placeholder="自动带出" disabled />
        </Field>

        <Field
          name="pdmEmail"
          label="我司负责人邮箱"
          decorator={{
            initialValue: coopData.pdmEmail,
          }}
        >
          <Input placeholder="自动带出" disabled />
        </Field>
        {/* <Field name="attache" label="公司介绍附件">
          <FileManagerEnhance
            api="/api/person/v1/coop/sfs/token"
            dataKey={coopData.id}
            listType="text"
            disabled={false}
          />
        </Field>
        <Field name="attache1" label="产品介绍附件">
          <FileManagerEnhance
            api="/api/person/v1/coop/product/sfs/token"
            dataKey={coopData.id}
            listType="text"
            disabled={false}
          />
        </Field>
        <Field name="attache2" label="合作协议附件">
          <FileManagerEnhance
            api="/api/person/v1/coop/collaborate/sfs/token"
            dataKey={coopData.id}
            listType="text"
            disabled={false}
          />
        </Field> */}
        <Field name="attache" label="公司介绍附件">
          <FormItem fieldType="FileUpload" fileList={attachments} multiple />
        </Field>
        <Field name="attache1" label="产品介绍附件">
          <FormItem fieldType="FileUpload" fileList={attachments1} multiple />
        </Field>
        <Field name="attache2" label="合作协议附件">
          <FormItem fieldType="FileUpload" fileList={attachments2} multiple />
        </Field>
        <Field
          name="coopPeriod"
          label="合作期限"
          decorator={{
            initialValue:
              isEmpty(coopData.coopPeriod) || isNil(coopData.coopPeriod)
                ? [coopData.coopPeriodFrom, coopData.coopPeriodTo]
                : coopData.coopPeriod, // coopPeriodFrom / coopPeriodTo
          }}
        >
          <DatePicker.RangePicker format="YYYY-MM-DD" />
        </Field>

        <Field
          name="coopPeriodDesc"
          label="合作期间说明"
          decorator={{
            initialValue: coopData.coopPeriodDesc,
            rules: [{ required: false }, { max: 400, message: '不超过400个字' }],
          }}
          fieldCol={1}
          labelCol={{ span: 4, xxl: 3 }}
          wrapperCol={{ span: 19, xxl: 20 }}
        >
          <Input.TextArea placeholder="请输入合作期间说明" autosize={{ minRows: 3, maxRows: 6 }} />
        </Field>
        <Field
          name="coopKey"
          label="合作伙伴关键词"
          decorator={{
            initialValue: coopData.coopKey,
            rules: [{ required: false }],
          }}
          fieldCol={1}
          labelCol={{ span: 4, xxl: 3 }}
          wrapperCol={{ span: 19, xxl: 20 }}
        >
          <Input.TextArea
            placeholder="请输入合作伙伴关键词"
            autosize={{ minRows: 3, maxRows: 6 }}
          />
        </Field>
      </FieldList>
    )}
  </AddrEditContext.Consumer>
);

AddrEditT11.Title = props => (
  <AddrEditContext.Consumer>
    {({ tabModified, coopData, formData }) => {
      const relateType = formData.relateType || '';
      const relateTypeArr = Array.isArray(relateType) ? relateType : relateType.split(',');

      return (
        <span className={indexOf('03', relateTypeArr) < 0 ? 'tw-card-multiTab-disabled' : void 0}>
          <Title dir="right" icon={tabModified[10] ? 'warning' : null} text="合作伙伴" />
        </span>
      );
    }}
  </AddrEditContext.Consumer>
);

export default AddrEditT11;
