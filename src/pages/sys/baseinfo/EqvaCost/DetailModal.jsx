import { connect } from 'dva';
import React from 'react';
import moment from 'moment';
import { Button, Card, DatePicker, Form, Input, Modal, Radio } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectBus } from '@/services/org/bu/bu';
import { selectFinyears } from '@/services/sys/baseinfo/eqvacost';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'sysBasicEqvaCost';

@connect(({ loading, sysBasicEqvaCost, dispatch }) => ({
  loading,
  sysBasicEqvaCost,
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
class DetailModal extends React.Component {
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
    const { dispatch, form, eqvaCostFormData } = this.props;
    eqvaCostFormData.finYear = value;
    dispatch({
      type: `${DOMAIN}/updateFinPeriod`,
      payload: value,
    }).then(() => {
      eqvaCostFormData.finPeriod = null;
      form.setFieldsValue({
        finPeriod: null,
      });
    });
  };

  // 工种 -> 工种子类
  handleChangeJobType1 = value => {
    const { dispatch, form, eqvaCostFormData } = this.props;
    eqvaCostFormData.jobType1 = value;
    dispatch({
      type: `${DOMAIN}/updateJobType2`,
      payload: value,
    }).then(() => {
      eqvaCostFormData.jobType2 = null;
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
      eqvaCostFormData,
      sysBasicEqvaCost: { finPeriodData, jobType2Data },
      form: { getFieldDecorator },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    return (
      <Modal
        width="60%"
        destroyOnClose
        title={eqvaCostFormData.id ? '当量成本修改' : '当量成本新增'}
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
          <FieldList layout="horizontal" legend="" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="busifieldType"
              label="平台"
              decorator={{
                initialValue: eqvaCostFormData.busifieldType,
                rules: [
                  {
                    required: true,
                    message: '请选择平台',
                  },
                ],
              }}
            >
              <UdcSelect
                code="COM.BUSIFIELD_TYPE"
                placeholder="请选择平台"
                onChange={e => {
                  eqvaCostFormData.busifieldType = e;
                }}
              />
            </Field>
            <Field
              name="buId"
              label="BU"
              decorator={{
                initialValue: eqvaCostFormData.buId && eqvaCostFormData.buId + '',
                rules: [
                  {
                    required: false,
                    message: '请选择BU',
                  },
                ],
              }}
            >
              <AsyncSelect
                source={() => selectBus().then(resp => resp.response)}
                placeholder="请选择BU"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={e => {
                  eqvaCostFormData.buId = e;
                }}
              />
            </Field>
            <Field
              name="eqvaName"
              label="当量名称"
              decorator={{
                initialValue: eqvaCostFormData.eqvaName,
                rules: [
                  {
                    required: true,
                    message: '请选择当量名称',
                  },
                ],
              }}
            >
              <UdcSelect
                code="ACC.EQVA_TYPE"
                placeholder="请选择当量名称"
                onChange={e => {
                  eqvaCostFormData.eqvaName = e;
                }}
              />
            </Field>
            <Field
              name="jobType1"
              label="工种"
              decorator={{
                initialValue: eqvaCostFormData.jobType1,
                rules: [
                  {
                    required: true,
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
                initialValue: eqvaCostFormData.jobType2,
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
                  eqvaCostFormData.jobType2 = e;
                }}
              />
            </Field>
            <Field
              name="finYear"
              label="核算年度"
              decorator={{
                initialValue: eqvaCostFormData.finYear && eqvaCostFormData.finYear + '',
                rules: [
                  {
                    required: true,
                    message: '请选择核算年度',
                  },
                ],
              }}
            >
              <AsyncSelect
                source={() => selectFinyears().then(resp => resp.response)}
                placeholder="请选择核算年度"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={this.handleChangeFinyear}
              />
            </Field>
            <Field
              name="finPeriod"
              label="核算期间"
              decorator={{
                initialValue: eqvaCostFormData.finPeriod && eqvaCostFormData.finPeriod + '',
                rules: [{ required: false, message: '请选择核算期间' }],
              }}
            >
              <AsyncSelect
                source={finPeriodData}
                placeholder="请选择核算期间"
                onChange={e => {
                  eqvaCostFormData.finPeriod = e;
                }}
              />
            </Field>
            <Field
              name="eqvaCost"
              label="当量成本"
              decorator={{
                initialValue: eqvaCostFormData.eqvaCost && eqvaCostFormData.eqvaCost + '',
                rules: [
                  {
                    required: true,
                    message: '请输入当量成本',
                  },
                  {
                    pattern: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/,
                    message: '请输入大于0的浮点数',
                  },
                  { max: 16, message: '位数不能超过16' },
                ],
              }}
            >
              <Input
                placeholder="请输入当量成本"
                onChange={e => {
                  eqvaCostFormData.eqvaCost = e.target.value;
                }}
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default DetailModal;
