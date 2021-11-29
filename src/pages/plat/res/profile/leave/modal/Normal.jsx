import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { isEmpty, isNil, hasIn } from 'ramda';
import { DatePicker, Form, Input, Radio, Select } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { Selection } from '@/pages/gen/field';
import { selectInternalOus } from '@/services/gen/list';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'leave';

@connect(({ loading, leave, dispatch }) => ({
  loading,
  leave,
  dispatch,
}))
class NormalModal extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
  }

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator },
      leave: { formData, resData, baseBuData, fieldsConfig },
    } = this.props;
    const {
      panels: { disabledOrHidden },
    } = fieldsConfig;

    return (
      <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
        {hasIn('resId', disabledOrHidden) && (
          <Field
            name="resId"
            label="离职资源"
            decorator={{
              initialValue: formData.resId || '',
            }}
          >
            <Selection.Columns
              className="x-fill-100"
              source={resData}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              disabled={!!disabledOrHidden.resId}
            />
          </Field>
        )}
        {hasIn('enrollDate', disabledOrHidden) && (
          <Field
            name="enrollDate"
            label="入职日期"
            decorator={{
              initialValue: formData.enrollDate ? moment(formData.enrollDate) : null,
            }}
          >
            <DatePicker disabled className="x-fill-100" />
          </Field>
        )}
        {hasIn('baseBuId', disabledOrHidden) && (
          <Field
            name="baseBuId"
            label="BaseBU"
            decorator={{
              initialValue: formData.baseBuId || '',
            }}
          >
            <Selection.Columns
              className="x-fill-100"
              source={baseBuData}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              disabled
            />
          </Field>
        )}
        {hasIn('empNo', disabledOrHidden) && (
          <Field
            name="empNo"
            label="工号"
            decorator={{
              initialValue: formData.empNo || '',
            }}
          >
            <Input disabled />
          </Field>
        )}
        {hasIn('email', disabledOrHidden) && (
          <Field
            name="email"
            label="邮箱"
            decorator={{
              initialValue: formData.email || '',
            }}
          >
            <Input disabled />
          </Field>
        )}
        {hasIn('baseCity', disabledOrHidden) && (
          <Field
            name="baseCity"
            label="Base地"
            decorator={{
              initialValue: formData.baseCity && formData.baseCity,
            }}
          >
            <Selection.UDC code="COM.CITY" placeholder="请选择Base地" disabled />
          </Field>
        )}
        {hasIn('ouId', disabledOrHidden) && (
          <Field
            name="ouId"
            label="所属公司"
            decorator={{
              initialValue: formData.ouId || '',
            }}
          >
            <Selection source={() => selectInternalOus()} placeholder="请选择所属公司" disabled />
          </Field>
        )}
        {hasIn('presId', disabledOrHidden) && (
          <Field
            name="presId"
            label="直属领导"
            decorator={{
              initialValue: formData.presId || '',
            }}
          >
            <Selection.Columns
              className="x-fill-100"
              source={resData}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              disabled
            />
          </Field>
        )}
        {hasIn('leaveDesc', disabledOrHidden) && (
          <Field
            name="leaveDesc"
            label="离职原因"
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
            decorator={{
              initialValue: formData.leaveDesc || '',
            }}
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入离职原因"
              disabled={!!disabledOrHidden.leaveDesc}
            />
          </Field>
        )}
        {hasIn('applyResId', disabledOrHidden) && (
          <Field
            name="applyResId"
            label="申请人"
            decorator={{
              initialValue: formData.applyResName || '',
            }}
          >
            <Input disabled />
          </Field>
        )}
        {hasIn('applyDate', disabledOrHidden) && (
          <Field
            name="applyDate"
            label="申请时间"
            decorator={{
              initialValue: formData.applyDate || '',
            }}
          >
            <Input disabled />
          </Field>
        )}
        {hasIn('jobHandOverFlag', disabledOrHidden) && (
          <Field
            name="jobHandOverFlag"
            label="有无工作交接"
            decorator={{
              initialValue: String(formData.jobHandOverFlag) ? formData.jobHandOverFlag : '',
              rules: [
                {
                  required: !disabledOrHidden.jobHandOverFlag,
                  message: '请选择有无工作交接',
                },
              ],
            }}
          >
            <RadioGroup
              disabled={!!disabledOrHidden.jobHandOver}
              onChange={e => {
                const { value } = e.target;
                if (!value) {
                  const { form } = this.props;
                  form.setFieldsValue({
                    jobHandOver: '',
                  });
                }
              }}
            >
              <Radio value={0}>无</Radio>
              <Radio value={1}>有</Radio>
            </RadioGroup>
          </Field>
        )}
        {hasIn('jobHandOver', disabledOrHidden) && (
          <Field
            name="jobHandOver"
            label="工作交接人"
            decorator={{
              initialValue: formData.jobHandOver || '',
              rules: [
                {
                  required: formData.jobHandOverFlag === 1 && !disabledOrHidden.jobHandOver,
                  message: '请选择工作交接人',
                },
              ],
            }}
          >
            <Selection.Columns
              className="x-fill-100"
              source={resData}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              disabled={!!disabledOrHidden.jobHandOver || !formData.jobHandOverFlag}
            />
          </Field>
        )}
        {hasIn('emailSet', disabledOrHidden) && (
          <Field
            name="emailSet"
            label="邮箱设置"
            decorator={{
              initialValue: formData.emailSet || '',
              rules: [
                {
                  required: !disabledOrHidden.emailSet,
                  message: '请选择邮箱设置',
                },
              ],
            }}
          >
            <RadioGroup
              disabled={!!disabledOrHidden.emailSet}
              onChange={e => {
                const { value } = e.target;
                if (value === 'CLOSE') {
                  const { form } = this.props;
                  form.setFieldsValue({
                    emailReceiver: '',
                  });
                }
              }}
            >
              <Radio value="CLOSE">直接关闭</Radio>
              <Radio value="RECEIVER">指定邮件代收人</Radio>
            </RadioGroup>
          </Field>
        )}
        {hasIn('emailReceiver', disabledOrHidden) && (
          <Field
            name="emailReceiver"
            label="邮件代收人"
            decorator={{
              initialValue: Number(formData.emailReceiver) || '',
              rules: [
                {
                  required: formData.emailSet === 'RECEIVER' && !disabledOrHidden.emailReceiver,
                  message: '请选择邮件代收人',
                },
              ],
            }}
          >
            <Selection.Columns
              className="x-fill-100"
              source={resData}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              disabled={!!disabledOrHidden.emailReceiver || formData.emailSet === 'CLOSE'}
            />
          </Field>
        )}
        {hasIn('lastJobDate', disabledOrHidden) && (
          <Field
            name="lastJobDate"
            label="最后工作日"
            decorator={{
              initialValue: formData.lastJobDate ? moment(formData.lastJobDate) : null,
              rules: [
                {
                  required: !disabledOrHidden.lastJobDate,
                  message: '请选择最后工作日',
                },
              ],
            }}
          >
            <DatePicker disabled={!!disabledOrHidden.lastJobDate} className="x-fill-100" />
          </Field>
        )}
        {hasIn('jobContent', disabledOrHidden) && (
          <Field
            name="jobContent"
            label="工作交接内容"
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
            decorator={{
              initialValue: formData.jobContent || '',
              rules: [
                {
                  required: !disabledOrHidden.jobContent,
                  message: '请填写工作交接内容',
                },
              ],
            }}
          >
            <Input.TextArea
              disabled={!!disabledOrHidden.jobContent}
              rows={3}
              placeholder="请输入工作交接内容"
            />
          </Field>
        )}
        {hasIn('contractEndDate', disabledOrHidden) && (
          <Field
            name="contractEndDate"
            label="解除劳动合同日期"
            decorator={{
              initialValue: formData.contractEndDate ? moment(formData.contractEndDate) : null,
              rules: [
                {
                  required: true,
                  message: '请选择解除劳动合同日期',
                },
              ],
            }}
          >
            <DatePicker className="x-fill-100" />
          </Field>
        )}
      </FieldList>
    );
  }
}

export default NormalModal;
