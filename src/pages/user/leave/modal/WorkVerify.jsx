import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { hasIn } from 'ramda';
import { DatePicker, Input } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { Selection } from '@/pages/gen/field';

const { Field } = FieldList;

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
class WorkVerify extends Component {
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
        {hasIn('jobHandOver', disabledOrHidden) && (
          <Field
            name="jobHandOver"
            label="工作交接人"
            decorator={{
              initialValue: formData.jobHandOver || '',
              rules: [
                {
                  required: formData.jobHandOverFlag === '1',
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
              disabled={!!disabledOrHidden.jobHandOver}
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
              initialValue: formData.jobContent || undefined,
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
      </FieldList>
    );
  }
}

export default WorkVerify;
