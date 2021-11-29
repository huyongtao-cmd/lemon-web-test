import { connect } from 'dva';
import React from 'react';
import moment from 'moment';
import { InputNumber, Card, DatePicker, Form, Input, Modal } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { Selection } from '@/pages/gen/field';
import { vacationExtrwork } from '@/services/user/project/project';
import { selectUsersWithBu } from '@/services/gen/list';

const { Field } = FieldList;

const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

@connect(({ loading, userProjectSh, dispatch }) => ({
  loading,
  userProjectSh,
  dispatch,
}))
@Form.create()
class ExtrworkModal extends React.Component {
  // 保存按钮
  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      handleOk,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        handleOk();
      }
    });
  };

  render() {
    const {
      vacation,
      visible,
      handleCancel,
      formData,
      userProjectSh: { projResDataSource },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;

    return (
      <Modal
        width="60%"
        destroyOnClose
        title={formData.id ? '项目成员加班修改' : '项目成员加班新增'}
        visible={visible}
        onOk={this.handleSave}
        onCancel={handleCancel}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList
            layout="horizontal"
            legend=""
            getFieldDecorator={getFieldDecorator}
            col={2}
            noReactive
          >
            <Field
              name="resId"
              label="资源名称"
              decorator={{
                initialValue: formData.resId,
                rules: [
                  {
                    required: true,
                    message: '请选择资源',
                  },
                ],
              }}
            >
              <Selection.Columns
                source={projResDataSource}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                placeholder="请选择资源"
                showSearch
                columns={applyColumns}
                onColumnsChange={value => {
                  const { id, role } = value;
                  formData.resId = id;
                  formData.role = role;
                }}
              />
            </Field>

            <Field
              name="role"
              label="项目角色"
              decorator={{
                initialValue: formData.role,
              }}
            >
              <Input placeholder="选择资源带出" disabled />
            </Field>
            <Field
              name="workDate"
              label="加班日期"
              decorator={{
                initialValue:
                  formData.workBegDate && formData.workEndDate
                    ? [moment(formData.workBegDate), moment(formData.workEndDate)]
                    : undefined,
                rules: [{ required: true, message: '请选择加班日期' }],
              }}
            >
              <DatePicker.RangePicker
                disabledDate={currentDate => !vacation.includes(currentDate.format('YYYY-MM-DD'))}
                className="x-fill-100"
                onChange={v => {
                  const $s = v[0] ? v[0].format('YYYY-MM-DD') : undefined;
                  const $e = v[1] ? v[1].format('YYYY-MM-DD') : undefined;
                  formData.workBegDate = $s;
                  formData.workEndDate = $e;
                  if ($s && $e) {
                    vacationExtrwork({ startDate: $s, endDate: $e }).then(
                      ({ status, response }) => {
                        if (status === 200) {
                          const day = response.length; // 加班天数
                          // formData.extWorkDay = v[1].diff(v[0], 'days') + 1;
                          formData.extWorkDay = day;
                          setFieldsValue({ extWorkDay: day });
                        }
                      }
                    );
                  }
                }}
              />
            </Field>

            <Field
              name="extWorkDay"
              label="加班天数"
              decorator={{
                initialValue: formData.extWorkDay,
                rules: [
                  { required: true, message: '请选择加班天数' },
                  {
                    validator: (rule, value, callback) => {
                      if (formData.workBegDate && formData.workEndDate) {
                        const $s = moment(formData.workBegDate);
                        const $e = moment(formData.workEndDate);
                        const diff = $e.diff($s, 'days') + 1;
                        value > diff ? callback('加班天数不能超过实际天数') : callback();
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              }}
            >
              <InputNumber
                className="x-fill-100"
                placeholder="请输入加班天数"
                disabled={!(formData.workBegDate && formData.workEndDate)}
                onChange={v => {
                  formData.extWorkDay = v;
                }}
              />
            </Field>

            <Field
              name="workContent"
              label="加班工作内容"
              decorator={{
                initialValue: formData.workContent,
                rules: [{ required: false }, { max: 400, message: '不超过400个字' }],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea
                placeholder="请输入加班工作内容"
                autosize={{ minRows: 3, maxRows: 6 }}
                onChange={e => {
                  formData.workContent = e.target.value;
                }}
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default ExtrworkModal;
