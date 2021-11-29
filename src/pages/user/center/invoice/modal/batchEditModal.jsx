import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Input, Modal, Form } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { isEmpty, isNil } from 'ramda';
import { Selection, DatePicker } from '@/pages/gen/field';
import { selectIamUsers } from '@/services/gen/list';
import { mountToTab } from '@/layouts/routerControl';

const { Field } = FieldList;
const DOMAIN = 'invoiceList';
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
@connect(({ loading, invoiceList, user, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/batchSave`],
  invoiceList,
  user,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {},
})
@mountToTab()
class BatchEditModal extends PureComponent {
  state = {
    formData: {},
  };

  componentDidMount() {}

  handleSave = () => {
    const { form, closeModal, dispatch, selectedKeys } = this.props;
    const { formData } = this.state;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/changeOwner`,
        payload: {
          ids: selectedKeys.join(','),
          ownerId: formData.ownerId,
        },
      }).then(data => {
        closeModal('YES');
      });
    });
  };

  render() {
    const {
      loading,
      visible,
      closeModal,
      form: { getFieldDecorator },
      selectedKeys,
    } = this.props;
    return (
      <Modal
        centered
        title="归属人修改"
        visible={visible}
        destroyOnClose
        onCancel={closeModal}
        width="40%"
        footer={[
          <Button
            key="confirm"
            type="primary"
            size="large"
            htmlType="button"
            loading={loading}
            onClick={() => this.handleSave()}
          >
            保存
          </Button>,
          <Button key="cancel" type="primary" size="large" onClick={() => closeModal()}>
            取消
          </Button>,
        ]}
      >
        <Card bordered={false} className="tw-card-adjust">
          <FieldList getFieldDecorator={getFieldDecorator} col={1}>
            <Field
              name="ownerId"
              label="归属人"
              fieldCol={1}
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
              decorator={{
                rules: [{ required: true, message: '请选择归属人' }],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectIamUsers()}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth
                showSearch
                onColumnsChange={value => {
                  if (value) {
                    this.setState({
                      formData: { ownerId: value.id },
                    });
                  } else {
                    this.setState({
                      formData: { ownerId: void 0 },
                    });
                  }
                }}
                placeholder="请选择归属人"
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default BatchEditModal;
