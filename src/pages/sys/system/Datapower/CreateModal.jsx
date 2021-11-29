import { connect } from 'dva';
import React from 'react';
import { Card, Form, Modal, Select } from 'antd';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import { findDataList } from '@/services/sys/system/datapower';

const { Field } = FieldList;

const DOMAIN = 'sysSystemDatapowerDetail';

@connect(({ loading, sysSystemDatapowerDetail, dispatch }) => ({
  loading,
  sysSystemDatapowerDetail,
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
class CreateModal extends React.Component {
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
      datapowerFormData,
      form: { getFieldDecorator },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    return (
      <Modal
        width="60%"
        destroyOnClose
        title="角色数据权限新增"
        visible={visible}
        onOk={this.handleSave}
        onCancel={handleCancel}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList layout="horizontal" legend="" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="dataPowerRuleId"
              label="功能表"
              decorator={{
                initialValue:
                  datapowerFormData.dataPowerRuleId && datapowerFormData.dataPowerRuleId + '',
                rules: [
                  {
                    required: true,
                    message: '请选择功能表',
                  },
                ],
              }}
            >
              <AsyncSelect
                source={() => findDataList().then(resp => resp.response)}
                placeholder="请选择功能表"
                showSearch
                onChange={e => {
                  datapowerFormData.dataPowerRuleId = e;
                }}
              />
            </Field>
            <Field
              name="strategy"
              label="权限控制策略"
              decorator={{
                initialValue: datapowerFormData.strategy && datapowerFormData.strategy + '',
                rules: [
                  {
                    required: true,
                    message: '请选择权限控制策略',
                  },
                ],
              }}
            >
              <Select
                name="strategy"
                allowClear
                onChange={e => {
                  datapowerFormData.strategy = e;
                }}
              >
                <Select.Option value="RES">本人权限</Select.Option>
                <Select.Option value="RESSUB">本人及下属权限</Select.Option>
                <Select.Option value="BU">本BU权限</Select.Option>
                <Select.Option value="BUSUB">本BU及下级BU权限</Select.Option>
                <Select.Option value="PLAT">平台级权限</Select.Option>
              </Select>
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default CreateModal;
