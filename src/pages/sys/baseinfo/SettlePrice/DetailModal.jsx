import { connect } from 'dva';
import React from 'react';
import moment from 'moment';
import { Button, Card, DatePicker, Form, Input, Modal, Radio } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect, Selection } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectActiveBu } from '@/services/gen/list';
import { selectFinyears } from '@/services/sys/baseinfo/eqvacost';
import { selectUsers } from '@/services/sys/user';
import { selectProjectConditional } from '@/services/user/project/project';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'sysBasicSettlePrice';
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, sysBasicSettlePrice, dispatch }) => ({
  loading,
  sysBasicSettlePrice,
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
    formData.jobType1 = value;
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
      sysBasicSettlePrice: { finPeriodData, jobType2Data },
      form: { getFieldDecorator },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    return (
      <Modal
        width="60%"
        destroyOnClose
        title={formData.id ? '当量结算定价修改' : '当量结算定价新增'}
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
              name="fromBuDealtype"
              label="FromBU结算码"
              decorator={{
                initialValue: formData.fromBuDealtype,
                rules: [
                  {
                    required: false,
                    message: '请选择FromBU结算类型码',
                  },
                ],
              }}
            >
              <UdcSelect
                code="ORG:BU_SETTLE_TYPE"
                placeholder="请选择FromBU结算类型码"
                onChange={e => {
                  formData.fromBuDealtype = e;
                }}
              />
            </Field>
            <Field
              name="toBuDealtype"
              label="TOBU结算码"
              decorator={{
                initialValue: formData.toBuDealtype,
                rules: [
                  {
                    required: false,
                    message: '请选择TOBU结算类型码',
                  },
                ],
              }}
            >
              <UdcSelect
                code="ORG:BU_SETTLE_TYPE"
                placeholder="请选择TOBU结算类型码"
                onChange={e => {
                  formData.toBuDealtype = e;
                }}
              />
            </Field>
            <Field
              name="fromBuId"
              label="FromBU"
              decorator={{
                initialValue: formData.fromBuId && formData.fromBuId + '',
                rules: [
                  {
                    required: false,
                    message: '请选择FromBU',
                  },
                ],
              }}
            >
              <AsyncSelect
                source={() => selectActiveBu().then(resp => resp.response)}
                placeholder="请选择FromBU"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={e => {
                  formData.fromBuId = e;
                }}
              />
            </Field>
            <Field
              name="toBuId"
              label="ToBU"
              decorator={{
                initialValue: formData.toBuId && formData.toBuId + '',
                rules: [
                  {
                    required: false,
                    message: '请选择ToBU',
                  },
                ],
              }}
            >
              <Selection.ColumnsForBu
                onChange={e => {
                  formData.toBuId = e;
                }}
              />
            </Field>
            <Field
              name="jobType1"
              label="工种"
              decorator={{
                initialValue: formData.jobType1,
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
              name="resId"
              label="资源名称"
              decorator={{
                initialValue: formData.resId,
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
              name="projId"
              label="相关项目"
              decorator={{
                initialValue: formData.projId,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectProjectConditional({ projStatus: 'ACTIVE' })}
                columns={SEL_COL}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
                onColumnsChange={value => {
                  formData.projId = value.id;
                }}
              />
            </Field>
            <Field
              name="finYear"
              label="核算年度"
              decorator={{
                initialValue: formData.finYear && formData.finYear + '',
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
                initialValue: formData.finPeriod && formData.finPeriod + '',
                rules: [{ required: false, message: '请选择核算期间' }],
              }}
            >
              <AsyncSelect
                source={finPeriodData}
                placeholder="请选择核算期间"
                onChange={e => {
                  formData.finPeriod = e;
                }}
              />
            </Field>
            <Field
              name="markupPercent"
              label="markup百分比"
              decorator={{
                initialValue: formData.markupPercent && formData.markupPercent + '',
                rules: [
                  {
                    required: false,
                    message: '请输入markup百分比',
                  },
                  {
                    pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                    message: '请输入浮点数',
                  },
                  { max: 16, message: '位数不能超过16' },
                ],
              }}
            >
              <Input
                placeholder="请输入markup百分比"
                onChange={e => {
                  formData.markupPercent = e.target.value;
                }}
              />
            </Field>
            <Field
              name="markupSolid"
              label="markup金额"
              decorator={{
                initialValue: formData.markupSolid && formData.markupSolid + '',
                rules: [
                  {
                    required: false,
                    message: '请输入markup固定金额',
                  },
                  {
                    pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                    message: '请输入浮点数',
                  },
                  { max: 16, message: '位数不能超过16' },
                ],
              }}
            >
              <Input
                placeholder="请输入markup固定金额"
                onChange={e => {
                  formData.markupSolid = e.target.value;
                }}
              />
            </Field>
            <Field
              name="absoluteAmt"
              label="结算绝对金额"
              decorator={{
                initialValue: formData.absoluteAmt && formData.absoluteAmt + '',
                rules: [
                  {
                    required: false,
                    message: '请输入结算绝对金额',
                  },
                  {
                    pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                    message: '请输入浮点数',
                  },
                  { max: 16, message: '位数不能超过16' },
                ],
              }}
            >
              <Input
                placeholder="请输入结算绝对金额"
                onChange={e => {
                  formData.absoluteAmt = e.target.value;
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
