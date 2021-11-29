import { connect } from 'dva';
import React from 'react';
import moment from 'moment';
import { Button, Card, DatePicker, Form, Input, Modal, Radio } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect, FileManagerEnhance } from '@/pages/gen/field';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'platResProfileGetrp';

@connect(({ loading, platResProfileGetrp, dispatch }) => ({
  loading,
  platResProfileGetrp,
  dispatch,
}))
@Form.create()
class GetrpModal extends React.Component {
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

  render() {
    const {
      loading,
      visible,
      handleOk,
      handleCancel,
      getrpFormData,
      form: { getFieldDecorator },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    return (
      <Modal
        width="60%"
        destroyOnClose
        title={getrpFormData.id ? '奖惩信息修改' : '奖惩信息新增'}
        visible={visible}
        onOk={this.handleSave}
        onCancel={handleCancel}
        // footer={[
        //   <Button type="primary" key="save" onClick={this.handleSave}>
        //     保存
        //   </Button>,
        //   <Button type="ghost" key="cancel" onClick={handleCancel}>
        //     取消
        //   </Button>,
        // ]}
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
              name="obtainTime"
              label="时间"
              decorator={{
                initialValue: getrpFormData.obtainTime ? moment(getrpFormData.obtainTime) : null,
                rules: [{ required: true, message: '请选择时间' }],
              }}
            >
              <DatePicker
                className="x-fill-100"
                onChange={e => {
                  getrpFormData.obtainTime = e;
                }}
              />
            </Field>
            <Field
              name="rpName"
              label="奖惩名称"
              decorator={{
                initialValue: getrpFormData.rpName,
                rules: [
                  {
                    required: true,
                    message: '请输入奖惩名称',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入奖惩名称"
                onChange={e => {
                  getrpFormData.rpName = e.target.value;
                }}
              />
            </Field>
            <Field
              name="rpType"
              label="奖惩区分"
              decorator={{
                initialValue: getrpFormData.rpType,
                rules: [
                  {
                    required: true,
                    message: '请选择奖惩区分',
                  },
                ],
              }}
            >
              <UdcSelect
                code="RES.RP_TYPE"
                placeholder="请选择奖惩区分"
                onChange={e => {
                  getrpFormData.rpType = e;
                }}
              />
            </Field>
            <Field
              name="expireDate"
              label="到期日"
              decorator={{
                initialValue: getrpFormData.expireDate ? moment(getrpFormData.expireDate) : null,
                rules: [{ required: false, message: '请选择到期日' }],
              }}
            >
              <DatePicker
                className="x-fill-100"
                onChange={e => {
                  getrpFormData.expireDate = e;
                }}
              />
            </Field>
            <Field name="attache" label="证书附件">
              <FileManagerEnhance
                api="/api/person/v1/res/getrps/sfs/token"
                dataKey={getrpFormData.id}
                listType="text"
                disabled={false}
              />
            </Field>
            <Field
              name="reasonDesc"
              label="原因"
              decorator={{
                initialValue: getrpFormData.reasonDesc,
                rules: [
                  {
                    required: false,
                    message: '请输入原因',
                  },
                  { max: 400, message: '不超过400个字' },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea
                placeholder="请输入原因"
                rows={3}
                onChange={e => {
                  getrpFormData.reasonDesc = e.target.value;
                }}
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default GetrpModal;
