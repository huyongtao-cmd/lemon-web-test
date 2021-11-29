import { connect } from 'dva';
import React from 'react';
import moment from 'moment';
import { Button, Card, DatePicker, Form, Input, Modal, Radio } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect, FileManagerEnhance } from '@/pages/gen/field';
import { selectFinyears } from '@/services/sys/baseinfo/eqvacost';
import { selectUsers } from '@/services/sys/user';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'orgbuEqvaLinmon';

@connect(({ loading, orgbuEqvaLinmon, dispatch }) => ({
  loading,
  orgbuEqvaLinmon,
  dispatch,
}))
@Form.create()
class BuEqvaModal extends React.Component {
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

  // 财务年度 -> 财务期间
  handleChangeFinyear = value => {
    const { dispatch, form, formData } = this.props;
    formData.finYear = value;
    dispatch({
      type: `${DOMAIN}/updateFinPeriod`,
      payload: value,
    }).then(() => {
      formData.finPeriod = null;
      form.setFieldsValue({
        finPeriod: null,
      });
    });
  };

  // 工种 -> 工种子类
  handleChangeJobType1 = value => {
    const { dispatch, form, formData } = this.props;
    formData.jobType = value;
    dispatch({
      type: `${DOMAIN}/updateJobType2`,
      payload: value,
    }).then(() => {
      formData.jobType2 = null;
      form.setFieldsValue({
        jobType2: null,
      });
    });
  };

  render() {
    const {
      loading,
      visible,
      handleOk,
      handleCancel,
      formData,
      form: { getFieldDecorator },
      orgbuEqvaLinmon: { finPeriodData, jobType2Data },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    return (
      <Modal
        width="60%"
        destroyOnClose
        title={formData.id ? '资源当量收入修改' : '资源当量收入新增'}
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
              name="finYear"
              label="年度"
              decorator={{
                initialValue: formData.finYear,
                rules: [
                  {
                    required: false,
                    message: '请选择年度',
                  },
                ],
              }}
            >
              <UdcSelect
                source={() => selectFinyears().then(resp => resp.response)}
                placeholder="请选择年度"
                showSearch
                onChange={this.handleChangeFinyear}
              />
            </Field>
            <Field
              name="finPeriod"
              label="期间"
              decorator={{
                initialValue: formData.finPeriod,
                rules: [
                  {
                    required: false,
                    message: '请选择核算期间',
                  },
                ],
              }}
            >
              <UdcSelect
                source={finPeriodData}
                placeholder="请选择核算期间"
                onChange={e => {
                  formData.finPeriod = e;
                }}
              />
            </Field>
            <Field
              name="jobType"
              label="工种"
              decorator={{
                initialValue: formData.jobType,
                rules: [
                  {
                    required: false,
                    message: '请选择工种',
                  },
                ],
              }}
            >
              <UdcSelect
                code="COM.JOB_TYPE1"
                placeholder="请选择工种"
                onChange={this.handleChangeJobType1}
              />
            </Field>
            <Field
              name="jobType2"
              label="工种子类"
              decorator={{
                initialValue: formData.jobType2,
                rules: [
                  {
                    required: false,
                    message: '请选择工种子类',
                  },
                ],
              }}
            >
              <UdcSelect
                source={jobType2Data}
                placeholder="请选择工种子类"
                onChange={e => {
                  formData.jobType2 = e;
                }}
              />
            </Field>
            <Field
              name="coopType"
              label="合作方式"
              decorator={{
                initialValue: formData.coopType,
                rules: [
                  {
                    required: true,
                    message: '请选择合作方式',
                  },
                ],
              }}
            >
              <UdcSelect
                code="COM.COOPERATION_MODE"
                placeholder="请选择合作方式"
                onChange={e => {
                  formData.coopType = e;
                }}
              />
            </Field>
            <Field
              name="cityLevel"
              label="城市级别"
              decorator={{
                initialValue: formData.cityLevel,
                rules: [
                  {
                    required: false,
                    message: '请选择城市级别',
                  },
                ],
              }}
            >
              <UdcSelect
                code="COM.CITY_LEVEL"
                placeholder="请选择城市级别"
                onChange={e => {
                  formData.cityLevel = e;
                }}
              />
            </Field>
            <Field
              name="resId"
              label="资源名称"
              decorator={{
                initialValue: formData.resId,
                rules: [
                  {
                    required: false,
                    message: '请选择资源名称',
                  },
                ],
              }}
            >
              <UdcSelect
                source={() => selectUsers().then(resp => resp.response)}
                placeholder="请选择资源名称"
                showSearch
                onChange={e => {
                  formData.resId = e;
                }}
              />
            </Field>
            <Field
              name="preeqvaAmt"
              label="单位当量收入"
              decorator={{
                initialValue: formData.preeqvaAmt,
                rules: [
                  {
                    required: true,
                    message: '请输入单位当量收入',
                  },
                ],
              }}
            >
              <Input
                placeholder="请输入单位当量收入"
                onChange={e => {
                  formData.preeqvaAmt = e.target.value;
                }}
              />
            </Field>
            <Field
              name="lineStatus"
              label="状态"
              decorator={{
                initialValue:
                  formData.lineStatus && formData.lineStatus.length > 1
                    ? formData.lineStatus
                    : 'ACTIVE',
                rules: [
                  {
                    required: true,
                    message: '请选择状态',
                  },
                ],
              }}
            >
              <UdcSelect
                code="COM.STATUS1"
                placeholder="请选择状态"
                onChange={e => {
                  formData.lineStatus = e;
                }}
              />
            </Field>
            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: formData.remark,
                rules: [
                  {
                    required: false,
                    message: '请输入备注',
                  },
                  { max: 400, message: '不超过400个字' },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea
                placeholder="请输入备注"
                rows={3}
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

export default BuEqvaModal;
