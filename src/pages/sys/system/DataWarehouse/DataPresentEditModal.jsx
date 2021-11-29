// 最常用的引入,基本每个页面都需要的组件
import React, { PureComponent } from 'react';
import {
  Button,
  Card,
  Input,
  Select,
  Form,
  InputNumber,
  Tooltip,
  Checkbox,
  TreeSelect,
  Switch,
  Modal,
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { Selection, DatePicker } from '@/pages/gen/field';
import router from 'umi/router';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const DOMAIN = 'dataPresentEdit';

@connect(({ loading, dataPresentEdit, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`],
  ...dataPresentEdit,
  dispatch,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      fields[key] = Form.createFormField(formData[key]);
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };
    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class DataPresentEditModal extends PureComponent {
  componentDidMount() {
    const { dispatch, formData } = this.props;
    const param = fromQs();
    if (param.id) {
      // 编辑模式
      this.fetchData(param);
    } else {
      // 新增模式
      dispatch({
        type: `${DOMAIN}/clearForm`,
      });
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { editorContent: '' },
      });
    }
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id: params.id },
    });
  };

  handleFields = () => {
    const {
      extractInfo,
      formData,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;

    const fields = [];
    if (extractInfo && extractInfo.detailViews) {
      extractInfo.detailViews.forEach(column => {
        fields.push(
          <Field
            name={column.databaseColumn}
            label={column.columnTitle}
            key={column.databaseColumn}
            decorator={{
              initialValue: formData[column.databaseColumn],
              rules: [{ required: false, message: '请输入' }],
            }}
          >
            <Input style={{ width: '100%' }} />
          </Field>
        );
      });
    }
    return fields;
  };

  handleSave = () => {
    const { form, dispatch, formData, onOk, presentNo } = this.props;
    const copyObj = {};
    if (formData.copy) {
      copyObj.id = undefined;
    }

    form.validateFields((error, values) => {
      if (error) {
        return;
      }

      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          ...formData,
          ...values,
          ...copyObj,
          presentNo,
        },
      }).then(data => {
        typeof onOk === 'function' && onOk(data);
      });
    });
  };

  render() {
    const {
      visible,
      loading,
      formData,
      extractInfo,
      onCancel,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;

    return (
      <Modal
        title="数据编辑"
        width="80%"
        visible={visible}
        okText="确认"
        onOk={this.handleOk}
        onCancel={onCancel}
        cancelText="取消"
        footer={[
          <Button
            key="confirm"
            type="primary"
            size="large"
            htmlType="button"
            onClick={() => this.handleSave()}
          >
            保存
          </Button>,
        ]}
      >
        <Card bordered={false} className="tw-card-adjust">
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            {this.handleFields()}
          </FieldList>

          <br />
        </Card>
      </Modal>
    );
  }
}

export default DataPresentEditModal;
