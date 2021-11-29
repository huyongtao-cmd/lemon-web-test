import React from 'react';
import { Card, Form, Modal, Select, Switch } from 'antd';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectAllRoles } from '@/services/sys/system/datapower';

const { Field } = FieldList;
const fieldLayout = {
  labelCol: { span: 10, xxl: 8 },
  wrapperCol: { span: 14, xxl: 14 },
};

@Form.create()
class DatapowerCreateModal extends React.Component {
  state = {
    roleCode: null,
    strategy: null,
    initPower: 1,
  };

  // 保存按钮
  handleSave = e => {
    const {
      form: { validateFieldsAndScroll },
      handleOk,
    } = this.props;
    const formData = this.state;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        handleOk.apply(this.state, [e, formData]);
      }
    });
  };

  render() {
    const {
      visible,
      handleCancel,
      form: { getFieldDecorator },
    } = this.props;
    // const { roleCode, strategy } = this.state;

    return (
      <Modal
        width="50%"
        destroyOnClose
        title="角色数据权限新增"
        visible={visible}
        onOk={this.handleSave}
        onCancel={handleCancel}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2} noReactive>
            <Field
              name="roleCode"
              label="角色"
              decorator={{
                // initialValue: roleCode,
                rules: [
                  {
                    required: true,
                    message: '请选择角色',
                  },
                ],
              }}
              {...fieldLayout}
            >
              <AsyncSelect
                source={() => selectAllRoles().then(resp => resp.response)}
                placeholder="请选择角色"
                showSearch
                onChange={e => {
                  this.setState({ roleCode: e });
                }}
              />
            </Field>

            <Field
              name="strategy"
              label="权限控制策略"
              decorator={{
                // initialValue: strategy,
                rules: [
                  {
                    required: true,
                    message: '请选择权限控制策略',
                  },
                ],
              }}
              {...fieldLayout}
            >
              <Select
                name="strategy"
                allowClear
                onChange={e => {
                  this.setState({ strategy: e });
                }}
              >
                <Select.Option value="RES">本人权限</Select.Option>
                <Select.Option value="RESSUB">本人及下属权限</Select.Option>
                <Select.Option value="BU">本BU权限</Select.Option>
                <Select.Option value="BUSUB">本BU及下级BU权限</Select.Option>
                <Select.Option value="PLAT">平台级权限</Select.Option>
              </Select>
            </Field>
            <Field
              name="initPower"
              label="初始化功能权限"
              decorator={
                {
                  // initialValue: strategy,
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: '请选择初始化功能权限',
                  //   },
                  // ],
                }
              }
              {...fieldLayout}
            >
              <Switch
                checkedChildren="是"
                unCheckedChildren="否"
                defaultChecked
                onChange={checked => this.setState({ initPower: checked ? 1 : 0 })}
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default DatapowerCreateModal;
