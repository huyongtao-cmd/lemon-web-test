import { connect } from 'dva';
import React from 'react';
import moment from 'moment';
import { Button, Card, DatePicker, Form, Input, Modal, Radio } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect, Selection } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectValidatedUser } from '@/services/sys/user';
import { selectValidUsers } from '@/services/user/distribute/distribute';
import InputNumber from 'antd/es/input-number';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

const DOMAIN = 'userProjectSh';

@connect(({ loading, userProjectSh, dispatch }) => ({
  loading,
  userProjectSh,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const value = Object.values(changedFields)[0];
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { key, value: value.value },
      });
    }
  },
})
class ProjectShDetailModal extends React.Component {
  // 保存按钮
  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      handleOk,
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        handleOk();
      }
    });
  };

  // 工种 -> 工种子类
  handleChangeJobType1 = value => {
    const { dispatch, form, formData } = this.props;
    formData.jobType1 = value;
    dispatch({
      type: `${DOMAIN}/updateJobType2`,
      payload: value,
    }).then(() => {
      formData.jobType2 = null;
      formData.capasetLevelId = '';
      form.setFieldsValue({
        jobType2: null,
        capasetLevelId: '',
      });
    });
  };

  // 工种子类 -> 级别
  handleChangeJobType2 = value => {
    const { dispatch, form, formData } = this.props;

    if (value) {
      formData.jobType2 = value;
      dispatch({
        type: `${DOMAIN}/updateCapasetLevelList`,
        payload: {
          jobType1: formData.jobType1,
          jobType2: value,
        },
      }).then(() => {
        formData.capasetLevelId = '';
        form.setFieldsValue({
          capasetLevelId: '',
        });
      });
    } else {
      formData.jobType2 = null;
    }
  };

  render() {
    const {
      loading,
      visible,
      handleOk,
      handleCancel,
      formData,
      userProjectSh: { jobType2List, capasetLevelList },
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Modal
        width="60%"
        destroyOnClose
        title={formData.id ? '项目成员修改' : '项目成员新增'}
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
              name="role"
              label="项目角色"
              decorator={{
                initialValue: formData.role,
                rules: [
                  {
                    required: true,
                    message: '请输入项目角色',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入项目角色"
                onChange={e => {
                  formData.role = e.target.value;
                }}
              />
            </Field>
            <Field
              name="resId"
              label="资源"
              decorator={{
                initialValue: formData.resId && formData.resId,
                rules: [
                  {
                    required: false,
                    message: '请选择资源',
                  },
                ],
              }}
            >
              <Selection.Columns
                source={() => selectValidUsers()}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                placeholder="请选择资源"
                showSearch
                columns={applyColumns}
                onChange={value => {
                  formData.resId = value;
                }}
              />
            </Field>
            <FieldLine label="复合能力" fieldCol={2} required>
              <Field
                name="jobType1"
                decorator={{
                  initialValue: formData.jobType1,
                  rules: [{ required: true, message: '请选择工种' }],
                }}
                wrapperCol={{ span: 23 }}
              >
                <UdcSelect
                  code="COM.JOB_TYPE1"
                  placeholder="请选择工种"
                  onChange={this.handleChangeJobType1}
                />
              </Field>
              <Field
                name="jobType2"
                decorator={{
                  initialValue: formData.jobType2,
                  rules: [{ required: true, message: '请选择工种子类' }],
                }}
                wrapperCol={{ span: 23 }}
              >
                <AsyncSelect
                  source={jobType2List}
                  placeholder="请选择工种子类"
                  onChange={this.handleChangeJobType2}
                />
              </Field>
              <Field
                name="capasetLevelId"
                decorator={{
                  initialValue: formData.capasetLevelId + '',
                  rules: [{ required: true, message: '请选择级别' }],
                }}
                wrapperCol={{ span: 24 }}
              >
                <AsyncSelect
                  source={capasetLevelList}
                  placeholder="请选择级别"
                  onChange={e => {
                    formData.capasetLevelId = e;
                  }}
                />
              </Field>
            </FieldLine>
            <Field
              name="planStartDate"
              label="预计开始日期"
              decorator={{
                initialValue: formData.planStartDate ? moment(formData.planStartDate) : null,
                rules: [{ required: false, message: '请选择预计开始日期' }],
              }}
            >
              <DatePicker
                className="x-fill-100"
                onChange={e => {
                  formData.planStartDate = e;
                }}
              />
            </Field>
            <Field
              name="planEndDate"
              label="预计结束日期"
              decorator={{
                initialValue: formData.planEndDate ? moment(formData.planEndDate) : null,
                rules: [{ required: false, message: '请选择预计结束日期' }],
              }}
            >
              <DatePicker
                className="x-fill-100"
                onChange={e => {
                  formData.planEndDate = e;
                }}
              />
            </Field>
            <Field
              name="planEqva"
              label="规划当量"
              decorator={{
                initialValue: formData.planEqva,
                rules: [
                  {
                    required: false,
                    message: '请输入规划当量',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入规划当量"
                onChange={e => {
                  formData.planEqva = e.target.value;
                }}
              />
            </Field>
            <Field
              name="workbenchFlag"
              label="工作台显示"
              decorator={{
                initialValue: formData.workbenchFlag === 0 ? 0 : 1,
              }}
            >
              <RadioGroup
                onChange={e => {
                  formData.workbenchFlag = e.target.value;
                }}
              >
                <Radio value={1}>显示</Radio>
                <Radio value={0}>隐藏</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="customerPrice"
              label="客户结算价"
              decorator={{
                initialValue: formData.customerPrice,
              }}
            >
              <InputNumber
                className="x-fill-100"
                precision={2}
                min={0}
                max={999999999999}
                onChange={e => {
                  formData.customerPrice = e;
                }}
              />
            </Field>
            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: formData.remark,
                rules: [{ required: false }, { max: 400, message: '不超过400个字' }],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea
                placeholder="请输入备注"
                autosize={{ minRows: 3, maxRows: 6 }}
                onChange={e => {
                  formData.remark = e.target.value;
                }}
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default ProjectShDetailModal;
