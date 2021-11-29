import { connect } from 'dva';
import React from 'react';
import moment from 'moment';
import { Button, Card, DatePicker, Form, Input, Modal, Radio } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect, FileManagerEnhance } from '@/pages/gen/field';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'platResProfileBackground';

@connect(({ loading, platResProfileBackground, dispatch }) => ({
  loading,
  platResProfileBackground,
  dispatch,
}))
@Form.create()
class CertModal extends React.Component {
  state = {
    validType: '', // 有效期类型
  };

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
    this.setState({
      validType: '',
    });
  };

  render() {
    const {
      loading,
      visible,
      handleOk,
      handleCancel,
      certFormData,
      form: { getFieldDecorator },
    } = this.props;
    const { validType } = this.state;

    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    return (
      <Modal
        width="60%"
        destroyOnClose
        title={certFormData.id ? '资质证书修改' : '资质证书新增'}
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
              name="certName"
              label="证书名称"
              decorator={{
                initialValue: certFormData.certName,
                rules: [
                  {
                    required: true,
                    message: '请输入证书名称',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入证书名称"
                onChange={e => {
                  certFormData.certName = e.target.value;
                }}
              />
            </Field>
            <Field
              name="certNo"
              label="证书号码"
              decorator={{
                initialValue: certFormData.certNo,
                rules: [
                  {
                    required: true,
                    message: '请输入证书号码',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入证书号码"
                onChange={e => {
                  certFormData.certNo = e.target.value;
                }}
              />
            </Field>
            <Field
              name="certStatus"
              label="状态"
              decorator={{
                initialValue: certFormData.certStatus,
                rules: [
                  {
                    required: true,
                    message: '请选择状态',
                  },
                ],
              }}
            >
              <UdcSelect
                code="RES.CERTIFICATE_STATUS"
                placeholder="请选择状态"
                onChange={e => {
                  certFormData.certStatus = e;
                }}
              />
            </Field>
            <Field
              name="obtainDate"
              label="获得时间"
              decorator={{
                initialValue: certFormData.obtainDate ? moment(certFormData.obtainDate) : null,
                rules: [{ required: false, message: '请选择获得时间' }],
              }}
            >
              <DatePicker
                className="x-fill-100"
                onChange={e => {
                  certFormData.obtainDate = e;
                }}
              />
            </Field>
            <Field
              name="validType"
              label="有效期类型"
              decorator={{
                initialValue: certFormData.validType || '0',
                rules: [
                  {
                    required: false,
                    message: '请输入有效期类型',
                  },
                ],
              }}
            >
              <RadioGroup
                onChange={e => {
                  certFormData.validType = e.target.value;
                  // 选中定期时，有效期长和上次认证时间必填
                  // 选中长期时，有效期长和上次认证时间不可编辑
                  this.setState({
                    validType: e.target.value,
                  });
                  const { form } = this.props;
                  form.setFieldsValue({
                    validMonths: null,
                    lastRenewDate: null,
                  });
                }}
              >
                <Radio value="0">长期</Radio>
                <Radio value="1">定期</Radio>
              </RadioGroup>
            </Field>
            <FieldLine label="有效期长">
              <Field
                name="validMonths"
                decorator={{
                  initialValue: certFormData.validMonths,
                  rules: [{ required: false, message: '请输入有效期长' }],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Input
                  placeholder="请输入有效期长"
                  onChange={e => {
                    certFormData.validMonths = e.target.value;
                  }}
                  disabled={
                    (validType !== '' && validType !== '1') || certFormData.validType !== '1'
                  }
                />
              </Field>
              <Field name="validMonthsDesc" wrapperCol={{ span: 23, offset: 1, xxl: 23 }}>
                <span>个月</span>
              </Field>
            </FieldLine>
            <Field
              name="lastRenewDate"
              label="上次认证时间"
              decorator={{
                initialValue: certFormData.lastRenewDate
                  ? moment(certFormData.lastRenewDate)
                  : null,
                rules: [{ required: false, message: '请选择上次认证时间' }],
              }}
            >
              <DatePicker
                className="x-fill-100"
                onChange={e => {
                  certFormData.lastRenewDate = e;
                }}
                disabled={(validType !== '' && validType !== '1') || certFormData.validType !== '1'}
              />
            </Field>
            <Field name="attache" label="证书附件">
              <FileManagerEnhance
                api="/api/person/v1/res/cert/sfs/token"
                dataKey={certFormData.id}
                listType="text"
                disabled={false}
              />
            </Field>
            <Field
              name="score"
              label="分数"
              decorator={{
                initialValue: certFormData.score,
                rules: [
                  {
                    required: false,
                    message: '请输入分数',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入分数"
                onChange={e => {
                  certFormData.score = e.target.value;
                }}
              />
            </Field>
            <Field
              name="grade"
              label="等级"
              decorator={{
                initialValue: certFormData.grade,
                rules: [
                  {
                    required: false,
                    message: '请输入等级',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入等级"
                onChange={e => {
                  certFormData.grade = e.target.value;
                }}
              />
            </Field>
            <Field
              name="releaseBy"
              label="颁发机构"
              decorator={{
                initialValue: certFormData.releaseBy,
                rules: [
                  {
                    required: false,
                    message: '请输入颁发机构',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入颁发机构"
                onChange={e => {
                  certFormData.releaseBy = e.target.value;
                }}
              />
            </Field>
            <Field
              name="sourceType"
              label="来源"
              decorator={{
                initialValue: certFormData.sourceType,
                rules: [
                  {
                    required: false,
                    message: '请选择来源',
                  },
                ],
              }}
            >
              <UdcSelect
                code="RES.CERTIFICATE_BY"
                placeholder="请选择来源"
                onChange={e => {
                  certFormData.sourceType = e;
                }}
              />
            </Field>
            <Field
              name="certDesc"
              label="说明"
              decorator={{
                initialValue: certFormData.certDesc,
                rules: [
                  {
                    required: false,
                    message: '请输入说明',
                  },
                  { max: 400, message: '不超过400个字' },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea
                placeholder="请输入说明"
                rows={3}
                onChange={e => {
                  certFormData.certDesc = e.target.value;
                }}
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default CertModal;
