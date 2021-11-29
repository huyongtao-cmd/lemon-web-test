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
import { selectAllRoles } from '@/services/sys/system/datapower';
import { selectIamUsers, selectPageBlock, selectPageField } from '@/services/gen/list';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const DOMAIN = 'businessPagePermissionModal';

@connect(({ loading, businessPagePermissionModal, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/save`],
  ...businessPagePermissionModal,
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
class BusinessPagePermissionModal extends PureComponent {
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
    const { dispatch, formData, onOk, pageField, buPageField } = this.props;
    if (formData.allowType === 'FIELD') {
      const res = pageField.filter(item => item.fieldKey === formData.allowValue);
      dispatch({
        type: `${DOMAIN}/save`,
        payload: { ...formData, remark: res[0] && res[0].displayName ? res[0].displayName : '' },
      }).then(() => {
        typeof onOk === 'function' && onOk();
      });
    } else if (formData.allowType === 'BUFIELD') {
      const res = buPageField.filter(item => item.fieldKey === formData.allowValue);
      dispatch({
        type: `${DOMAIN}/save`,
        payload: { ...formData, remark: res[0] && res[0].displayName ? res[0].displayName : '' },
      }).then(() => {
        typeof onOk === 'function' && onOk();
      });
    } else {
      dispatch({
        type: `${DOMAIN}/save`,
        payload: formData,
      }).then(() => {
        typeof onOk === 'function' && onOk();
      });
    }
  };

  // 当选中的允许类型为表单资源字段时，获取表单资源字段下拉数据
  handleAllowBlock = value => {
    const { dispatch } = this.props;
    value &&
      dispatch({
        type: `${DOMAIN}/queryPageField`,
        payload: value,
      });
  };

  // 当选中的允许类型为表单BU字段时，获取表单BU字段下拉数据
  handleBUAllowBlock = value => {
    const { dispatch } = this.props;
    value &&
      dispatch({
        type: `${DOMAIN}/queryBUPageField`,
        payload: {
          businessType: 'BU',
          key: value,
        },
      });
  };

  onChangeValue = value => {
    const {
      formData,
      dispatch,
      form: { setFieldsValue },
    } = this.props;
    if (value !== formData.allowType && (value === 'FIELD' || value === 'BUFIELD')) {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          allowValue: undefined,
          allowBlock: undefined,
        },
      });
      setFieldsValue({
        allowValue: undefined,
        allowBlock: undefined,
      });
    }
  };

  getAllowValueField = () => {
    const { dispatch, pageId, formData, onOk } = this.props;
    let returnField;
    switch (formData.allowType) {
      case 'ROLE': {
        returnField = (
          <Field
            name="allowValue"
            label="允许角色"
            decorator={{
              initialValue: formData.allowValue,
              rules: [{ required: true, message: '请选择' }],
            }}
          >
            <Selection.Columns
              className="x-fill-100"
              source={() => selectAllRoles({})}
              columns={[
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'code', code: 'code', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          </Field>
        );
        break;
      }
      case 'USER': {
        returnField = (
          <Field
            name="allowValue"
            label="允许用户"
            decorator={{
              initialValue: formData.allowValue,
              rules: [{ required: true, message: '请选择' }],
            }}
          >
            <Selection.Columns
              className="x-fill-100"
              source={() => selectIamUsers({})}
              // columns={[
              //   { dataIndex: 'name', title: '姓名', span: 14 },
              // ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          </Field>
        );
        break;
      }
      default: {
        returnField = <></>;
      }
    }
    return returnField;
  };

  render() {
    const {
      visible,
      onCancel,
      pageId,
      formData,
      pageField,
      buPageField, // 允许表单bu字段
      form: { getFieldDecorator },
      dispatch,
      ...rest
    } = this.props;

    return (
      <Modal
        title="权限添加"
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
        {...rest}
      >
        <Card bordered={false} className="tw-card-adjust">
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="allowType"
              label="允许类型"
              decorator={{
                initialValue: formData.allowType,
                rules: [{ required: true, message: '请选择' }],
              }}
            >
              <Select onChange={this.onChangeValue}>
                <Option value="ROLE">角色</Option>
                <Option value="USER">用户</Option>
                <Option value="FIELD">表单资源字段</Option>
                <Option value="BUFIELD">表单BU字段</Option>
              </Select>
            </Field>
            {formData.allowType === 'FIELD' ? (
              <Field
                name="allowBlock"
                label="允许表单区域"
                decorator={{
                  initialValue: formData.allowBlock,
                  rules: [{ required: true, message: '请选择' }],
                }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={() => selectPageBlock(pageId)}
                  columns={[
                    { dataIndex: 'tableDesc', title: '关联表', span: 10 },
                    { dataIndex: 'blockPageName', title: '区域名称', span: 14 },
                  ]}
                  transfer={{ key: 'id', code: 'id', name: 'blockPageName' }}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 440 }}
                  showSearch
                  onChange={this.handleAllowBlock}
                />
              </Field>
            ) : (
              ''
            )}
            {formData.allowType === 'FIELD' ? (
              <Field
                name="allowValue"
                label="允许表单资源字段"
                decorator={{
                  initialValue: formData.allowValue,
                  rules: [{ required: true, message: '请选择' }],
                }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={pageField}
                  columns={[
                    { dataIndex: 'fieldKey', title: '字段KEY', span: 10 },
                    { dataIndex: 'displayName', title: '显示名称', span: 14 },
                  ]}
                  transfer={{ key: 'id', code: 'fieldKey', name: 'displayName' }}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 440 }}
                  showSearch
                />
              </Field>
            ) : (
              ''
            )}

            {formData.allowType === 'BUFIELD' ? (
              <Field
                name="allowBlock"
                label="允许表单区域"
                decorator={{
                  initialValue: formData.allowBlock,
                  rules: [{ required: true, message: '请选择' }],
                }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={() => selectPageBlock(pageId)}
                  columns={[
                    { dataIndex: 'tableDesc', title: '关联表', span: 10 },
                    { dataIndex: 'blockPageName', title: '区域名称', span: 14 },
                  ]}
                  transfer={{ key: 'id', code: 'id', name: 'blockPageName' }}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 440 }}
                  showSearch
                  onChange={this.handleBUAllowBlock}
                />
              </Field>
            ) : (
              ''
            )}

            {formData.allowType === 'BUFIELD' ? (
              <Field
                name="allowValue"
                label="允许表单BU字段"
                decorator={{
                  initialValue: formData.allowValue,
                  rules: [{ required: true, message: '请选择' }],
                }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={buPageField}
                  columns={[
                    { dataIndex: 'fieldKey', title: '字段KEY', span: 10 },
                    { dataIndex: 'displayName', title: '显示名称', span: 14 },
                  ]}
                  transfer={{ key: 'id', code: 'fieldKey', name: 'displayName' }}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 440 }}
                  showSearch
                />
              </Field>
            ) : (
              ''
            )}
            {this.getAllowValueField()}
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default BusinessPagePermissionModal;
