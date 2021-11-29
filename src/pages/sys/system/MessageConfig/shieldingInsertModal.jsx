import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Input, Modal, Form } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { isEmpty, isNil } from 'ramda';
import { Selection } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const { Field } = FieldList;
const DOMAIN = 'messageConfigShielding';

@connect(({ loading, messageConfigShielding, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/save`],
  messageConfigShielding,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class ShieldingInsertModal extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanFormData` });
    dispatch({ type: `${DOMAIN}/queryReleaseSource` });
    dispatch({ type: `${DOMAIN}/res` });
  }

  handleSave = () => {
    const { form, dispatch, formData, closeModal } = this.props;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/save`,
      }).then(data => {
        closeModal();
      });
    });
  };

  render() {
    const {
      loading,
      insertModalVisible,
      closeModal,
      form: { getFieldDecorator },
      messageConfigShielding: { resDataSource, formData, releaseSourceData },
    } = this.props;
    return (
      <Modal
        title="屏蔽新增"
        visible={insertModalVisible}
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
        ]}
      >
        <Card bordered={false} className="tw-card-adjust">
          <FieldList getFieldDecorator={getFieldDecorator} col={1}>
            <Field
              name="configurationNo"
              label="发布来源"
              fieldCol={1}
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
              decorator={{
                initialValue: formData.configurationNo,
                rules: [{ required: true, message: '请输入发布来源' }],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={releaseSourceData}
                transfer={{
                  key: 'id',
                  code: 'configurationNo',
                  name: 'releaseSource',
                }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择发布来源"
              />
            </Field>
            <Field
              name="userIds"
              label="用户"
              fieldCol={1}
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
              decorator={{
                initialValue: formData.userIds,
                rules: [{ required: true, message: '请输入用户' }],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resDataSource}
                // columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择用户"
                mode="multiple"
              />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default ShieldingInsertModal;
