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
  Modal,
  Switch,
} from 'antd';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import Link from 'umi/link';
import router from 'umi/router';
import update from 'immutability-helper';

// 比较常用的本框架的组件
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import { Selection, DatePicker } from '@/pages/gen/field';
import EditableDataTable from '@/components/common/EditableDataTable';

// service 方法
import { selectBusinessTableConditional } from '@/services/sys/system/pageConfig';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const DOMAIN = 'businessPageMainModal';

@connect(({ loading, businessPageMainModal, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/save`],
  ...businessPageMainModal,
  dispatch,
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

    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class BusinessPageMainModal extends PureComponent {
  componentDidMount() {}

  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  handleSave = () => {
    const { form, dispatch, formData, pageFieldEntities, onOk } = this.props;

    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          ...formData,
          pageFieldEntities,
        },
      }).then(data => {
        typeof onOk === 'function' && onOk(data);
      });
    });
  };

  render() {
    const {
      visible,
      onCancel,
      formData,
      form: { getFieldDecorator },
      dispatch,
    } = this.props;

    return (
      <Modal
        title="页面编辑"
        visible={visible}
        onOk={this.onSelectTmp}
        onCancel={onCancel}
        width="80%"
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
            <Field
              name="pageNo"
              label="页面编号"
              decorator={{
                initialValue: formData.pageNo,
                rules: [{ required: true, message: '请输入页面编号' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="pageName"
              label="页面名称"
              decorator={{
                initialValue: formData.pageName,
                rules: [{ required: false, message: '请输入页面名称' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="remark"
              label="备注"
              fieldCol={1}
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 21 }}
              decorator={{
                initialValue: formData.remark,
                rules: [{ required: false, message: '请输入备注' }],
              }}
            >
              <Input.TextArea placeholder="请输入备注" rows={3} />
            </Field>
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default BusinessPageMainModal;
